SaaS SCHOOL SYSTEM — FULL AUDIT REPORT
Nama Project: Scholara (SIAKAD Multi-School SaaS Platform)
Tanggal Audit: 10 Agustus 2026
Auditor: Senior Software Architect, Senior Laravel/React Developer, Cybersecurity Auditor, & SaaS PM
Metode Audit: Reverse Engineering & Technical Analysis (Tanpa Mengubah Kode)

1. Executive Summary
   Proyek Scholara dirancang sebagai platform Sistem Informasi Akademik (SIAKAD) berbasis SaaS Multi-Tenant untuk sekolah dan madrasah (SD/MI, SMP/MTs, SMA/MA/SMK).

Saat ini, proyek berada pada tahap Modular Monolith Transition Phase. Arsitektur dasar multi-tenancy sudah ditanamkan pada lapisan backend (Laravel 12 + Sanctum) dan frontend (React 19 + Vite + TailwindCSS), namun belum siap untuk produksi (NOT Production Ready) maupun deployment SaaS multi-sekolah skala penuh.

Ringkasan Status Proyek:
Production Readiness: ❌ NO (Skor: 5.8 / 10)
SaaS Multi-School Readiness: ❌ NO (Skor: 4.5 / 10)
Fitur Selesai (Backend): ~75% (Modul Guru, Siswa, Kelas, Mapel, Jadwal, Absensi, Pengumuman, LMS, Keuangan, PPDB)
Fitur Selesai (Frontend UI): ~55% (Master Data Guru/Siswa/Kelas komplit; LMS, Keuangan & PPDB masih berupa API-backend tanpa UI komplit)
Cakupan Pengujian (Testing): ~30% (Hanya tersedia Feature Test untuk Auth, Guru, dan Tenant dasar) 2. Architecture Overview
Stack Teknologi Saat Ini:
Frontend: React v19.2.7, Vite v8.1.0, TailwindCSS v4.3.2, React Router DOM v7.18.0, TanStack React Query v5.101.1, Axios v1.18.1, Lucide Icons, Recharts.
Backend: Laravel 12.x (PHP 8.2+), Laravel Sanctum v4.3 (Stateful/Bearer Token Authentication), PhpSpreadsheet v5.9.
Database: MySQL 8.0 / MariaDB (50+ Tabel, InnoDB, Foreign Key Constraints, Soft Deletes).
Alur Eksekusi Sistem (Data Flow):
[Client App: React SPA]
│
▼ (HTTP Request via Axios + Bearer Token + Subdomain/Header)
[TenantMiddleware] (Resolves school_id -> injects app('current_school_id'))
│
▼
[Sanctum Auth & Role/Permission Middleware]
│
▼
[Controller Layer]
│
▼ (Service / Trait HasSchoolScope)
[Eloquent Model + Global Scope SchoolScope] (WHERE school_id = current_school_id)
│
▼
[MySQL Database] 3. Architecture Problems
Separation of Concerns yang Belum Konsisten:

Logika bisnis terdistribusi acak: Sebagian ada di Controller (seperti

OperatorController.php
), sebagian di Service (

GuruImportService.php
), dan sebagian di Form Request / Model.
Modul Raksasa (Monolithic Controller):

GuruImportController.php
(1,335 baris) dan TambahEditGuru.jsx (1,921 baris) melanggar Single Responsibility Principle.
Ketergantungan Kuat Frontend pada Custom Hooks Tanpa Abstraksi API:

Komponen UI sering melakukan panggil HTTP Axios langsung alih-alih menggunakan React Query Service Layer yang terpusat.
Pilihan Arsitektur Masa Depan:

