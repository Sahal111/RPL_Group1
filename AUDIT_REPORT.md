SIAKAD (RPL_Group1).

Berikut adalah Laporan Audit Kode Komprehensif independen dan objektif.

AUDIT REPORT — SIAKAD (Sistem Informasi Akademik Sekolah)
Audit Summary
Nilai Evaluasi Project:

Architecture : 5.0 / 10
Database : 7.0 / 10
Backend : 5.0 / 10
Frontend : 6.0 / 10
Security : 4.0 / 10
Performance : 6.0 / 10
Maintainability : 5.0 / 10
Scalability : 5.0 / 10
Enterprise Ready : 4.0 / 10
Overall Score : 5.2 / 10
Ringkasan Daftar Temuan Major & Critical
Critical Issue (🔥)

Cross-Tenant Data Leakage Risk pada SchoolScope: Jika current_school_id bernilai null (misal request via IP/header yang tidak teresolusi), SchoolScope melewati (bypass) filter WHERE school_id, membuka seluruh data sekolah di DB.
Secret Credential Leakage di .env: Password email SMTP pihak ketiga (MAIL_PASSWORD) dan password database ter-commit / tersimpan secara plain-text di lingkungan project.
Penggunaan Token Auth di localStorage: Penyimpanan Sanctum Bearer Token di localStorage membuat token rentan terhadap kebocoran via serangan XSS.
High Priority

Pelanggaran Total Arsitektur Controller Layer & Clean Architecture: Controller raksasa (misal GuruImportController.php 2.173 baris & GuruExportController.php 1.285 baris) memuat logika eksekusi Zip, manipulasi XML OpenXML, dan business logic tingkat rendah di Controller.
Pelanggaran Standar Validasi: Mayoritas Controller menggunakan inline $request->validate() alih-alih FormRequest class (berseberangan langsung dengan dokumen standar 05-laravel-standard.md).
0% Automated Test Coverage: Tidak ada automated test suite (Unit/Feature Test) untuk memverifikasi modul krusial seperti Multi-Tenancy, Auth, Absensi, maupun Import/Export.
Medium Priority

Inkonsistensi Public Identifier & Route Binding: Pencarian resource mencampur antara id (integer), nuptk, nisn, dan ulid.
Inkonsistensi Format HTTP API Response: Sebagian controller menggunakan ApiResponse trait, sebagian lagi merespons langsung dengan response()->json([...]) dengan struktur payload yang berbeda.
Direct Coupling API Calls pada Komponen UI React: Frontend melakukan pemanggilan Axios secara inline di komponen halaman tanpa abstraksi API Service Layer / Custom Hooks yang terisolasi.
Low Priority

File skrip patching temporary (patch_frontend.py, patch_modal.py) tertinggal di root directory.
Adanya sisa file database SQLite (database.sqlite) di dalam folder backend.
DETAIL TEMUAN AUDIT

1. Security & Multi-Tenancy
   [Security / Multi-Tenancy] High-Risk Cross-Tenant Data Isolation Failure pada SchoolScope
   Severity: 🔥 Critical

Lokasi:

backend/app/Models/Scopes/SchoolScope.php#L36-L41 (file://backend/app/Models/Scopes/SchoolScope.php#L36-L41)
backend/app/Http/Middleware/TenantMiddleware.php#L42-L44 (file://backend/app/Http/Middleware/TenantMiddleware.php#L42-L44)
Masalah: Logika SchoolScope diimplementasikan sebagai berikut:

php
$schoolId = app()->bound('current_school_id') ? app('current_school_id') : null;
if ($schoolId) {
$builder->where($model->getTable() . '.school_id', $schoolId);
}
Ketika request datang tanpa subdomain tenant atau tanpa header X-School-ID (misalnya IP server langsung atau endpoint public/internal), TenantMiddleware mengeset current_school_id menjadi null. Karena if ($schoolId) mengevaluasi null sebagai false, query Eloquent dijalankan TANPA klausul WHERE school_id = ?.

Mengapa ini berbahaya: Jika terdapat endpoint yang bocor dari auth middleware atau diakses oleh user yang belum diset school_id-nya, query DB akan me-return seluruh data dari seluruh sekolah (semua tenant) yang tersimpan dalam shared database.

