# DATABASE AUDIT REPORT
**SaaS Manajemen Sekolah — db_minurulhuda3**
**Tanggal Audit:** 2026-08-20 | **Auditor:** Principal Engineer Review

---

## 1. Executive Summary

**Status: 🟠 PERLU PERBAIKAN SIGNIFIKAN SEBELUM PRODUCTION**

Database ini sudah menunjukkan pemikiran SaaS yang matang — `school_id` ada di 96 dari 115 tabel, composite index untuk query multi-tenant sudah ada di tabel utama, dan arsitektur dual-auth (`users` per-tenant + `global_users` platform) dirancang dengan baik.

**Namun ada 7 isu yang harus diperbaiki sebelum production:**

1. `password_reset_tokens` tidak safe untuk multi-tenant (ambiguous by email)
2. `user_roles` tidak memiliki `school_id` — IDOR risk via role_id manipulation
3. `role_permissions` tidak ada `school_id` — cross-school permission assignment possible
4. NIK, no_KK, NISN, NIP tersimpan plaintext di 3+ tabel — PDPA/UU PDP risk
5. `siswas` dan `gurus` memiliki kolom terduplikasi masif (62 dan 70 kolom)
6. `tagihans` dan `pembayarans` cascade-delete ke siswa — financial data hilang saat siswa dikeluarkan
7. `two_factor_recovery_codes` tersimpan plaintext di `global_users`

---

## 2. Critical Issues

| Severity | Tabel | Masalah | Risiko | Solusi |
|----------|-------|---------|--------|--------|
| 🔴 Critical | `password_reset_tokens` | PK adalah `email` tanpa `school_id`. Email sama bisa ada di 2 sekolah berbeda (unique per-school). Reset token akan memilih sekolah secara random. | User sekolah A bisa reset password user sekolah B dengan email yang sama | Tambah `school_id` kolom, ubah PK menjadi `(school_id, email)`, atau enforce global email uniqueness di `global_users` |
| 🔴 Critical | `user_roles` | Tidak ada `school_id`. Pivot `user_id ↔ role_id` tidak divalidasi di DB level. Jika attacker IDOR role_id, bisa assign role sekolah B ke user sekolah A | Privilege escalation antar sekolah | Tambah `school_id NOT NULL` ke `user_roles`, tambah FK + unique constraint `(school_id, user_id, role_id)` |
| 🔴 Critical | `role_permissions` | Tidak ada `school_id`. `role_id` dan `permission_id` keduanya punya `school_id`, tapi pivot tidak. Attacker bisa assign permission sekolah B ke role sekolah A | Cross-school permission escalation | Tambah `school_id NOT NULL`, tambah check constraint atau trigger validasi |
| 🔴 Critical | `tagihans` + `pembayarans` | `ON DELETE CASCADE` ke `siswas`. Saat siswa di-hapus (soft delete bypass / hard delete), SEMUA data tagihan dan pembayaran ikut terhapus | Kehilangan data finansial permanen, masalah audit | Ubah ke `ON DELETE RESTRICT`. Siswa yang punya tagihan tidak boleh dihapus. |
| 🔴 Critical | `siswas`, `gurus`, `orang_tuas` | NIK, no_KK, NISN, NIP, NUPTK, no_KK disimpan **plaintext**. Ini data identitas nasional yang dilindungi UU PDP No. 27 Tahun 2022 | Data breach = sanksi hukum + reputasi | Enkripsi dengan AES-256-GCM di application layer sebelum disimpan. Index on hash jika perlu searchable. |
| 🔴 Critical | `global_users` | `two_factor_recovery_codes` tersimpan sebagai `text` plaintext. Laravel Fortify seharusnya encrypt ini. | Recovery codes = bypass 2FA. Jika DB bocor, 2FA jadi percuma | Pastikan Laravel Fortify encryption enabled, atau encrypt manual sebelum insert |
| 🟠 High | `schools` CASCADE | `schools.id` direferensi dengan `ON DELETE CASCADE` oleh hampir semua tabel. Hard delete sekolah = data jutaan siswa, guru, nilai, pembayaran hilang selamanya | Operator salah klik = bencana | Tambah soft delete ke `schools`, block hard delete di application layer. Gunakan `ON DELETE RESTRICT` untuk tabel kritis. |
| 🟠 High | `siswas` (62 col) + `gurus` (70 col) | Duplikasi masif: (1) `agama` enum DAN `religion_id` FK, (2) `jenis_kelamin` enum DAN `gender` varchar, (3) `national_ids` JSON DAN kolom `nik`, `nisn`, `nuptk` terpisah, (4) dua sistem alamat (Indonesia + internasional) | Inkonsistensi data, maintenance hell, query confusion | Pilih satu representasi per konsep. Hapus duplikasi. |
| 🟠 High | `plot_guru_mapels` | Unique key `(guru_id, mapel_id, kelas_id, semester_id)` tanpa `school_id`. DB tidak mencegah guru sekolah A di-assign ke kelas sekolah B | Silent cross-tenant data corruption | Tambah `school_id` ke unique constraint |
| 🟠 High | `kelas` | Unique key `(tahun_ajaran_id, nama_kelas)` tanpa `school_id`. Implicitly scoped via `tahun_ajaran_id`, tapi fragile. | Jika tahun_ajaran_id disalah-assign, nama kelas bisa collision | Tambah `school_id` ke unique constraint secara eksplisit |
| 🟡 Medium | `tagihans` | Tidak ada `deleted_at`. Data tagihan tidak bisa di-soft-delete untuk audit trail | Data tagihan yang "dibatalkan" dihapus permanen | Tambah `deleted_at` |
| 🟡 Medium | `nilai_akhirs`, `absensis` | Tidak ada `deleted_at`. Nilai akhir dan absensi adalah data historis kritis | Koreksi nilai tidak bisa di-audit | Tambah `deleted_at` |
| 🟡 Medium | `orang_tuas` | Tidak ada UNIQUE constraint pada NIK per school_id | Satu orang bisa diduplikasi berkali-kali | Tambah `UNIQUE KEY uq_ortu_school_nik (school_id, nik)` (nullable) |
| 🟡 Medium | `sessions` | Tidak ada `school_id`. Laravel session store per-user tidak terisolasi per sekolah | Bukan data leakage (payload encrypted), tapi tidak ada cara query sessions per sekolah | Tambah `school_id` nullable untuk admin monitoring |
| 🟢 Low | `gurus` | `status_kepegawaian` (enum), `employment_status_id` (FK), `status_aktif`, `status_keaktifan` — 4 kolom untuk konsep yang sama | Query inconsistency | Normalisasi ke satu representasi |

