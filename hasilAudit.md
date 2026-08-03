LAPORAN AUDIT PROJECT
Sistem Informasi Akademik & Absensi MI Nurul Huda 3

Audit ini mencakup analisis menyeluruh terhadap arsitektur, struktur folder, codebase Laravel (Backend), dan React (Frontend). Laporan ini menyoroti kekurangan, pelanggaran best practice, serta area perbaikan tanpa mengubah kode terlebih dahulu.

1. Database
   Tabel Plural vs Singular: Skema database menggunakan campuran penamaan (seperti kelas, wali_kelas, siswas, gurus, orang_tuas, absensis). Walaupun Eloquent mendukung deklarasi $table, inkonsistensi penamaan tabel (beberapa plural baku, beberapa singular) sedikit memicu risiko kesalahan konfigurasi relasi.
   Foreign Key Constraints & Cascade: Sebagian relasi pivot atau relasi detail (seperti guru_dokumens, guru_keluargas) bergantung pada penanganan logika manual di controller/service alih-alih memanfaatkan ON DELETE CASCADE atau ON DELETE SET NULL secara menyeluruh di level skema DB.
   Tipe Data & Indexing: Beberapa kolom pencarian frekuensi tinggi (seperti nuptk, nisn, nip, kode_anak) memerlukan indeks unik (UNIQUE index) yang eksplisit di database untuk performa query saat data membengkak.
2. Migration
   Dummy / Empty Migration File:
   2026_07_12_300000_note_schema_v3_from_sql_dump.php tidak memiliki instruksi Schema::create(...) di method up(), melainkan hanya berisi komentar bahwa database di-import langsung dari file SQL dump (db_minurulhuda3.sql).
   Dampak:
   Perintah php artisan migrate:fresh atau deployment CI/CD otomatis tidak akan membentuk skema database dari nol.
   Perubahan versi skema DB (version control for database) menjadi tidak terlacak melalui file migration Laravel.
3. Seeder & Factory
   Strukur Seeder Terpisah & Penggunaan DB::table:
   DatabaseSeeder.php hanya memanggil TahunAjaranSeeder, OperatorSeeder, dan PengumumanSeeder. Seeder data master seperti Guru, Siswa, dan Kelas belum masuk ke skema seeding standar.
   Seeder banyak menggunakan DB::table(...)->insertOrIgnore(...) alih-alih Eloquent Model. Hal ini melewati event Eloquent (seperti creating, booted) serta casting tipe data.
   Factory Belum Dimanfaatkan Maksimal:
   KelasFactory, SiswaFactory, MataPelajaranFactory, dan UserFactory sudah tersedia di database/factories/, namun tidak dipanggil di DatabaseSeeder untuk automated unit/feature testing.
4. Model
   Pelanggaran Single Responsibility (Fat Models):
   Model Guru.php memuat lebih dari 25 relasi dan logika bisnis audit logging di event booted().
   Resource Transformation yang Kosong:
   GuruResource.php dan SiswaResource.php hanya mengembalikan parent::toArray($request); tanpa melakukan pemformatan/filtering atribut sensitif.
   Ketersediaan Soft Deletes:
   Penggunaan SoftDeletes pada Guru, Siswa, Kelas, TahunAjaran sudah baik, namun beberapa relasi pivot (seperti riwayat_kelas) belum ter-cascade jika parent di-soft-delete.
5. Controller
   Ukuran File Sangat Besar (Monolithic Controller):
   MasterDataGuruController.php mencapai 5.078 baris kode dalam satu file. File ini menangani CRUD Guru, Keluarga, Anak, Kontak Darurat, Pendidikan, Sertifikasi, Inpassing, Dokumen (DMS), Rekening, Kompetensi, Penugasan, Diklat, Mutasi, Jabatan, PKG, hingga Import/Export Excel & ZIP.
   Tidak Menggunakan Form Request Class:
   Validasi dilakukan langsung di dalam method controller menggunakan $request->validate([...]). Hal ini membuat method controller terlalu panjang dan sulit di-reuse atau di-test secara terisolasi.
   Respons HTTP & Error Handling:
   Banyak method menangkap exception dengan try-catch umum dan mengembalikan format respons JSON yang bervariasi.
   Beberapa manipulasi data multi-tabel belum terbungkus dalam DB::transaction(...).