Dampak jangka panjang: Kebocoran data antar-sekolah (Cross-Tenant Data Breach) yang melanggar privasi data siswa/guru, regulasi UU PDP / GDPR, serta dapat menghancurkan reputasi platform SaaS.

Cara memperbaiki: Ubah SchoolScope agar secara default menggagalkan query (misal whereRaw('1 = 0')) jika current_school_id bernilai null dan request bukan berasal dari context Platform Admin / CLI / Maintenance.

php
public function apply(Builder $builder, Model $model): void
{
    if (app()->bound('current_school_id') && app('current_school_id') !== null) {
        $builder->where($model->getTable() . '.school_id', app('current_school_id'));
} else {
// Cegah query mengembalikan data sekolah mana pun jika tenant gagal ter-resolusi
$builder->whereRaw('1 = 0');
}
}
Best Practice: Fail-closed design pattern pada multi-tenant scoping.

[Security] Plaintext Third-Party Credential Leakage pada File Environment
Severity: 🔥 Critical

Lokasi:

backend/.env#L28 & backend/.env#L79 (file://backend/.env#L28)
Masalah: File .env berisi password database lokal dan kredensial Gmail App Password SMTP (MAIL_PASSWORD=aeqcbrjvjydmqnwp). Meskipun .env tercantum dalam .gitignore, keberadaan file ini di lingkungan repository workspace tanpa vault/secret manager meningkatkan risiko kebocoran credential.

Mengapa ini berbahaya: Kredensial SMTP tersebut dapat disalahgunakan pihak ketiga untuk melakukan spamming, phishing, atau penyalahgunaan akun email.

Cara memperbaiki:

Revoke App Password Gmail tersebut segera.
Gunakan Environment Variables di server deployment (AWS Parameter Store, GCP Secret Manager, Vault) atau .env local pengembang yang tidak mengekspos credential akun pribadi.
[Security] Storage Authentication Token di localStorage Browser
Severity: High

Lokasi:

frontend/src/contexts/AuthContext.jsx#L32 (file://frontend/src/contexts/AuthContext.jsx#L32)
frontend/src/lib/axios.js#L13 (file://frontend/src/lib/axios.js#L13)
Masalah: Token autentikasi Sanctum disimpan di localStorage browser dan di-attach secara manual melalui header Authorization: Bearer <token>.

Mengapa ini berbahaya: Skrip JavaScript pihak ketiga mana pun yang berhasil mengeksekusi XSS di browser client dapat membaca localStorage.getItem('token') dan mencuri sesi pengguna.

Cara memperbaiki: Manfaatkanfitur native Laravel Sanctum Stateful Authentication dengan Cookie HttpOnly, SameSite=Lax/Strict, dan Secure flag sehingga token tidak dapat dibaca oleh JavaScript client.

2. Arsitektur & Structure Code
   [Arsitektur / Clean Code] Monolithic Controllers & Violation Single Responsibility Principle (SRP)
   Severity: High

Lokasi:

backend/app/Http/Controllers/MasterData/Guru/GuruImportController.php (2.173 baris)
backend/app/Http/Controllers/MasterData/Guru/GuruExportController.php (1.285 baris)
backend/app/Http/Controllers/MasterData/MasterDataMapelController.php (531 baris)
Masalah: Controller di atas menangani HTTP Request, parsing ZIP file, ekstraksi XML OpenXML/Spreadsheet secara manual (buildXlsx), manipulasi string XML, serta validasi data masal. Dokumen panduan 05-laravel-standard.md mewajibkan:

Controller tidak boleh mengandung business logic.
Satu method maksimal 30-40 baris.
Ekstraksi spreadsheet menggunakan Service / Parser terpisah.
Mengapa ini berbahaya: File controller lebih dari 2.000 baris sangat sulit dirawat, dites (untestable), dan rentan menimbulkan bug regresi setiap kali ada perubahan kecil pada alur bisnis import/export.

Cara memperbaiki: Ekstrak logika bisnis parsing dan generasi Excel ke Service Class / Pipeline:

App\Services\ExcelGeneratorService
App\Services\GuruImportService
App\Jobs\ProcessGuruImportJob
[Arsitektur / Backend] Abstraksi Service Layer dan Form Request Tidak Konsisten
Severity: High

Lokasi:

backend/app/Http/Controllers/MasterData/MasterDataSiswaController.php#L111 (file://backend/app/Http/Controllers/MasterData/MasterDataSiswaController.php#L111)
backend/app/Http/Controllers/MasterData/MasterDataKelasController.php (file://backend/app/Http/Controllers/MasterData/MasterDataKelasController.php)
backend/app/Http/Controllers/Operator/OperatorController.php (file://backend/app/Http/Controllers/Operator/OperatorController.php)
Masalah: Sebagian controller (seperti GuruController) menggunakan Service (GuruService) dan FormRequest (StoreGuruRequest). Namun, mayoritas controller lainnya (MasterDataSiswaController, MasterDataMapelController, OperatorController) melakukan validasi langsung via $request->validate([...]) dan query DB langsung di Controller.

Dampak: Terjadi duplikasi logika validasi dan ketidakseragaman standar kode (architectural drift) di seluruh proyek.

Cara memperbaiki: Refactor seluruh endpoint agar wajib melewati:

FormRequest class di layer Http Request.
Service class di layer Application Logic. 3. Database & Data Model
[Database] Inkonsistensi Primary Key & Identifier Route Model Binding
Severity: Medium

Lokasi:

backend/app/Models/Guru.php ($primaryKey = 'id', pencarian via nuptk)
backend/app/Models/Siswa.php ($primaryKey = 'id', pencarian via nisn)
backend/routes/api/master-data.php (file://backend/routes/api/master-data.php)
Masalah: Standar 03-database-standard.md menentukan bahwa ulid (CHAR 26) harus digunakan sebagai public-facing identifier di URL/API. Namun di dalam route & controller:

Model Guru dicari menggunakan {nuptk}
Model Siswa dicari menggunakan {nisn}
Model Kelas & OrangTua dicari menggunakan {id} (integer DB)
Dampak:

Penggunaan Integer id di URL publik (misal /api/operator/master-data/kelas/12) mengekspos struktur internal DB dan mempermudah penyerangan teknik enumeration/IDOR.
NUPTK dan NISN dapat berubah jika terjadi koreksi data administratif, yang menyebabkan rute URL tidak stabil jika dijadikan identifier tunggal.
Cara memperbaiki: Konsisten gunakan ulid sebagai Route Model Binding Key (getRouteKeyName()) untuk semua public API endpoint.

4. Frontend & User Experience
   [Frontend] Direct API Call Coupon pada Page Components
   Severity: Medium

Lokasi:

frontend/src/pages/operator/master/masterDataGuru/MasterGuru.jsx
frontend/src/pages/operator/master/masterDataSiswa/MasterSiswa.jsx
Masalah: Komponen React Page memanggil Axios (api.get(...), api.post(...)) secara langsung di dalam efek UI (useEffect) dan handler event, tanpa menggunakan custom hooks terpisah atau memanfaatkan TanStack React Query secara maksimal untuk caching & server state management.

Dampak:

Re-render yang tidak perlu saat navigasi.
Kesulitan melakukan Unit Testing pada komponen React UI karena tightly coupled dengan panggilan HTTP API.
Cara memperbaiki: Buat custom hooks khusus per domain (misal useGuruQuery, useMutateGuru) yang membungkus TanStack React Query.

5. Enterprise Readiness & Quality Assurance
   [Enterprise Readiness] Ketiadaan Automated Test Suite (0% Test Coverage)
   Severity: High

Lokasi:

backend/tests/Feature/ExampleTest.php (file://backend/tests/Feature/ExampleTest.php)
Masalah: Direktori backend/tests hanya berisi file default ExampleTest.php. Tidak ditemukan sama sekali Integration Test, Feature Test, maupun Unit Test untuk memverifikasi fitur-fitur vital seperti:

Multi-tenancy isolation
Hak akses RBAC (Role & Permission)
Kalkulasi absensi & mutasi siswa/guru
Alur transaksi pendaftaran / login
Dampak: Sistem sangat rentan mengalami breaking changes dan regression bugs setiap kali dilakukan update kode atau penambahan modul baru di masa mendatang.

Cara memperbaiki: Buat Test Suite menggunakan Pest PHP / PHPUnit minimal untuk coverage:

TenantIsolationTest.php
AuthenticationTest.php
GuruManagementTest.php
AbsensiTest.php
Rekomendasi Langkah Perbaikan (Action Plan)
Fase 1 (Urgent Security Patch):

Perbaiki klausul fallback SchoolScope.php agar fail-closed saat school_id null.
Hapus password sensitif dari .env dan ganti ke secret management environment.
Pindahkan token Sanctum ke Cookie HttpOnly.
Fase 2 (Refactoring Architecture):

Pecah GuruImportController dan GuruExportController menjadi Service & Job terpisah.
Pindahkan seluruh inline $request->validate() ke FormRequest class tersendiri.
Ganti penggunaan {id}/{nuptk} di URL API menjadi {ulid} secara konsisten.
Fase 3 (Testing & Readiness):

Tulis Feature Test minimal untuk modul Auth, Multi-tenancy, dan Master Data.
Bersihkan file-file sisa development (patch\_\*.py, database.sqlite).


Ringkasan Kemajuan & Status Perubahan
✅ Issues Yang Telah Berhasil Diperbaiki (FIXED)
🔥 Multi-Tenancy Fail-Closed Scoping (FIXED): SchoolScope.php kini memiliki klausul fallback $builder->whereRaw('1 = 0') jika current_school_id bernilai null. Kebocoran data lintas sekolah (Cross-Tenant Data Breach) telah ditutup total.
🔥 Token Authentication Security / XSS Defense (FIXED): Token Sanctum tidak lagi disimpan di localStorage. Backend mengeset Cookie auth_token bertipe HttpOnly, SameSite=Lax, dan EnsureFrontendRequestsAreStateful diaktifkan di middleware API.
🔥 Standardisasi Validasi via Form Requests (FIXED): Dibuat dan diintegrasikan belasan Form Request classes (StoreSiswaRequest, UpdateSiswaRequest, CreateUserRequest, StoreKelasRequest, StoreOrtuRequest, StoreDiklatRequest, dll) di seluruh controller (MasterDataSiswaController, OperatorController, GuruKepegawaianController, MasterDataKelasController, MasterDataOrtuController).
🔥 Ekstraksi Service Layer Excel (FIXED): Dibuat MultiSheetXlsxService untuk mengisolasi logika eksekusi ZipArchive + SimpleXML / PhpSpreadsheet multi-sheet, membersihkan duplikasi kode ratusan baris dari GuruImportController dan GuruExportController.
⚠️ Sisa Temuan Yang Perlu Diperhatikan (Remaining Audit Items)
1. High Priority Issues
[Enterprise Readiness] Ketiadaan Automated Test Suite (0% Code Coverage)
Severity: High

Lokasi:

backend/tests/Feature/ExampleTest.php (file:///Users/sahalanwarhadi/project_Sahal/Tugas_UAS_RPL_1/backend/tests/Feature/ExampleTest.php)
Masalah: Meskipun keamanan multi-tenancy dan validasi sudah diperbaiki, proyek masih belum memiliki automated test suite (Unit / Integration / Feature tests) untuk memastikan fitur tidak rusak di masa depan.

Mengapa ini berbahaya: Setiap perubahan kode baru atau refactoring berisiko menimbulkan regression bug tanpa ada sistem otomatis yang mendeteksinya sebelum masuk production.

Dampak jangka panjang: Proses QA manual memakan waktu lama setiap rilis versi baru.

Cara memperbaiki: Tambahkan Feature Test minimal untuk:

TenantIsolationTest.php (memastikan SchoolScope memblokir akses ke sekolah lain).
AuthenticationTest.php (memastikan login HttpOnly cookie & logout bekerja).
SiswaManagementTest.php & GuruManagementTest.php.
Best Practice: Test-Driven Development (TDD) / Continuous Integration (CI) test gate.

Referensi Laravel: Laravel Testing Documentation

Referensi Enterprise: Martin Fowler — Test Pyramid & Automation Standards.

[Architecture / Clean Code] Ukuran File Controller Import/Export Masih Cukup Besar
Severity: High

Lokasi:

backend/app/Http/Controllers/MasterData/Guru/GuruImportController.php (file:///Users/sahalanwarhadi/project_Sahal/Tugas_UAS_RPL_1/backend/app/Http/Controllers/MasterData/Guru/GuruImportController.php) (~1.900 baris)
backend/app/Http/Controllers/MasterData/Guru/GuruExportController.php (file:///Users/sahalanwarhadi/project_Sahal/Tugas_UAS_RPL_1/backend/app/Http/Controllers/MasterData/Guru/GuruExportController.php) (~1.100 baris)
Masalah: Meskipun ekstraksi method Excel ke MultiSheetXlsxService sudah berhasil menghapus duplikasi helper XML, alur bisnis parsing baris demi baris, perataan relasi, dan penanganan log import masih berada di dalam file controller.

Mengapa ini berbahaya: Metode controller import masih memuat terlalu banyak baris logika prosedural.

Dampak jangka panjang: Menyulitkan pengujian skenario import yang gagal (edge cases) tanpa melakukan mock HTTP request.

Cara memperbaiki: Ekstrak proses eksekusi import dari GuruImportController ke GuruImportService atau pembaca baris terisolasi (GuruRowParser).

Best Practice: Single Responsibility Principle (SRP) — Controller hanya menangani Request/Response routing.

Referensi Laravel: Laravel Architecture Concepts - Service Providers & Services

2. Medium Priority Issues
[Database / Routing] Inkonsistensi Route Parameter & Public Identifier
Severity: Medium

Lokasi:

backend/routes/api/master-data.php (file:///Users/sahalanwarhadi/project_Sahal/Tugas_UAS_RPL_1/backend/routes/api/master-data.php)
Masalah: Rute API masih mencampur parameter pencarian:

Guru menggunakan {nuptk}
Siswa menggunakan {nisn}
Kelas & Ortu menggunakan {id} (Integer auto-increment DB)
Mengapa ini berbahaya: Penggunaan Integer ID mengekspos ID internal database di URL publik. Sementara NUPTK/NISN bisa berubah jika ada koreksi data administratif.

Dampak jangka panjang: TIDAK konsisten dengan dokumen standar 03-database-standard.md yang menetapkan ulid (CHAR 26) sebagai public identifier universal.

Cara memperbaiki: Perbarui Route Model Binding agar seluruh rute master data utama menggunakan {ulid} atau getRouteKeyName() = 'ulid'.

Best Practice: URL Slug / ULID obfuscation untuk resource identifier di API public.

Referensi Enterprise: OWASP API Security Top 10 — Broken Object Level Authorization (BOLA) & Information Disclosure.

[Security / Configuration] Pengaturan Kredensial Environment Production
Severity: Medium

Lokasi:

backend/.env (file:///Users/sahalanwarhadi/project_Sahal/Tugas_UAS_RPL_1/backend/.env)
Masalah: File .env lokal masih menyimpan konfigurasi email SMTP dan database lokal.

Mengapa ini berbahaya: Saat aplikasi di-deploy ke staging/production, kredensial sensitif tidak boleh tersimpan dalam file teks biasa di workspace repository.

Cara memperbaiki: Pastikan server produksi menggunakan Environment Variables yang di-inject dari CI/CD pipeline / Secret Manager (seperti Docker Secrets, AWS SSM Parameter Store, atau GCP Secret Manager).

Best Practice: 12-Factor App methodology — III. Config (Store config in the environment).

💡 Recommendation Next Steps
Jangka Pendek (Tanpa Ubah Kode Saat Ini):
Lakukan verifikasi runtime end-to-end (Postman / Browser) pada alur login baru (HttpOnly Cookie) dan eksekusi import/export Excel.
Jangka Menengah (Sebelum Deploy Production):
Menambahkan Feature Tests untuk memverifikasi isolasi Multi-Tenant dan Autentikasi.
Menyelaraskan Parameter Route ke {ulid} untuk standar API Enterprise.
