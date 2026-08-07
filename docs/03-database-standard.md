# 03 · Database Standard

---

## Aturan Wajib

### 1. Setiap tabel operasional WAJIB punya `school_id`

```sql
-- ✅ BENAR (Tabel Operasional)
CREATE TABLE gurus (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT UNSIGNED NOT NULL,   -- ← wajib, kolom kedua setelah id
  ...
  CONSTRAINT fk_gurus_school FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- ✅ BENAR (Tabel Master Reference / Shared Data)
-- school_id NULLABLE: NULL = default platform, non-NULL = custom override per sekolah
CREATE TABLE master_religions (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT UNSIGNED NULL,
  code      VARCHAR(30) NOT NULL,
  name      VARCHAR(100) NOT NULL,
  ...
);
```

### 1b. Kolom JSON untuk Fleksibilitas Internasional (i18n)

Untuk field yang bervariasi antar negara (seperti NIK/NUPTK/SSN/Tax ID dan detail alamat RT/RW/State), gunakan kolom `JSON`:

```sql
-- Kolom fleksibel pada gurus / siswas
`national_ids`    JSON NULL COMMENT '{"nik":"...","nuptk":"...","ssn":"..."}',
`address_details` JSON NULL COMMENT '{"rt":"01","rw":"02","dusun":"..."}'
```

### 2. Audit Fields Wajib di Tabel Utama

Tabel master (gurus, siswas, orang_tuas, kelas, dll) wajib punya:

```sql
created_by  BIGINT UNSIGNED NULL,  -- user_id yang membuat
updated_by  BIGINT UNSIGNED NULL,  -- user_id yang terakhir update
deleted_by  BIGINT UNSIGNED NULL,  -- user_id yang menghapus (soft delete)
created_at  TIMESTAMP NULL,
updated_at  TIMESTAMP NULL,
deleted_at  TIMESTAMP NULL,        -- untuk SoftDeletes
```

Tabel child/detail (guru_pendidikans, guru_dokumens, dll) minimal punya:
```sql
created_by  BIGINT UNSIGNED NULL,
created_at  TIMESTAMP NULL,
updated_at  TIMESTAMP NULL,
```

### 3. Soft Delete Wajib di Tabel Master

Jangan pernah hard-delete data master. Selalu pakai soft delete (`deleted_at`).
Model harus pakai trait `SoftDeletes`.

```php
// ✅ BENAR
class Guru extends Model
{
    use SoftDeletes;
}

// ❌ SALAH — hard delete data master
Guru::find($id)->delete();  // kalau model tidak pakai SoftDeletes
```

### 4. Foreign Key WAJIB Ada

Setiap kolom `_id` wajib punya FK constraint.

```sql
-- ✅ BENAR
CONSTRAINT fk_gurus_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL

-- ❌ SALAH — kolom user_id tanpa FK
`user_id` BIGINT UNSIGNED NULL,
```

### 5. Index untuk Kolom yang Sering Di-query

```sql
-- Wajib ada index untuk:
KEY idx_{table}_{col} (school_id)           -- semua tabel operasional
KEY idx_{table}_{col} (status)              -- kalau sering filter by status
KEY idx_{table}_{col} (is_active)           -- kalau sering filter by is_active
KEY idx_{table}_{col} (created_at)          -- kalau sering sort/range by date

-- Composite index kalau sering query keduanya sekaligus:
KEY idx_gurus_school_status (school_id, status_keaktifan)
KEY idx_absensis_kelas_tanggal (kelas_id, tanggal)
```

---

## Naming Convention

### Tabel
- **Plural, snake_case**: `gurus`, `siswas`, `orang_tuas`, `tahun_ajarans`
- **Tabel pivot**: `{tabel_a}_{tabel_b}` sorted alphabetically: `user_roles`, `siswa_ekskuls`
- **Tabel child/detail**: `{parent}_{domain}s`: `guru_pendidikans`, `guru_dokumens`, `guru_jabatans`
- **Jangan singkat-singkat**: `guru_doc` ❌ → `guru_dokumens` ✅

### Kolom
- **snake_case**: `nama_lengkap`, `tanggal_lahir`, `status_keaktifan`
- **Boolean**: prefix `is_`: `is_active`, `is_verified`, `is_system`
- **Timestamp aksi**: suffix `_at`: `verified_at`, `approved_at`, `deleted_at`
- **FK**: suffix `_id`: `user_id`, `school_id`, `guru_id`
- **Enum**: pakai nilai yang human-readable: `'Aktif'`, `'Nonaktif'` bukan `1`, `0`

