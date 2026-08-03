# Dokumen Arsitektur 1 — Multi-Tenant Schema Design
# SIAKAD Enterprise Platform
# Status: FINAL — Acuan untuk semua migration

---

## Strategi Multi-Tenant

**Pilihan: Shared Database + `school_id` per tabel dengan Global Scope**

Setiap baris data di tabel operasional selalu punya `school_id`.
Laravel Global Scope otomatis menyuntikkan `WHERE school_id = ?` di semua query.
Isolasi antar tenant dijamin di level aplikasi, bukan level database.

---

## Klasifikasi Tabel

### Tabel GLOBAL (tidak pakai school_id)
Tabel ini shared antar semua tenant. Data di sini bukan milik satu sekolah.

```
plans                   -- paket langganan (Basic, Pro, Enterprise)
plan_features           -- fitur yang tersedia per paket
schools                 -- daftar tenant/sekolah
school_subscriptions    -- langganan sekolah ke plan tertentu
school_domains          -- domain/subdomain per sekolah
personal_access_tokens  -- token Sanctum (sudah ada school_id via user)
password_reset_tokens
cache / cache_locks
sessions
jobs / failed_jobs
migrations
```

### Tabel PLATFORM (school_id nullable — milik platform, dikopi ke tenant)
```
permission_templates    -- template permission default saat sekolah baru dibuat
role_templates          -- template role default (operator, guru, kepsek, dll)
```

### Tabel OPERASIONAL (wajib school_id NOT NULL)
Semua tabel lain — semua data akademik, kepegawaian, keuangan milik satu sekolah.

---

## Schema Detail

### 1. schools
```sql
CREATE TABLE schools (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ulid          CHAR(26) NOT NULL UNIQUE,           -- public identifier, tidak expose integer ID
  nama          VARCHAR(150) NOT NULL,
  npsn          VARCHAR(10) UNIQUE,                  -- Nomor Pokok Sekolah Nasional
  jenis         ENUM('MI','MTs','MA','SD','SMP','SMA','SMK') NOT NULL DEFAULT 'MI',
  status        ENUM('active','suspended','trial','cancelled') NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMP NULL,
  logo          VARCHAR(255) NULL,
  timezone      VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
  locale        VARCHAR(10) NOT NULL DEFAULT 'id',
  created_at    TIMESTAMP NULL,
  updated_at    TIMESTAMP NULL,
  deleted_at    TIMESTAMP NULL,

  INDEX idx_schools_status (status),
  INDEX idx_schools_ulid (ulid)
);
```

### 2. school_settings
```sql
-- Menggantikan tabel pengaturans yang ada.
-- Key-value per sekolah, dikelompokkan per grup.
CREATE TABLE school_settings (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id  BIGINT UNSIGNED NOT NULL,
  key        VARCHAR(80) NOT NULL,
  value      TEXT NULL,
  grup       VARCHAR(40) NULL,               -- sekolah|akademik|keuangan|notifikasi|tampilan|smtp
  deskripsi  VARCHAR(255) NULL,
  updated_at TIMESTAMP NULL,
  updated_by BIGINT UNSIGNED NULL,

  UNIQUE KEY uq_school_settings (school_id, key),
  KEY idx_school_settings_grup (school_id, grup),
  CONSTRAINT fk_ss_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Contoh key yang wajib ada saat sekolah baru dibuat (di-seed via SchoolSeeder):
-- sekolah.nama_lengkap, sekolah.nama_singkat, sekolah.alamat
-- sekolah.kota, sekolah.provinsi, sekolah.kode_pos
-- sekolah.no_telp, sekolah.email, sekolah.website
-- sekolah.kepala_sekolah, sekolah.nip_kepala
-- akademik.kkm_default, akademik.kurikulum_default
-- tampilan.primary_color, tampilan.theme
-- smtp.host, smtp.port, smtp.username, smtp.password, smtp.from_name
```

### 3. school_domains
```sql
CREATE TABLE school_domains (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT UNSIGNED NOT NULL,
  domain    VARCHAR(100) NOT NULL UNIQUE,   -- bisa subdomain: sdn1bogor.siakad.id
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL,

  KEY idx_domains_school (school_id),
  CONSTRAINT fk_domains_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);
```

### 4. plans & plan_features
```sql
CREATE TABLE plans (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(30) NOT NULL UNIQUE,  -- basic, pro, enterprise
  nama        VARCHAR(60) NOT NULL,
  harga_bulan DECIMAL(12,2) NOT NULL DEFAULT 0,
  harga_tahun DECIMAL(12,2) NOT NULL DEFAULT 0,
  max_users   SMALLINT UNSIGNED NULL,       -- NULL = unlimited
  max_storage_gb SMALLINT UNSIGNED NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL
);

CREATE TABLE plan_features (
  id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id  BIGINT UNSIGNED NOT NULL,
  feature  VARCHAR(80) NOT NULL,            -- module slug: akademik, keuangan, ppdb, dms
  value    VARCHAR(255) NULL,               -- NULL = enabled, angka = limit, 'false' = disabled
  UNIQUE KEY uq_plan_features (plan_id, feature),
  CONSTRAINT fk_pf_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);
```

