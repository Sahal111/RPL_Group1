# Dokumen Arsitektur 2 — RBAC Design (Per-Tenant)
# SIAKAD Enterprise Platform
# Status: FINAL — Acuan untuk middleware, policy, dan seeder

---

## Model RBAC Multi-Tier (Platform & Tenant)

Sistem menggunakan otorisasi **2 Tingkat (Multi-Tier)**:

### 1. Platform Level Authorization (`platform_admins`)
Untuk pengelola platform SaaS (Global Super Admin), terpisah dari data tenant:
- **`super_admin`**: Akses penuh ke seluruh konfigurasi SaaS, tenant management, billing, dan database migration.
- **`admin`**: Manajemen sekolah, pengawasan langganan, dan manajemen promo/coupon.
- **`support`**: Mode baca & impersonasi tenant (`last_tenant_id`) untuk bantuan teknis.
- **`billing`**: Kelola tagihan, invoice PPN/tax, refund, dan paket langganan.
- **`readonly`**: Auditing & reporting platform secara umum.

### 2. Tenant Level Authorization (Per-Sekolah)
```
School (tenant)
  └── Role (per sekolah, bisa dikustomisasi)
        └── Permission (per sekolah, per modul)
              └── Global User (mapped ke tenant via global_user_schools)
```

Setiap sekolah punya **role dan permission sendiri**.
Saat sekolah baru didaftarkan, sistem otomatis seed role dan permission default
dari template.
Setelah itu, operator sekolah bisa tambah/hapus/edit sesuai kebutuhan.

---

## Default Roles (Template)

Ini adalah role yang otomatis dibuat saat sekolah baru terdaftar.
`is_system = 1` artinya tidak bisa dihapus, hanya bisa dinonaktifkan.

| slug           | nama               | is_system | Deskripsi                                     |
|----------------|--------------------|-----------|-----------------------------------------------|
| super_operator | Operator Utama     | 1         | Akses penuh ke semua fitur sekolah            |
| operator       | Operator           | 1         | Kelola master data, akun, pengumuman          |
| kepsek         | Kepala Sekolah     | 1         | Read-only semua data + approve dokumen        |
| guru           | Guru               | 1         | Data siswa kelas sendiri + absensi + profil   |
| wali_kelas     | Wali Kelas         | 1         | Sama seperti guru + catatan wali kelas        |
| bendahara      | Bendahara          | 1         | Modul keuangan + tagihan + pembayaran         |
| ortu           | Orang Tua          | 1         | Portal orang tua — data anak + absensi        |
| admin_ppdb     | Admin PPDB         | 1         | Modul PPDB — pendaftaran + seleksi            |

Operator sekolah bisa tambah role custom, misal:
- `wakil_kepsek` — Wakil Kepala Sekolah
- `tata_usaha` — Tata Usaha
- `perpustakaan` — Petugas Perpustakaan (kalau plugin aktif)

---

## Permission Slugs (Template)

Format: `{modul}.{aksi}` atau `{modul}.{resource}.{aksi}`

### Modul: master_data
```
master_data.guru.view
master_data.guru.create
master_data.guru.update
master_data.guru.delete
master_data.guru.import
master_data.guru.export
master_data.guru.verify        -- verifikasi data guru
master_data.guru.restore       -- restore dari trash

master_data.siswa.view
master_data.siswa.create
master_data.siswa.update
master_data.siswa.delete
master_data.siswa.import
master_data.siswa.export

master_data.kelas.view
master_data.kelas.create
master_data.kelas.update
master_data.kelas.delete

master_data.mapel.view
master_data.mapel.create
master_data.mapel.update
master_data.mapel.delete

master_data.tahun_ajaran.view
master_data.tahun_ajaran.manage   -- create + update + set aktif

master_data.orang_tua.view
master_data.orang_tua.manage
```

### Modul: akun
```
akun.view                  -- lihat daftar user
akun.create                -- buat user baru
akun.update                -- edit user
akun.delete                -- hapus user
akun.toggle_active         -- aktifkan/nonaktifkan
akun.reset_password        -- reset password user lain
akun.approve_ortu          -- approve registrasi orang tua
akun.manage_roles          -- assign/cabut role dari user
```

### Modul: absensi
```
absensi.input              -- input absensi siswa
absensi.edit               -- edit absensi yang sudah diinput
absensi.view_kelas_sendiri -- lihat absensi kelas sendiri (guru)
absensi.view_all           -- lihat absensi semua kelas (kepsek, operator)
absensi.rekap              -- akses rekap dan export absensi
```

### Modul: dms (Document Management)
```
dms.upload                 -- upload dokumen guru
dms.view_own               -- lihat dokumen milik sendiri
dms.view_all               -- lihat dokumen semua guru
dms.approve                -- approve/reject dokumen
dms.download               -- download dokumen
dms.delete                 -- hapus dokumen
dms.bulk_download          -- bulk download per guru
```

### Modul: keuangan
```
keuangan.tagihan.view
keuangan.tagihan.create
keuangan.tagihan.update
keuangan.tagihan.delete
keuangan.pembayaran.view
keuangan.pembayaran.input
keuangan.pembayaran.export
keuangan.laporan.view
```