---

## 3. Multi-Tenant Audit

### ✅ Tabel yang sudah benar (memiliki school_id)
96 tabel sudah memiliki `school_id` — absensis, activity_logs, api_keys, assignments, gurus, siswas, nilais, pembayarans, rapors, dll.

### ✅ Global/Master data yang benar TIDAK memiliki school_id
- `plans`, `plan_features` — SaaS plans global
- `master_blood_types`, `master_school_types` — referensi global
- `cache`, `cache_locks`, `jobs`, `failed_jobs` — Laravel internals
- `global_users`, `platform_admins` — platform level

### ⚠️ Tabel master dengan school_id nullable (hybrid — perlu verifikasi intent)
- `master_religions` — `school_id` nullable. Ini berarti ada data global (NULL) dan data custom per sekolah. **OK jika disengaja**, tapi query harus selalu filter `WHERE school_id = ? OR school_id IS NULL`.
- `master_education_levels`, `master_marital_statuses`, `master_status_kepegawaians`, `master_jenis_cutis` — sama.

**Risiko:** Jika query lupa filter `school_id IS NULL`, sekolah A bisa melihat custom data sekolah B.

### 🔴 Tabel yang HARUS diperbaiki
| Tabel | Masalah |
|-------|---------|
| `password_reset_tokens` | Email tidak globally unique — cross-tenant ambiguity |
| `user_roles` | Tidak ada school_id — cross-tenant role assignment |
| `role_permissions` | Tidak ada school_id — cross-tenant permission |
| `sessions` | Tidak ada school_id (minor) |

---

## 4. Security Audit

### 4.1 Data Sensitif Plaintext

**UU PDP No. 27/2022** mengklasifikasikan data berikut sebagai data pribadi yang bersifat khusus dan harus dilindungi:

| Kolom | Tabel | Status | Regulasi |
|-------|-------|--------|---------|
| `nik` (16 digit) | siswas, gurus, orang_tuas | 🔴 PLAINTEXT | UU PDP |
| `no_kk` (16 digit) | siswas, gurus | 🔴 PLAINTEXT | UU PDP |
| `nisn` | siswas | 🔴 PLAINTEXT | Permendikbud |
| `nip` | gurus | 🔴 PLAINTEXT | UU ASN |
| `nuptk` | gurus | 🟡 Plaintext | Kemdikbud |
| `national_ids` JSON | siswas, gurus | 🔴 PLAINTEXT JSON | UU PDP |
| `two_factor_recovery_codes` | global_users | 🔴 PLAINTEXT | Security best practice |
| `penghasilan` | orang_tuas | 🟡 Plaintext | Privacy |