Keputusan: MODULAR MONOLITH (SPA + REST API) adalah arsitektur terbaik untuk Scholara saat ini. Microservices sangat TIDAK DIREKOMENDASIKAN karena akan menimbulkan overhead infrastruktur yang tidak perlu untuk SaaS skala madrasah/sekolah. 4. Database Audit
Temuan Struktur & Integritas Data:
Model & Tabel Pivot yang Hilang (Missing Models):
Tabel orang_tua_siswa, guru_dokumen_logs, guru_import_logs, dan guru_anaks ada di database tetapi tidak memiliki class Model Eloquent resmi, melainkan dimanipulasi dengan DB::table().
Standardisasi Primary Key & Identitas:
Penggunaan ULID (HasUlid) sudah diterapkan pada tabel gurus, siswas, dan users via migration 2026_08_13_000001_add_ulid_to_gurus_and_siswas.php, namun tabel lain seperti kelas, mata_pelajarans, tagihans masih menggunakan auto-increment Integer biasa yang rentan terhadap Enumeration Attack.
Risiko Soft Delete Cascading:
Ketika record Siswa di-soft delete, record anak di siswa_kelas, absensis, dan pembayarans tidak otomatis di-soft delete atau di-cascade, menyisakan orphan transactional records. 5. SaaS / Multi-Tenant Audit
Audit Isolasi Tenant (Sangat Kritis):
CAUTION

TEMUAN SEVERITY CRITICAL: Tenant Isolation Bypass via Header Injection

Lokasi Masalah:

TenantMiddleware.php:L66-L70
Detail:
php
// 2. Dari header X-School-ID (untuk testing atau API mobile)
$headerSchoolId = $request->header('X-School-ID');
if ($headerSchoolId && is_numeric($headerSchoolId)) {
return (int) $headerSchoolId;
}
Risiko: Pengguna dari Sekolah A yang sudah authenticated dapat mengirimkan header HTTP X-School-ID: 2 untuk mengakses data milik Sekolah B. Middleware menerima header ini tanpa memverifikasi apakah user->school_id sesuai dengan header tersebut!
Rekomendasi: Cabut fallback X-School-ID pada environment produksi, atau wajibkan pengecekan auth()->user()->school_id === $headerSchoolId.
Model Tanpa HasSchoolScope:
Model OrangTua, GuruJabatan, GuruDokumen, GuruCuti, GuruMutasi, dan RiwayatKelas TIDAK MENGGUNAKAN HasSchoolScope. Isolasi tenant untuk model ini bergantung sepenuhnya pada relasi parent (seperti Guru atau User), yang berpotensi bocor jika dilakukan query langsung di controller tanpa eager loading scope.

6. Security Audit
   Berikut adalah tabel audit keamanan menyeluruh berbasis bukti empiris:

Location (File & Line) Description / Vulnerability Impact / Scenario Severity Recommendation

TenantMiddleware.php:L67
Header X-School-ID dipercaya tanpa validasi user->school_id. Cross-tenant data access (Tenant Bypassing). CRITICAL Hapus klausa X-School-ID di production / validasi ke user->school_id.

GuruDokumen.php:L123-L126
Dokumen KTP, KK, NPWP, Ijazah disimpan di disk public (Storage::disk('public')->url(...)). PII Exposure (Dokumen identitas guru dapat diunduh siapa saja tanpa login jika URL diketahui). CRITICAL Pindahkan file sensitif ke disk local/private dan gunakan Temporary Signed Stream Response.

OrtuController.php:L247-L253
Penautan akun anak hanya menggunakan NISN & kode_anak tanpa verifikasi fisik. Account Takeover / Unauthorized Child Linkage (Jika kode anak bocor, orang tua lain bisa melihat data nilai/absensi anak). HIGH Tambahkan mekanisme konfirmasi dari Admin Sekolah / Operator sebelum penautan aktif.

keuangan.php:L20-L56
Seluruh endpoint Keuangan tidak dilindungi permission: middleware, hanya role:bendahara,operator. Privilege Escalation (Operator tanpa izin keuangan tetap dapat mengubah data tagihan/pembayaran). HIGH Pasang middleware permission:keuangan.manage, permission:keuangan.view pada setiap sub-route.