### Modul: ppdb
```
ppdb.pendaftar.view
ppdb.pendaftar.update
ppdb.pendaftar.approve
ppdb.pendaftar.reject
ppdb.pengaturan.manage
```

### Modul: akademik
```
akademik.nilai.input
akademik.nilai.view
akademik.rapor.generate
akademik.rapor.view
akademik.jadwal.manage
akademik.kalender.manage
```

### Modul: pengumuman
```
pengumuman.view
pengumuman.create
pengumuman.update
pengumuman.delete
```

### Modul: pengaturan (Settings sekolah)
```
pengaturan.view
pengaturan.update
pengaturan.smtp.manage
pengaturan.storage.manage
pengaturan.rbac.manage     -- kelola role & permission (hanya super_operator)
```

### Modul: laporan
```
laporan.guru.view
laporan.siswa.view
laporan.absensi.view
laporan.keuangan.view
laporan.export
```

---

## Mapping Role Default → Permission

Ini yang di-seed otomatis saat sekolah baru dibuat.

### super_operator
Semua permission tanpa terkecuali.

### operator
```
master_data.* (semua)
akun.* (semua, kecuali akun.manage_roles)
absensi.view_all, absensi.rekap
dms.view_all, dms.approve, dms.download, dms.bulk_download
pengumuman.* (semua)
laporan.* (semua)
akademik.jadwal.manage, akademik.kalender.manage
```

### kepsek
```
master_data.guru.view, master_data.guru.export, master_data.guru.verify
master_data.siswa.view, master_data.siswa.export
master_data.kelas.view
master_data.mapel.view
absensi.view_all, absensi.rekap
dms.view_all, dms.approve, dms.download, dms.bulk_download
pengumuman.* (semua)
laporan.* (semua)
akademik.rapor.view, akademik.kalender.manage
pengaturan.view
```

### guru
```
master_data.siswa.view        -- hanya siswa kelasnya (enforce via Policy)
absensi.input, absensi.edit, absensi.view_kelas_sendiri
dms.upload, dms.view_own
pengumuman.view
akademik.nilai.input, akademik.nilai.view, akademik.jadwal.view
```

### wali_kelas
```
Semua permission guru +
akademik.rapor.view           -- rapor siswa kelasnya
```

### bendahara
```
keuangan.* (semua)
master_data.siswa.view        -- untuk cek data siswa saat input pembayaran
laporan.keuangan.view, laporan.export
```

### ortu
```
-- Semua dibatasi hanya untuk data anak sendiri (enforce via Policy)
master_data.siswa.view        -- hanya anak sendiri
absensi.view_kelas_sendiri    -- hanya absensi anak sendiri
pengumuman.view
```

### admin_ppdb
```
ppdb.* (semua)
master_data.siswa.view        -- read only untuk referensi
```

---

## Implementation Plan

### 1. SchoolScope (Global Scope)
```php
// Otomatis filter school_id di semua query model yang pakai trait HasSchoolScope
```

### 2. TenantMiddleware
```php
// Identifikasi tenant dari:
// - Subdomain: sdn1.siakad.id → cari di school_domains
// - Header: X-School-ID (untuk API mobile atau integrasi)
// - Fallback: user->school_id dari token
// Set app('current_school_id') untuk dipakai SchoolScope
```

### 3. PermissionMiddleware
```php
// Gantikan RoleMiddleware yang ada
// ->middleware('permission:guru.view')
// ->middleware('permission:dms.approve,dms.view_all')  // salah satu
// ->middleware('permission:dms.approve|dms.view_all')  // keduanya
```

### 4. Policy
```php
// Untuk cek ownership di level resource
// GuruPolicy::update($user, $guru) → cek school_id match + punya permission
// SiswaPolicy::view($user, $siswa) → ortu hanya bisa lihat anak sendiri
// DokumenPolicy::approve($user, $dokumen) → harus punya dms.approve
```

### 5. SchoolSeeder
```php
// Dijalankan otomatis saat sekolah baru didaftarkan:
// 1. Insert ke schools
// 2. Insert ke school_domains
// 3. Copy permission templates → permissions (dengan school_id)
// 4. Copy role templates → roles (dengan school_id)
// 5. Assign default permissions ke setiap role
// 6. Buat user super_operator pertama
// 7. Insert school_settings default
```

---

## Catatan Keamanan

1. Permission check HARUS di dua level:
   - Route level: `->middleware('permission:...')` — cek user punya permission
   - Policy level: `Gate::authorize('update', $guru)` — cek resource milik tenant yang sama

2. Jangan pernah hanya cek permission tanpa cek school_id.
   User dari sekolah A tidak boleh bisa akses resource sekolah B
   meskipun punya permission yang sama.

3. Cache permission per user per request (jangan query DB berkali-kali):
   ```php
   // Di PermissionMiddleware atau Gate, cache hasil per request
   Cache::remember("user_{$userId}_permissions", 60, fn() => ...);
   ```

4. Super Admin platform (platform_admins) punya akses lintas tenant
   hanya untuk keperluan support dan administrasi platform.
   Aksi mereka harus selalu tercatat di activity_logs dengan flag `is_platform_admin`.