**Solusi:** Enkripsi di application layer (bukan DB level) menggunakan Laravel `Crypt::encryptString()` atau dedicated encryption service. Simpan hash terpisah untuk kebutuhan search (mis: `nik_hash = SHA256(nik)`).

### 4.2 IDOR Risks

1. **`user_roles`**: Tidak ada `school_id`. Request `POST /user-roles` dengan `role_id` dari sekolah lain tidak dicegah di DB level. Harus ada validasi di service layer.
2. **`role_permissions`**: Sama seperti `user_roles`.
3. **`plot_guru_mapels`**: Unique constraint tidak include `school_id`, memungkinkan guru sekolah A di-assign ke kelas sekolah B.
4. **`ulid` sebagai public identifier**: Sudah benar. `ulid` digunakan di `siswas`, `gurus`, `users`, `global_users`. Pastikan **semua** endpoint API menggunakan `ulid`, bukan integer `id`.

### 4.3 Password Reset Ambiguity

`password_reset_tokens` menggunakan `email` sebagai PK. Email unique hanya per-school (constraint `uq_users_email_school`). Jika `user1@gmail.com` terdaftar di Sekolah A dan Sekolah B, satu token reset akan menimpa yang lain.

**Fix:** Gunakan `global_users` untuk reset password (email globally unique). Untuk `users` per-school, arahkan reset via `global_user_id`.

### 4.4 Cascade Delete Financial Data

```sql
-- BERBAHAYA: hapus siswa = hapus semua tagihan dan pembayaran
tagihans: FOREIGN KEY (siswa_id) REFERENCES siswas(id) ON DELETE CASCADE
pembayarans: FOREIGN KEY (siswa_id) REFERENCES siswas(id) ON DELETE CASCADE
```

Data keuangan tidak boleh cascade-delete. Siswa yang memiliki tagihan/pembayaran tidak boleh dihapus. Gunakan `ON DELETE RESTRICT`.

---

## 5. Performance & Scalability Audit

### 5.1 Index yang Sudah Baik
Tabel utama (`absensis`, `nilais`, `pembayarans`, `activity_logs`) sudah memiliki composite index dengan `school_id` sebagai leading column. Ini sudah benar untuk query multi-tenant.

### 5.2 Bottleneck Potensial

| Tabel | Masalah | Proyeksi |
|-------|---------|----------|
| `activity_logs` | Append-only, tidak ada partisi | 1000 sekolah × 1000 aksi/hari = 365M rows/tahun. **Sudah ada archive table**, tapi belum ada partisi. |
| `nilais` | Setiap komponen penilaian = 1 row per siswa | Madrasah 500 siswa × 10 mapel × 5 komponen × 2 semester = 50K rows/sekolah/tahun. OK untuk single tenant, masalah di scale. |
| `absensis` | 1 row per siswa per hari | 500 siswa × 220 hari = 110K rows/sekolah/tahun. 1000 sekolah = 110M/tahun. Perlu PARTITION BY RANGE pada `tanggal`. |
| `sessions` | Tidak di-cleanup otomatis. 1 session per tab per user. | Di scale besar, tabel ini bisa sangat besar. Sudah ada `last_activity` index — gunakan untuk periodic cleanup. |
| `siswas` (62 col) + `gurus` (70 col) | Tabel sangat lebar. Full row scan mahal. | Pertimbangkan vertical partitioning: pisah `siswas_bio` (data sering dibaca) dan `siswas_dapodik` (data jarang dibaca). |

### 5.3 Missing Index

| Tabel | Kolom | Alasan |
|-------|-------|--------|
| `tagihans` | `(school_id, siswa_id, status, jatuh_tempo)` | Query tunggakan per siswa |
| `nilais` | `(school_id, kelas_id, semester_id)` | Rekap nilai per kelas |
| `orang_tuas` | `(school_id, nik)` | Lookup ortu by NIK |
| `plot_guru_mapels` | `(school_id, guru_id, semester_id)` | Jadwal mengajar guru |
| `wali_kelas` | `(school_id, guru_id)` | Guru jadi wali kelas mana |

### 5.4 Rekomendasi Partisi

```sql
-- absensis: partisi per tahun
ALTER TABLE absensis PARTITION BY RANGE (YEAR(tanggal)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- activity_logs: sudah ada archive strategy. Tambahkan partisi pada created_at.
```

---

## 6. Database Design Issues

### 6.1 Kolom Terduplikasi — HARUS Diputuskan