AuthController.php
register-ortu di-throttle 10 req/min tanpa verifikasi captcha atau email activation. Spam account creation / Database flooding. MEDIUM Tambahkan email verification link & reCAPTCHA/Turnstile pada registrasi publik. 7. API Audit
Sampel Ringkasan Endpoint API Utama:
METHOD ENDPOINT AUTH ROLE PERMISSION VALIDATION RISK
POST /api/auth/login Public None Yes Medium (Throttle 5/min)
POST /api/auth/register-ortu Public None Yes High (Spam risk)
GET /api/operator/master-data/guru Sanctum role:operator + permission:master_data.guru.view Yes Low
GET /api/operator/master-data/guru/{nuptk}/dokumen/{id}/download Sanctum permission:dms.download Yes Low (Jika disalurkan via Stream)
GET /api/keuangan/pembayaran Sanctum role:bendahara,operator No Granular Perm High (Missing Permission check)
POST /api/lms/tugas/{id}/submit Sanctum role:siswa Yes Low
POST /api/ortu/anak Sanctum role:ortu Yes High (Weak verification logic) 8. Business Logic Audit
Evaluasi Simulasi Workflow Sekolah:
Sekolah Dibuat ➔ Tahun Ajaran Dibuat ➔ Semester Dibuat ➔ Guru/Siswa Diinput ➔ Kelas Dibuat ➔ Plot Guru Mapel ➔ Jadwal Dibuat ➔ Absensi & Nilai ➔ Rapor Generated
Celah Logika Akademik:
Penguncian Nilai / Periode Akademik: Ketika Semester ditandai non-aktif (is_aktif = 0), backend tidak secara ketat memblokir POST /api/absensi atau POST /api/lms/ujian untuk semester lalu. Guru masih dapat mengubah nilai historis jika mengetahui ID tugas/ujian.
Konflik Wali Kelas & Jabatan: Seorang guru dapat diassign menjadi Wali Kelas di 2 kelas yang berbeda pada Tahun Ajaran yang sama karena kurangnya UNIQUE constraint kombinasi (guru_id, tahun_ajaran_id) pada penugasan wali kelas.
Mutasi Siswa: Mutasi siswa belum mencatat snapshot status kelas historis secara immutable. Jika siswa pindah kelas di pertengahan semester, rekap absensi lama ikut terasosiasi ke kelas baru. 9. Role & Permission Audit
Role & Permission Matrix (Backend Enforced):
Role Master Data Guru Master Data Siswa Absensi Keuangan LMS (Materi/Ujian) Pengaturan Sekolah
Super Admin Full Full Full Full Full Full
Operator / Admin Sekolah CRUD CRUD View / Edit View / Edit View Full
Kepala Sekolah View View View Rekap View Laporan View View
Guru / Wali Kelas View Own View Class CRUD Class None CRUD Own None
Bendahara None View None Full CRUD None None
Admin PPDB None Convert Only None PPDB Only None None
Orang Tua None View Child View Child View Child View Child None
Siswa None View Self View Self None Access / Submit None 10. UI/UX Audit
Analisis Tampilan Frontend:
Kualitas Visual & Desain:
Halaman Dashboard dan Master Data Guru/Siswa sudah memiliki estetika yang Modern, Clean, dan Professional menggunakan TailwindCSS 4, Lucide icons, dan komponen visual modern.
Bukan AI Slop / Generic Template: Struktur tabel, filter, dan modal sudah terpasang rapi.
Masalah UX & State Management:
Empty States: Beberapa halaman (seperti LMS Siswa & Keuangan) belum memiliki UI Empty State yang ramah jika data belum tersedia.
Form Monolitik: Form TambahEditGuru.jsx terlalu panjang (>1,900 baris dalam 1 file JSX) tanpa pembagian Tabbed Step Wizard yang modular, membuat pengerjaan form terasa berat bagi pengguna mobile. 11. Performance Audit
Potensi Bottleneck N+1 Query:
Controller MasterGuruController::index meload relasi user, jabatanCurrent, pendidikanTerakhir, unitKerja. Jika tidak di-eager load dengan tepat, fetching 1,000 data guru akan mengeksekusi >4,000 SQL queries.
Estimasi Skalabilitas:
100 - 1,000 Siswa: Sangat lancar pada server single-VPS (2 vCPU, 4GB RAM).
10,000 - 100,000 Siswa / 1,000 Sekolah: Membutuhkan Database Index Optimization pada school_id, caching Redis untuk current_school_id & permissions, serta pemisahan storage dokumen ke Cloud Storage (S3 / Google Cloud Storage). 12. Code Quality Audit
Technical Debt Utama:

