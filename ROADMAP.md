# SIAKAD Enterprise Platform — Master Roadmap
# Dibuat berdasarkan audit RPL_Group1 + keputusan arsitektur

---

## Keputusan Arsitektur (Final)

| # | Keputusan | Pilihan |
|---|---|---|
| 1 | Multi-tenant strategy | Shared Database + school_id |
| 2 | Data production lama | Hanya untuk development, fresh start |
| 3 | RBAC | Per-tenant, role & permission dikustomisasi |
| 4 | Auth | Laravel Sanctum (token-based) |
| 5 | Queue driver | Database → Redis saat scaling |
| 6 | Storage | Local disk per sekolah → S3-compatible saat scaling |
| 7 | API versioning | URL-based (/api/v1/) |
| 8 | Frontend state | React Query (TanStack) — sudah ada |

---

## Phase 0 — Platform Foundation (SEKARANG)

**Target: Laravel project baru yang siap multi-tenant**

Jangan modifikasi project RPL_Group1 yang ada.
Buat project Laravel baru dengan fondasi yang benar dari awal.

### 0.1 Setup Project
```
laravel new siakad-platform --git
composer require laravel/sanctum spatie/laravel-permission
```

> Catatan: Tidak pakai spatie/laravel-permission as-is karena tidak
> support per-tenant RBAC. Gunakan sebagai inspirasi, implementasi custom.

### 0.2 Migration — Global Tables
```
schools
school_settings
school_domains
plans
plan_features
platform_admins
```

### 0.3 Migration — Auth & RBAC
```
users           (+ school_id)
roles           (+ school_id)
permissions     (baru)
role_permissions (baru)
user_roles
personal_access_tokens
password_reset_tokens
sessions
```

### 0.4 Middleware Stack
```
TenantMiddleware          -- identifikasi + set current school
PermissionMiddleware      -- cek permission dari DB
SchoolScope               -- Global Scope untuk semua model
```

### 0.5 SchoolSeeder
Seed otomatis saat sekolah baru terdaftar:
role default, permission default, school_settings default.

### 0.6 ApiResponse Trait + Exception Handler
Format response standar sesuai Dokumen 3.

### 0.7 Base Classes
```
app/Http/Controllers/Controller.php   (+ ApiResponse trait)
app/Models/BaseModel.php              (+ SchoolScope booted)
app/Http/Resources/BaseResource.php
```

**Deliverable Phase 0:**
- Project Laravel fresh, bisa jalankan `php artisan migrate`
- Register sekolah baru → auto-seed role & permission
- Login via Sanctum → dapat token
- Middleware tenant berjalan
- Semua response sudah pakai format standar

---

## Phase 1 — Core Master Data

**Target: Port modul Guru dan Siswa dari RPL_Group1 ke platform baru**

### 1.1 Migration — Master Data
```
gurus               (+ school_id)
guru_keluargas      (+ school_id via guru)
guru_anaks
guru_kontak_darurat
guru_pendidikans
guru_sertifikasis
guru_inpassings
guru_jabatans
guru_rekenings
guru_kompetensi
guru_diklats
guru_pkgs
guru_mutasi         (nama diubah jadi guru_mutasis, plural)
guru_cuti           (nama diubah jadi guru_cutis, plural)
guru_dokumens       (+ school_id)
guru_dokumen_versions
guru_dokumen_logs   (+ school_id)
guru_absensis
guru_import_logs    (+ school_id)

siswas              (+ school_id)
data_tambahan_siswas
orang_tuas          (+ school_id)
orang_tua_siswa
berkas_siswas
perkembangan_siswas
prestasis
beasiswas
program_kesejahteraan_siswas
mutasi_siswas
```

### 1.2 Form Request (semua validasi dari controller)
```
Guru/StoreGuruRequest
Guru/UpdateGuruRequest
Guru/StorePendidikanRequest
Guru/StoreSertifikasiRequest
Guru/StoreJabatanRequest
Guru/StoreMutasiRequest
Guru/StoreDiklatRequest
Guru/StoreCutiRequest
Guru/StoreKontakDaruratRequest
Guru/StoreDokumenRequest
Siswa/StoreSiswaRequest
Siswa/UpdateSiswaRequest
```

### 1.3 Controllers (split dari MasterDataGuruController)
```
MasterData/Guru/GuruController           (CRUD utama)
MasterData/Guru/GuruKeluargaController
MasterData/Guru/GuruKepegawaianController
MasterData/Guru/GuruDokumenController
MasterData/Guru/GuruKompetensiController
MasterData/Guru/GuruMutasiController
MasterData/Guru/GuruAdministrasiController
MasterData/Guru/GuruImportController
MasterData/Guru/GuruExportController
MasterData/Siswa/SiswaController
```

### 1.4 Service Layer
```
Services/Guru/GuruService
Services/Guru/GuruDokumenService    (sudah ada, port)
Services/Guru/MutasiGuruService     (sudah ada, port)
Services/Guru/GuruImportService     (extract dari controller)
Services/Guru/GuruExportService
Services/Siswa/SiswaService
```

### 1.5 API Resources
```
Resources/GuruResource
Resources/GuruDetailResource        (untuk show — include semua relasi)
Resources/GuruDokumenResource
Resources/SiswaResource
Resources/SiswaDetailResource
```

### 1.6 Routes
```
routes/api/v1/guru.php
routes/api/v1/siswa.php
```

---

## Phase 2 — Akademik Core