#### `siswas` — Pilih Satu:
| Duplikasi | Kolom 1 | Kolom 2 | Rekomendasi |
|-----------|---------|---------|-------------|
| Agama | `agama` (enum) | `religion_id` (FK) | Hapus `agama` enum, gunakan `religion_id` FK ke `master_religions` |
| Gender | `jenis_kelamin` (enum L/P) | `gender` (varchar male/female/other) | Untuk Dapodik: `jenis_kelamin`. Hapus `gender` jika tidak perlu internasionalisasi. |
| ID Nasional | `national_ids` (JSON) + `nisn`, `nik`, `no_kk` (kolom terpisah) | — | Hapus JSON `national_ids`, pertahankan kolom terpisah (sudah ada index dan FK). JSON tidak bisa diindex dengan efisien. |
| Alamat | 8 kolom Indonesia + 7 kolom internasional | — | Untuk SaaS Indonesia: pertahankan kolom Indonesia, drop kolom internasional. Jika perlu global, buat tabel `addresses` terpisah. |

#### `gurus` — Sama seperti siswas + tambahan:
| Duplikasi | Kolom | Rekomendasi |
|-----------|-------|-------------|
| Status Kepegawaian | `status_kepegawaian` (enum) + `employment_status_id` (FK) | Hapus enum, gunakan FK ke `master_status_kepegawaians` |
| Jenis PTK | `jenis_ptk` (varchar) + `teacher_type` (varchar) | Pilih satu, hapus yang lain |
| Status Aktif | `status_aktif` (bool?) + `status_keaktifan` (varchar?) | Pilih satu |

### 6.2 Kolom yang Perlu Ditambahkan

| Tabel | Kolom | Alasan |
|-------|-------|--------|
| `tagihans` | `deleted_at` | Soft delete untuk audit trail tagihan |
| `nilai_akhirs` | `deleted_at` | Nilai akhir yang dikoreksi harus traceable |
| `absensis` | `deleted_at` | Absensi yang dikoreksi harus traceable |
| `plot_guru_mapels` | `deleted_at` | Penugasan guru bisa diubah, perlu history |
| `wali_kelas` | `deleted_at` | Perubahan wali kelas perlu history |
| `user_roles` | `school_id` | Isolasi multi-tenant |
| `role_permissions` | `school_id` | Isolasi multi-tenant |
| `orang_tuas` | unique index `(school_id, nik)` | Mencegah duplikasi orang tua |
| `plot_guru_mapels` | `school_id` dalam unique constraint | Mencegah cross-school assignment |

### 6.3 Relasi yang Perlu Diperbaiki

```sql
-- SEKARANG (berbahaya):
tagihans: FOREIGN KEY (siswa_id) REFERENCES siswas(id) ON DELETE CASCADE
pembayarans: FOREIGN KEY (siswa_id) REFERENCES siswas(id) ON DELETE CASCADE

-- SEHARUSNYA:
tagihans: FOREIGN KEY (siswa_id) REFERENCES siswas(id) ON DELETE RESTRICT
pembayarans: FOREIGN KEY (siswa_id) REFERENCES siswas(id) ON DELETE RESTRICT

-- Tambahkan soft delete ke schools:
ALTER TABLE schools ADD COLUMN deleted_at TIMESTAMP NULL;
```

### 6.4 Tabel `siswas` — Terlalu Gemuk (62 kolom)

Pertimbangkan split menjadi:
- `siswas` — identitas inti (20 kolom): id, ulid, school_id, user_id, nama, nik, nisn, nis, tanggal_lahir, jenis_kelamin, status, foto, created_at, updated_at, deleted_at, created_by, updated_by, kode_anak, tanggal_masuk, tingkat
- `siswa_dapodik` — data Dapodik lengkap (1:1 dengan siswas): semua field Dapodik
- `siswa_alamat` — data alamat (1:1): semua field alamat

Ini mengurangi row width untuk query yang hanya butuh nama + foto + nisn.

---

## 7. Recommended Architecture

### Multi-Tenant Strategy: Shared Database (TETAP GUNAKAN INI)

Arsitektur shared database + `school_id` yang sudah ada adalah **pilihan yang benar** untuk skala ribuan sekolah.

- ✅ Lebih murah daripada database per sekolah
- ✅ Easier backup, monitoring, migration
- ✅ Sudah diimplementasi dengan baik di 96 tabel

**Tidak perlu ganti arsitektur.** Yang perlu diperbaiki adalah penegakan isolasinya.

### Perbaikan Arsitektural Tanpa Ganti Skema Besar