GuruImportController.php
(1,335 baris): Harus di-refactor ke dalam GuruImportService, GuruFotoZipService, dan GuruValidationService.
TambahEditGuru.jsx (1,921 baris): Harus dipecah menjadi sub-komponen: FormIdentitas.jsx, FormKepegawaian.jsx, FormPendidikan.jsx.
Penggunaan DB::table() langsung untuk mutasi data alih-alih melalui Eloquent Model. 13. Testing Audit
Kondisi Pengujian Saat Ini:
Backend memiliki unit/feature test dasar untuk Auth, Guru, dan Tenant scope.
Frontend SAMA SEKALI TIDAK MEMILIKI TEST (0 test file di Vite/React).
Rekomendasi Test Prioritas:
Tenant Isolation Test (memastikan User Sekolah A tidak bisa membaca/menulis data Sekolah B).
Grade Lock Test (memastikan nilai tidak bisa diubah setelah semester dikunci).
Document Storage Security Test (memastikan URL dokumen private tidak bisa diakses publik). 14. Production Readiness
SKOR PRODUKSI: 5.8 / 10

Sistem BELUM LAYAK diproduksi karena:

Adanya celah keamanan kritis pada TenantMiddleware (X-School-ID).
Dokumen identitas guru (KTP/NPWP) tersimpan di storage publik.
Modul LMS, Keuangan, dan PPDB di frontend belum terintegrasi penuh secara visual.
Belum ada pipeline CI/CD dan pengujian otomatis frontend. 15. SaaS Readiness
SKOR KESIAPAN SaaS: 4.5 / 10

Sistem BELUM SIAP menjadi platform SaaS multi-sekolah mandiri (Self-serve Multi-tenant SaaS) karena:

Belum ada modul Platform Super Admin Dashboard untuk mengelola pendaftaran sekolah baru (School Provisioning), paket langganan (Subscriptions), tagihan SaaS (Invoices), dan penangguhan akses (Suspension).
Sistem billing / payment gateway (Midtrans / Xendit) untuk pembayaran langganan sekolah belum terhubung. 16. Risk Matrix
Severity Problem Impact Location Recommendation
CRITICAL Tenant Isolation Bypass via X-School-ID Data kebocoran antar sekolah TenantMiddleware.php:L67 Hapus override header pada environment produksi
CRITICAL Public Storage untuk Dokumen Sensitif Guru Kebocoran data pribadi (PII) GuruDokumen.php:L125 Pindahkan file ke private disk + Stream controller
HIGH Unprotected Keuangan API Routes Modifikasi data keuangan oleh pihak tidak berwenang routes/api/keuangan.php Tambahkan middleware permission granular
HIGH Missing Frontend UI for LMS & Keuangan Fitur backend tidak dapat digunakan pengguna frontend/src/pages/ Bangun komponen UI React untuk LMS & Keuangan
MEDIUM Monolithic Code (GuruImport & Form Guru) Kinerja maintenance buruk & bug-prone Backend & Frontend Refactor ke Services & Sub-components 17. Priority Fix (P0 – P3)
P0 — WAJIB DIPERBAIKI SEBELUM PRODUCTION (SECURITY & TENANCY BLOCKERS)
Perbaiki TenantMiddleware.php: Hapus/validasi header X-School-ID agar tidak bisa di-spoofing.
Amankan File Storage Guru: Pindahkan dari storage/app/public ke storage/app/private dan buat Controller download terautentikasi.
Pasang middleware permission: secara lengkap di routes/api/keuangan.php dan routes/api/lms.php.
P1 — SANGAT PENTING (CORE FUNCTIONALITY & UI)
Selesaikan UI Frontend React untuk Modul Keuangan (Tagihan & Pembayaran SPP).
Selesaikan UI Frontend React untuk Modul LMS (Materi, Tugas, Ujian Siswa).
Buat Model Eloquent resmi untuk tabel pivot (orang_tua_siswa, guru_dokumen_logs).
P2 — PENTING (REFACTORING & OPTIMIZATION)
Refactor GuruImportController.php ke dalam GuruImportService.
Pecah TambahEditGuru.jsx menjadi 5 sub-komponen Form Tab Wizard.
Tambahkan Database Indexing pada school_id, created_at, dan status di tabel-tabel utama.
P3 — NICE TO HAVE (SAAS EXPANSION)
Integrasi Payment Gateway (Midtrans) untuk Billing SaaS Sekolah.
Landing Page Dynamic Pricing & Self-service School Registration. 18. Recommended Architecture
Arsitektur yang direkomendasikan untuk Scholara adalah Modular Monolith (SPA + Laravel REST API):