6. API & Route
   File api.php Terlalu Panjang (357 Baris):
   Semua endpoint (Auth, Operator, Master Data, Guru, Kepsek, Ortu, Absensi) ditulis secara bertumpuk dalam satu file routes/api.php.
   Inkonsistensi Method HTTP untuk Form Data / Upload:
   Terdapat workaround seperti Route::post('/guru/{nuptk}/cuti/{id}', ...) dan Route::post('/guru/{nuptk}/mutasi/{id}', ...) sebagai fallback FormData karena limitation multipart/form-data pada method PUT di PHP/Laravel. Seharusnya menggunakan method spoofing \_method=PUT.
7. Middleware
   RoleMiddleware.php:
   Pengecekan role menggunakan $user->roles->pluck('slug') dan intersect($roles).
   Kekurangan: $user->roles memicu Lazy Loading jika relasi roles tidak di-eager load sebelumnya di guard authentication, yang dapat menambah overhead query pada setiap request terproteksi.
8. React (Frontend)
   Komponen Raksasa (Monolithic Components):
   DetailGuru.jsx mencapai 7.641 baris kode dalam 1 file.
   MasterGuru.jsx mencapai 2.515 baris kode.
   TambahEditGuru.jsx mencapai 1.921 baris kode.
   Dampak: Re-render sangat berat, sulit didebug, serta melanggar prinsip modularitas komponen React.
   State Management & Fetching Data:
   Banyak komponen masih menggunakan useEffect + useState manual dengan axios.get() alih-alih memanfaatkan @tanstack/react-query secara konsisten (meskipun React Query sudah terpasang di package.json).
   Hardcoded Base API URL:
   Terdapat perulangan variabel BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001" di beberapa file komponen layout.
9. Layout & Sidebar
   Redundansi Kode Layout:
   Terdapat OperatorLayout, GuruLayout, KepsekLayout, OrtuLayout, WaliKelasLayout, BendaharaLayout, dan AdminPpdbLayout.
   GuruLayout, WaliKelasLayout, dan BendaharaLayout memiliki struktur kode flex wrapper & padding yang hampir identik 100%, hanya berbeda daftar menu yang dioper.
   Dua Komponen Sidebar Berbeda:
   Terdapat Sidebar.jsx (digunakan oleh Guru, Wali Kelas, Bendahara) dan OperatorSidebar.jsx (digunakan khusus Operator). Ini memicu duplikasi logika penanganan user profile & avatar.
10. Folder Structure & Coding Style
    Penyebaran Helper Script:
    Di root folder project terdapat file-file script eksternal seperti patch_frontend.py, patch_modal.py, patch_portal.py, patch_modal_requirements.py, desain.md, CLAUDE.md, PROMPT_TEMPLATES.md.
    Coding Style & Formatter:
    Penggunaan campuran antara lucide-react dan Google Material Icons (Font icon material-icons).
    Kurangnya pembagian sub-komponen (atomic components) pada modul-modul master data.
    RANGKUMAN REKOMENDASI PERBAIKAN (NEXT STEPS)
    Apabila perbaikan nantinya disetujui untuk dilaksanakan, perubahan kode akan mengikuti aturan format yang Anda minta:

text
Lokasi File: path/to/file.ext
BEFORE:
[kode lama]
AFTER:
[kode baru]
Penjelasan:
[alasan perbaikan]
Prioritas Perbaikan yang Disarankan:
Refactoring File Controller & Komponen Raksasa:
Memecah MasterDataGuruController.php (5000+ baris) menjadi sub-controller/service terpisah (GuruDokumenController, GuruMutasiController, GuruCutiController, dll.).
Memecah DetailGuru.jsx (7600+ baris) menjadi tab-tab komponen terpisah (TabIdentitas, TabPendidikan, TabDokumen, dll.).
Penerapan Form Request:
Memindahkan aturan validasi dari Controller ke app/Http/Requests/....
Pemberdayaan React Query:
Mengonversi pencarian & pemanggilan data dari useEffect manual ke custom hooks React Query (useQuery, useMutation).
Restrukturisasi Route:
Memecah routes/api.php menjadi file-file route modular di folder routes/api/ (misal: operator.php, guru.php, kepsek.php).