```
1. Application-level: SETIAP query harus melalui Global Scope (Laravel)
   - Buat ScopedBySchool trait
   - Register di setiap model dengan school_id
   - Unit test: pastikan query tanpa school_id tidak mungkin lolos

2. Middleware: Validasi school_id dari JWT/session di setiap request
   - user->school_id harus match dengan resource yang diakses

3. Repository layer: Semua query masuk lewat Repository yang enforce school_id

4. Encryption service: Wrap semua akses ke NIK, no_KK, NISN via EncryptedField
```

### Arsitektur Global Auth (sudah ada, perlu penyempurnaan)

Struktur dual-auth (`global_users` + `users` per-tenant) sudah tepat. Yang perlu diperbaiki:
- Password reset harus melalui `global_users` (email globally unique)
- Session management harus track `school_id` aktif saat user multi-tenant

---

## 8. Migration Priority

### Priority 1 — WAJIB Sebelum Production

1. **Fix `password_reset_tokens`** — Tambah `school_id`, atau enforce global email via `global_users` flow
2. **Fix `user_roles`** — Tambah `school_id NOT NULL`, tambah unique constraint `(school_id, user_id, role_id)`
3. **Fix `role_permissions`** — Tambah `school_id`, atau pindahkan ke `tenant_user_roles` yang sudah ada dan lebih baik
4. **Fix `tagihans` + `pembayarans` CASCADE** — Ubah `ON DELETE CASCADE` ke `ON DELETE RESTRICT` pada `siswa_id`
5. **Enkripsi NIK/no_KK/NISN/NIP** — Buat `EncryptedField` cast di Laravel, migrate data
6. **Fix `schools` soft delete** — Tambah `deleted_at`, hapus atau disable hard delete dari UI
7. **Fix `two_factor_recovery_codes`** — Pastikan Laravel Fortify encryption aktif (config `fortify.features`)

### Priority 2 — Sangat Disarankan

8. **Hapus duplikasi kolom** di `siswas` dan `gurus` (agama enum, gender, national_ids JSON, alamat internasional)
9. **Tambah `school_id` ke unique constraint** `plot_guru_mapels` dan `kelas`
10. **Tambah `deleted_at`** ke `tagihans`, `nilai_akhirs`, `absensis`, `plot_guru_mapels`, `wali_kelas`
11. **Tambah unique index** `(school_id, nik)` ke `orang_tuas`
12. **Tambah Laravel Global Scope** `ScopedBySchool` dan test coverage

### Priority 3 — Optimasi Jangka Panjang

13. **Partisi tabel** `absensis` dan `activity_logs` by year
14. **Split `siswas`** menjadi `siswas` (inti) + `siswa_dapodik` + `siswa_alamat`
15. **Tambah composite index** yang masih kurang (lihat section 5.3)
16. **Normalisasi status gurus** — hapus kolom duplikat `status_kepegawaian`, `jenis_ptk`, dll

---

## 9. Final Verdict

**Database ini BELUM LAYAK untuk production SaaS ribuan sekolah dalam kondisi saat ini.**

**Yang sudah bagus:**
- Arsitektur multi-tenant (shared DB + school_id) sudah benar
- 96/115 tabel sudah punya school_id dengan FK dan index yang benar
- Composite index sudah ada di tabel-tabel kritis
- Dual-auth architecture (global_users + users) adalah desain yang tepat
- ULID sebagai public identifier sudah diimplementasi
- activity_logs + archive strategy sudah ada
- tenant_user_roles dengan audit trail (diberikan_oleh, dicabut_oleh) sudah sangat baik

**Yang WAJIB diperbaiki sebelum production (7 item):**

| # | Issue | Dampak |
|---|-------|--------|
| 1 | `password_reset_tokens` ambiguous | Auth bypass |
| 2 | `user_roles` no school_id | Privilege escalation |
| 3 | `role_permissions` no school_id | Permission escalation |
| 4 | Financial data CASCADE delete | Data loss permanen |
| 5 | NIK/KK/NISN plaintext | UU PDP violation + sanksi hukum |
| 6 | Schools no soft delete | Accidental total data loss |
| 7 | 2FA recovery codes plaintext | 2FA bypass saat DB breach |

Dengan menyelesaikan 7 item Priority 1, database ini akan menjadi fondasi yang solid untuk SaaS sekolah skala ribuan tenant.

---

*Audit ini berdasarkan struktur schema dari `db_minurulhuda3_2026-08-20.sql` (115 tabel, MySQL 9.6.0). Tidak mencakup stored procedures, triggers, atau application-layer code.*
