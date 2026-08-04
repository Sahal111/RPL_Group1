# 09 · Folder Structure

---

## Backend (Laravel)

```
backend/
├── app/
│   ├── Console/
│   │   └── Commands/          ← artisan commands (backup, archive, dll)
│   │
│   ├── Events/                ← domain events
│   │   ├── Guru/
│   │   │   ├── GuruCreated.php
│   │   │   └── GuruDokumenApproved.php
│   │   └── Siswa/
│   │
│   ├── Exceptions/
│   │   └── Handler.php        ← global exception → format ApiResponse
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php
│   │   │   ├── MasterData/
│   │   │   │   ├── Guru/
│   │   │   │   │   ├── GuruController.php
│   │   │   │   │   ├── GuruKeluargaController.php
│   │   │   │   │   ├── GuruKepegawaianController.php
│   │   │   │   │   ├── GuruDokumenController.php
│   │   │   │   │   ├── GuruKompetensiController.php
│   │   │   │   │   ├── GuruMutasiController.php
│   │   │   │   │   ├── GuruAdministrasiController.php
│   │   │   │   │   ├── GuruImportController.php
│   │   │   │   │   └── GuruExportController.php
│   │   │   │   ├── Siswa/
│   │   │   │   │   ├── SiswaController.php
│   │   │   │   │   ├── SiswaKeluargaController.php
│   │   │   │   │   └── SiswaImportController.php
│   │   │   │   ├── KelasController.php
│   │   │   │   ├── MapelController.php
│   │   │   │   ├── JadwalController.php
│   │   │   │   └── TahunAjaranController.php
│   │   │   ├── Absensi/
│   │   │   │   └── AbsensiController.php
│   │   │   ├── Guru/          ← portal guru (bukan master data)
│   │   │   │   └── GuruController.php
│   │   │   ├── Kepsek/
│   │   │   │   └── KepsekController.php
│   │   │   ├── Ortu/
│   │   │   │   └── OrtuController.php
│   │   │   ├── Operator/
│   │   │   │   ├── OperatorController.php
│   │   │   │   └── ManajemenAkunController.php
│   │   │   └── Controller.php ← base controller (pakai ApiResponse trait)
│   │   │
│   │   ├── Middleware/
│   │   │   ├── TenantMiddleware.php
│   │   │   ├── PermissionMiddleware.php
│   │   │   └── RoleMiddleware.php      ← legacy, akan diganti PermissionMiddleware
│   │   │
│   │   └── Requests/
│   │       ├── Auth/
│   │       │   ├── LoginRequest.php
│   │       │   └── RegisterOrtuRequest.php
│   │       ├── Guru/
│   │       │   ├── StoreGuruRequest.php
│   │       │   ├── UpdateGuruRequest.php
│   │       │   ├── StorePendidikanRequest.php
│   │       │   ├── StoreSertifikasiRequest.php
│   │       │   ├── StoreJabatanRequest.php
│   │       │   ├── StoreMutasiRequest.php
│   │       │   ├── StoreDiklatRequest.php
│   │       │   ├── StoreCutiRequest.php
│   │       │   └── StoreDokumenRequest.php
│   │       └── Siswa/
│   │           ├── StoreSiswaRequest.php
│   │           └── UpdateSiswaRequest.php
│   │
│   ├── Jobs/                  ← BUKAN app/jobs/ (huruf besar J)
│   │   ├── ProcessGuruImport.php
│   │   ├── ProcessGuruZipImport.php
│   │   └── SendNotificationEmail.php
│   │
│   ├── Listeners/
│   │   └── Guru/
│   │       ├── LogGuruActivity.php
│   │       └── SendGuruWelcomeNotification.php
│   │
│   ├── Models/
│   │   ├── Scopes/
│   │   │   └── SchoolScope.php
│   │   ├── School.php
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── Permission.php
│   │   ├── Guru.php
│   │   ├── GuruDokumen.php
│   │   ├── GuruJabatan.php
│   │   └── ... (semua model lain)
│   │
│   ├── Observers/
│   │   ├── GuruObserver.php
│   │   ├── SiswaObserver.php
│   │   └── DokumenObserver.php
│   │
│   ├── Policies/
│   │   ├── GuruPolicy.php
│   │   ├── SiswaPolicy.php
│   │   └── DokumenPolicy.php
│   │
│   ├── Providers/
│   │   └── AppServiceProvider.php
│   │
│   ├── Http/Resources/        ← PINDAH ke sini dari Http/
│   │   ├── GuruResource.php
│   │   ├── GuruDetailResource.php
│   │   ├── SiswaResource.php
│   │   └── UserResource.php
│   │
│   ├── Services/
│   │   ├── Guru/
│   │   │   ├── GuruService.php
│   │   │   ├── GuruDokumenService.php
│   │   │   ├── GuruImportService.php
│   │   │   ├── GuruExportService.php
│   │   │   └── MutasiGuruService.php
│   │   ├── Siswa/
│   │   │   └── SiswaService.php
│   │   ├── Auth/
│   │   │   └── AuthService.php
│   │   └── School/
│   │       └── SchoolProvisioningService.php  ← seed role/permission saat sekolah baru
│   │
│   └── Traits/
│       └── ApiResponse.php
│
├── database/
│   ├── factories/
│   ├── migrations/
│   │   ├── 2026_08_01_000001_create_schools_table.php
│   │   ├── 2026_08_01_000002_create_school_settings_table.php
│   │   └── ... (urutan sesuai dependency)
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── PlanSeeder.php
│       ├── SchoolSeeder.php        ← seed satu sekolah + role + permission
│       └── UserSeeder.php
│
├── routes/
│   ├── api.php                     ← hanya include sub-file
│   └── api/
│       ├── auth.php
│       ├── operator.php
│       ├── guru.php
│       ├── kepsek.php
│       ├── ortu.php
│       ├── absensi.php
│       └── public.php
│
└── storage/
    └── app/
        └── schools/
            └── {school_id}/
                ├── guru/
                │   ├── foto/
                │   └── dokumen/
                └── siswa/
                    ├── foto/
                    └── berkas/
```