### Contoh Konsisten

```sql
-- ✅ Konsisten
`status_keaktifan` ENUM('Aktif','Cuti','Pensiun','Meninggal','Pindah','Keluar')
`jenis_kelamin`    ENUM('Laki-laki','Perempuan')
`is_active`        TINYINT(1) NOT NULL DEFAULT 1

-- ❌ Tidak konsisten
`status`  ENUM('aktif','nonaktif','cuti')    -- mixed case
`gender`  ENUM('L','P')                      -- kode tidak jelas
`active`  TINYINT(1)                         -- tanpa prefix is_
```

---

## Tipe Data

| Data | Tipe yang Dipakai |
|---|---|
| ID utama | `BIGINT UNSIGNED AUTO_INCREMENT` |
| ID FK | `BIGINT UNSIGNED` (nullable kalau opsional) |
| ID role | `BIGINT UNSIGNED` (bukan `TINYINT` lagi — role bisa banyak) |
| Nama, teks pendek | `VARCHAR(n)` — pilih n yang realistis |
| Teks panjang / deskripsi | `TEXT` |
| Tanggal saja | `DATE` |
| Tanggal + waktu | `TIMESTAMP NULL` |
| Boolean | `TINYINT(1) NOT NULL DEFAULT 0` atau `DEFAULT 1` |
| Nominal uang | `DECIMAL(15,2)` |
| Persentase / nilai | `DECIMAL(5,2)` |
| Nomor identitas (NIK, NUPTK, NIP) | `VARCHAR(n)` — bukan INT karena bisa ada leading zero |
| File path | `VARCHAR(255)` |
| JSON config | `JSON` (MySQL 8) atau `TEXT` |
| Public identifier | `CHAR(26)` untuk ULID |

---

## ULID vs Integer ID

- Integer `id` dipakai secara internal (FK, index, relasi di DB)
- `ulid` dipakai untuk public-facing identifier di URL dan API response

```sql
-- Semua tabel master punya ulid
`ulid` CHAR(26) NOT NULL UNIQUE,
```

```php
// Di Model, generate ulid otomatis
protected static function booted(): void
{
    static::creating(function ($model) {
        $model->ulid = (string) \Illuminate\Support\Str::ulid();
    });
}
```

---

## Migration Standard

### Format Nama File

```
{tahun}_{bulan}_{hari}_{urutan}_{aksi}_{nama_tabel}.php

2026_08_01_000001_create_schools_table.php
2026_08_01_000002_create_school_settings_table.php
2026_08_01_000003_create_users_table.php
```

### Aturan Migration

```php
// ✅ BENAR — migration harus bisa di-rollback
public function up(): void
{
    Schema::create('gurus', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('school_id');
        // ...
        $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
    });
}

public function down(): void
{
    Schema::dropIfExists('gurus');
}

// ❌ SALAH — down() kosong
public function down(): void
{
    //
}
```

### Jangan Ubah Migration yang Sudah Di-commit

Kalau perlu mengubah tabel yang sudah ada, buat **migration baru**:

```
// ❌ SALAH — edit migration lama
2026_08_01_000003_create_gurus_table.php  ← diubah isinya

// ✅ BENAR — buat migration baru
2026_08_10_000001_add_school_id_to_gurus_table.php
```

---

## Seeder Standard

```php
// DatabaseSeeder.php — urutan seeder PENTING karena FK
public function run(): void
{
    $this->call([
        // 1. Platform
        PlanSeeder::class,

        // 2. Sekolah pertama (dev/staging)
        SchoolSeeder::class,        // insert ke schools + school_domains

        // 3. RBAC (school-specific, dipanggil oleh SchoolSeeder)
        // PermissionSeeder::class  // ← tidak dipanggil langsung
        // RoleSeeder::class        // ← tidak dipanggil langsung
        // Keduanya dipanggil dari SchoolSeeder::class

        // 4. User dev
        UserSeeder::class,

        // 5. Data dummy (hanya untuk development)
        // GuruSeeder::class,
        // SiswaSeeder::class,
    ]);
}
```

`SchoolSeeder` yang bertanggung jawab seed permission + role default
setiap kali sekolah baru didaftarkan. Logika ini juga dipakai di
`SchoolController::store()` untuk sekolah baru dari production.