```
kelas               (+ school_id)
tahun_ajarans       (+ school_id)
semesters           (+ school_id)
mapels              (+ school_id)
jadwals             (+ school_id)
plot_guru_mapels    (+ school_id)
riwayat_kelas       (+ school_id)
absensis            (+ school_id)
```

Controller, Service, Resource, Route untuk:
- TahunAjaranController
- KelasController
- MapelController
- JadwalController
- AbsensiController

---

## Phase 3 — Role-Specific Modules

### Guru Portal
Port dari GuruController yang ada.

### Kepsek Portal
Port dari KepsekController yang ada.

### Ortu Portal
Port dari OrtuController yang ada.

### Operator Dashboard

---

## Phase 4 — Frontend Foundation

**Target: React project baru dengan design system yang benar**

### 4.1 Project Setup
```
npm create vite@latest siakad-frontend -- --template react
@tanstack/react-query, axios, react-router-dom
react-hot-toast, lucide-react, dayjs
tailwindcss
```

### 4.2 Reusable Components (src/components/ui/)
```
DataTable.jsx         -- table dengan sort, filter, pagination
Modal.jsx             -- modal dengan backdrop, close on ESC
ConfirmDialog.jsx     -- dialog konfirmasi sebelum hapus/aksi penting
Badge.jsx             -- status badge
Skeleton.jsx          -- loading state
FileUpload.jsx        -- upload dengan preview dan progress
Pagination.jsx        -- komponen pagination
SearchInput.jsx       -- search dengan debounce
FilterPanel.jsx       -- panel filter yang bisa di-toggle
Toast.jsx             -- wrapper react-hot-toast
EmptyState.jsx        -- tampilan saat data kosong
ErrorBoundary.jsx     -- tangkap error di komponen
```

### 4.3 Layout (src/components/layout/)
```
AppLayout.jsx         -- satu layout untuk semua role (pakai prop menus)
Sidebar.jsx           -- sidebar dinamis berdasarkan permission
Topbar.jsx
Footer.jsx
```

### 4.4 API Hooks (src/hooks/api/)
```
useGuru.js
useSiswa.js
useAbsensi.js
useKelas.js
usePermission.js      -- cek permission di frontend
```

### 4.5 Auth Context
```
src/contexts/AuthContext.jsx   (sudah ada, refactor)
src/lib/axios.js               (sudah ada, port)
```

---

## Phase 5 — Frontend Pages (Port dari RPL_Group1)

### 5.1 Operator
```
pages/operator/
  DashboardOperator.jsx
  ManajemenAkun.jsx
  master/guru/
    MasterGuru.jsx
    DetailGuru/
      index.jsx              -- shell + tab navigation
      tabs/
        TabIdentitas.jsx
        TabKepegawaian.jsx
        TabKeluarga.jsx
        TabPendidikan.jsx
        TabSertifikasi.jsx
        TabInpassing.jsx
        TabJabatan.jsx
        TabDokumen.jsx
        TabKompetensi.jsx
        TabDiklat.jsx
        TabMutasi.jsx
        TabPKG.jsx
        TabAdministrasi.jsx
        TabPenugasan.jsx
        TabAkun.jsx
    TambahEditGuru.jsx
  master/siswa/  (sama, dipecah per tab)
  master/kelas/
  master/mapel/
  master/jadwal/
  master/ortu/
  master/tahun-ajaran/
```

### 5.2 Guru, Kepsek, Ortu, WaliKelas, Bendahara
Port dari yang ada, pakai shared components.

---

## Phase 6 — PPDB Module

```
calon_siswas        (+ school_id)
berkas_pendaftars
pembayaran_ppdb
```

---

## Phase 7 — Keuangan Module

```
jenis_tagihans      (+ school_id)
tagihans            (+ school_id)
pembayarans         (+ school_id)
```

---

## Phase 8 — Akademik Lanjutan

```
komponen_penilaians (+ school_id)
nilais              (+ school_id)
nilai_akhirs        (+ school_id)
ekskuls             (+ school_id)
siswa_ekskuls
rapors              (+ school_id)
catatan_walis       (+ school_id)
```

---

## Phase 9 — Platform Admin

Super Admin dashboard untuk kelola sekolah:
- Daftar sekolah dan status
- Kelola paket langganan
- Impersonate tenant untuk support
- Monitoring global

---

## Phase 10+ — Enterprise Features

(Sesuai roadmap yang sudah dibahas sebelumnya)

```
Workflow Engine
Notification Center (in-app, email, WhatsApp)
DMS advanced (OCR, retention, recycle bin)
Reporting Engine
Global Search
Scheduler
Monitoring
Theme Engine
Plugin System
CI/CD
AI Integration
```

---

## Aturan Coding

1. Setiap controller WAJIB extends Controller base yang sudah ada ApiResponse trait
2. Setiap public method di controller WAJIB return type `JsonResponse`
3. Tidak boleh ada `$request->validate()` di controller — semua pakai Form Request
4. Tidak boleh ada query DB di controller — semua lewat Service
5. Setiap model operasional WAJIB pakai SchoolScope
6. Setiap response WAJIB pakai format dari Dokumen 3
7. Format before/after wajib dipakai setiap kali ada perubahan kode

---

## File Referensi

- `doc1-schema-design.md` — Schema database multi-tenant
- `doc2-rbac-design.md` — RBAC per-tenant, role dan permission default
- `doc3-api-contract.md` — Format response, error codes, ApiResponse trait
- `ROADMAP.md` — File ini