---

## Frontend (React)

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx       ← SATU layout untuk semua role
│   │   │   ├── Sidebar.jsx         ← dinamis berdasarkan permission
│   │   │   ├── Topbar.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   └── ui/                     ← reusable, tidak tahu domain
│   │       ├── DataTable.jsx
│   │       ├── Modal.jsx
│   │       ├── ConfirmDialog.jsx
│   │       ├── Badge.jsx
│   │       ├── StatusBadge.jsx
│   │       ├── Skeleton.jsx
│   │       ├── FileUpload.jsx
│   │       ├── Pagination.jsx
│   │       ├── SearchInput.jsx
│   │       ├── FilterPanel.jsx
│   │       ├── EmptyState.jsx
│   │       ├── DataField.jsx
│   │       └── SectionCard.jsx
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   ├── api/
│   │   │   ├── useGuru.js
│   │   │   ├── useSiswa.js
│   │   │   ├── useAbsensi.js
│   │   │   ├── useKelas.js
│   │   │   ├── useMapel.js
│   │   │   └── useAkun.js
│   │   └── ui/
│   │       ├── useDebounce.js
│   │       └── useDisclosure.js
│   │
│   ├── lib/
│   │   ├── axios.js               ← axios instance (sudah ada)
│   │   ├── utils.js               ← formatDate, formatCurrency, dll
│   │   └── constants.js           ← nilai konstan (STATUS, JENIS_PTK, dll)
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterOrtuPage.jsx
│   │   │
│   │   ├── public/                ← landing, galeri, tentang
│   │   │   ├── components/        ← komponen khusus public page
│   │   │   │   ├── PublicNavbar.jsx    ← PINDAH ke sini dari pages/public/
│   │   │   │   └── PublicFooter.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── GalleryPage.jsx
│   │   │   └── AboutPage.jsx
│   │   │
│   │   ├── operator/
│   │   │   ├── DashboardOperator.jsx
│   │   │   ├── ManajemenAkun.jsx
│   │   │   └── master/
│   │   │       ├── masterDataGuru/
│   │   │       │   ├── MasterGuru.jsx
│   │   │       │   ├── TambahEditGuru.jsx
│   │   │       │   └── DetailGuru/
│   │   │       │       ├── index.jsx       ← shell
│   │   │       │       └── tabs/
│   │   │       │           ├── TabIdentitas.jsx
│   │   │       │           ├── TabKepegawaian.jsx
│   │   │       │           └── ... (15 tab total)
│   │   │       ├── masterDataSiswa/
│   │   │       ├── masterDataKelas/
│   │   │       └── masterDataOrtu/
│   │   │
│   │   ├── guru/
│   │   ├── kepsek/
│   │   ├── ortu/
│   │   ├── walikelas/
│   │   └── bendahara/
│   │
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── vite.config.js
└── package.json
```

---

## Aturan Folder

1. `components/ui/` — tidak boleh import dari `hooks/api/` atau `pages/`
2. `hooks/api/` — tidak boleh import dari `components/` atau `pages/`
3. `pages/` — boleh import dari semuanya
4. Komponen publik (PublicNavbar, PublicFooter) ada di `pages/public/components/` bukan di root `components/`
5. Layout ada di `components/layout/`, bukan di dalam folder `pages/`
6. Jangan buat folder `utils/` — utils ada di `lib/utils.js`