### 5. users (dimodifikasi dari yang ada)
```sql
-- Tambah school_id. User selalu milik satu sekolah.
-- Super admin platform (school_id NULL) dihandle terpisah via tabel platform_admins.
CREATE TABLE users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id       BIGINT UNSIGNED NOT NULL,           -- TAMBAHAN untuk multi-tenant
  ulid            CHAR(26) NOT NULL UNIQUE,
  name            VARCHAR(150) NOT NULL,
  username        VARCHAR(50) NULL,
  email           VARCHAR(150) NOT NULL,
  email_verified_at TIMESTAMP NULL,
  password        VARCHAR(255) NOT NULL,
  foto            VARCHAR(255) NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at   TIMESTAMP NULL,
  last_login_ip   VARCHAR(45) NULL,
  remember_token  VARCHAR(100) NULL,
  created_at      TIMESTAMP NULL,
  updated_at      TIMESTAMP NULL,
  deleted_at      TIMESTAMP NULL,

  -- Email unik PER SEKOLAH (bukan global) supaya guru di sekolah A
  -- bisa punya email yang sama dengan guru di sekolah B
  UNIQUE KEY uq_users_email_school (school_id, email),
  UNIQUE KEY uq_users_username_school (school_id, username),
  UNIQUE KEY uq_users_ulid (ulid),
  KEY idx_users_school (school_id),
  CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);
```

### 6. roles (dimodifikasi — per sekolah)
```sql
CREATE TABLE roles (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id   BIGINT UNSIGNED NOT NULL,               -- TAMBAHAN: role milik sekolah ini
  slug        VARCHAR(30) NOT NULL,
  nama        VARCHAR(60) NOT NULL,
  deskripsi   VARCHAR(255) NULL,
  is_system   TINYINT(1) NOT NULL DEFAULT 0,           -- 1 = role bawaan, tidak bisa dihapus
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL,

  UNIQUE KEY uq_roles_slug_school (school_id, slug),  -- slug unik per sekolah
  KEY idx_roles_school (school_id),
  CONSTRAINT fk_roles_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);
```

### 7. permissions (BARU — belum ada di schema lama)
```sql
CREATE TABLE permissions (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id   BIGINT UNSIGNED NOT NULL,
  slug        VARCHAR(80) NOT NULL,    -- contoh: guru.view, guru.create, dokumen.approve
  nama        VARCHAR(100) NOT NULL,
  modul       VARCHAR(40) NOT NULL,    -- guru, siswa, keuangan, akademik, dll
  deskripsi   VARCHAR(255) NULL,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL,

  UNIQUE KEY uq_permissions_slug_school (school_id, slug),
  KEY idx_permissions_school_modul (school_id, modul),
  CONSTRAINT fk_permissions_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);
```

### 8. role_permissions (BARU)
```sql
CREATE TABLE role_permissions (
  role_id       BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

### 9. user_roles (dimodifikasi)
```sql
CREATE TABLE user_roles (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  role_id    BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,

  UNIQUE KEY uq_user_roles (user_id, role_id),
  KEY idx_user_roles_role (role_id),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

### 10. platform_admins (BARU — Super Admin platform, bukan tenant)
```sql
CREATE TABLE platform_admins (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL
);
```

---

## Tabel Operasional — school_id Wajib

Semua tabel di bawah ditambah `school_id BIGINT UNSIGNED NOT NULL` sebagai kolom kedua (setelah `id`), dengan FK ke `schools.id` ON DELETE CASCADE, dan index `KEY idx_{table}_school (school_id)`.

```
gurus                   + school_id
siswas                  + school_id
orang_tuas              + school_id
kelas                   + school_id
tahun_ajarans           + school_id   (UNIQUE uq_ta berubah jadi per school_id)
semesters               + school_id
mapels                  + school_id
jadwals                 + school_id
plot_guru_mapels        + school_id
absensis                + school_id
guru_absensis           + school_id
riwayat_kelas           + school_id
mutasi_siswas           + school_id
pengumumans             + school_id
galeris                 + school_id
kalender_akademiks      + school_id
activity_logs           + school_id
guru_import_logs        + school_id

-- Tabel child (guru) -- tidak perlu school_id langsung karena bisa JOIN via parent
-- Tapi untuk performa query DMS dan reporting, tambahkan school_id juga:
guru_dokumens           + school_id
guru_dokumen_logs       + school_id   (untuk audit trail per sekolah)
```

---

## Global Scope Implementation

```php
// app/Models/Scopes/SchoolScope.php
namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class SchoolScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // Ambil school_id dari context saat ini
        // Di-set saat middleware TenantMiddleware dijalankan
        $schoolId = app('current_school_id');

        if ($schoolId) {
            $builder->where($model->getTable() . '.school_id', $schoolId);
        }
    }
}
```

```php
// app/Http/Middleware/TenantMiddleware.php
// Dijalankan di awal setiap request untuk set current tenant
// Deteksi via: subdomain, header X-School-ID, atau user->school_id
```

---

## Catatan Penting

1. `tahun_ajarans` — UNIQUE KEY yang ada (`uq_tahun_ajaran` pada `tahun`) harus diubah
   jadi composite `(school_id, tahun)` supaya dua sekolah boleh punya tahun ajaran
   dengan nilai yang sama.

2. `users.email` — sama seperti di atas, UNIQUE harus composite `(school_id, email)`.

3. Tabel `pengaturans` dihapus, digantikan `school_settings`.

4. Tabel `wali_kelas` dan `bendaharas` dan `operator_profiles` dan `admin_ppdb_profiles`
   perlu ditambah `school_id` — ini adalah profil per-sekolah.

5. Untuk fitur file storage, setiap sekolah dapat folder terpisah di storage:
   `storage/app/schools/{school_id}/...`
   Bukan per-nama seperti sekarang (`foto-guru/`, `foto-siswa/`).