[ Scholara Frontend (React SPA) ]
│
▼ REST API (HTTPS + JSON + Bearer Token)
[ Laravel Modular Monolith App ]
├── Tenant Resolver (Subdomain Domain Router)
├── Security Layer (Sanctum + RBAC Scope)
├── Core Modules (Master Data, Akademik, Absensi)
├── Finance & LMS Modules
└── Storage Engine (Private S3 / Local Secure Storage)
│
▼
[ MariaDB / MySQL Single DB with Column Isolation (school_id) ] 19. Recommended Database Changes
Tambah Model Eloquent untuk Tabel Pivot & Log:
Buat App\Models\OrangTuaSiswa
Buat App\Models\GuruDokumenLog
Pasang HasSchoolScope pada Seluruh Model Anak:
Tambahkan school_id dan HasSchoolScope pada GuruJabatan, GuruDokumen, GuruMutasi, GuruCuti, dan RiwayatKelas.
Database Indexing Optimization:
Tambahkan composite index: INDEX (school_id, status) dan INDEX (school_id, created_at) pada tabel siswas, gurus, absensis, dan pembayarans. 20. Recommended UX Changes
Form Wizarding untuk Data Guru & Siswa:
Ubah form input monolitik menjadi 5-Step Tabbed Wizard:
Step 1: Identitas Pribadi
Step 2: Kepegawaian & Status
Step 3: Pendidikan & Sertifikasi
Step 4: Keluarga & Kontak Darurat
Step 5: Upload Dokumen
Standardisasi State UI (Loading, Empty, Error):
Sediakan komponen reusable <EmptyState title="..." description="..." action="..." /> untuk seluruh tabel dan modul dashboard. 21. Roadmap
PHASE 1: Security & Data Integrity (P0) ──► PHASE 2: UI Completion LMS & Keuangan (P1)
│
▼
PHASE 4: SaaS Billing & Multi-School (P3) ◄── PHASE 3: Refactoring & Testing (P2)
PHASE 1 — Security & Data Integrity: Perbaikan TenantMiddleware, pengamanan storage dokumen PII guru, dan penambahan permission middleware di seluruh route API.
PHASE 2 — UI Integration (Core Modules): Penyelesaian komponen UI React untuk Keuangan (Pembayaran/Tagihan) dan LMS (Materi/Tugas/Ujian).
PHASE 3 — Refactoring & Code Quality: Breaking down file raksasa (GuruImportController.php & TambahEditGuru.jsx), pembuatan unit & integration test coverage (target 70%+).
PHASE 4 — SaaS Readiness: Pembuatan Super Admin Portal, integrasi billing payment gateway, dan deployment multi-tenant di cloud infrastruktur.
Ringkasan Penutup
Audit ini memberikan gambaran yang transparan dan jujur mengenai kondisi codebase Scholara. Fondasi akademik yang dibuat sudah sangat kuat dan kaya fitur. Dengan menyelesaikan perbaikan keamanan (P0) dan melengkapi frontend UI (P1), Scholara akan siap menjadi platform SaaS Sekolah/Madrasah yang Modern, Aman, Profesional, dan Scalable.
