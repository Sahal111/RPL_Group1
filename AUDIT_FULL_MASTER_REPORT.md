# MASTER AUDIT SUMMARY — Scholara


---

# Scholara_ Repository Audit Report

## Ringkasan Eksekutif
**Health Score: 4/10**

Repositori ini menunjukkan tanda-tanda over-engineering yang signifikan pada arsitektur backend dan manajemen state frontend. Penggunaan abstraksi yang berlebihan (terutama pada *Services* dan *Traits*) menambah kompleksitas tanpa memberikan manfaat nyata bagi skalabilitas.

## Daftar Temuan Kritis (Over-engineering)

| Kategori | Lokasi | Temuan | Saran |
| :--- | :--- | :--- | :--- |
| **Yagni** | `backend/app/Services` | Abstraksi berlebih untuk CRUD wrapper. | Pindahkan logika bisnis ke Model/Controller. |
| **Stdlib** | `backend/app/Services` | Penggunaan `Illuminate\Support\Str` untuk operasi string dasar. | Gunakan fungsi native PHP (`substr`, `strpos`, dll). |
| **Yagni** | `backend/app/Traits` | Penggunaan trait untuk abstraksi berlebih. | Gunakan komposisi eksplisit. |
| **Native** | `frontend/src/components` | Ketergantungan pada library chart berat (`recharts`). | Gunakan native SVG/CSS untuk grafik sederhana. |
| **Yagni** | `frontend/src/lib/store.js` | Overload Redux untuk aplikasi skala menengah. | Gunakan `React.useContext` + `useReducer` native. |

## Rekomendasi Perbaikan Refactoring

### Prioritas Tinggi
- **Hapus Redux**: Ganti dengan `React.useContext` dan `useReducer`. Ini akan mengurangi *boilerplate* secara drastis dan memperkecil ukuran *bundle*.

### Prioritas Sedang
- **Flatten Services**: Pindahkan semua *Service class* yang hanya berisi wrapper CRUD (kurang dari 50 baris kode) langsung ke dalam *Controller* atau *Model*.

### Prioritas Rendah
- **Audit Traits**: Evaluasi ulang semua *Traits* dalam `app/Traits`. Hapus yang hanya digunakan di satu tempat atau yang bisa digantikan dengan *class inheritance* yang lebih jelas.

---
*Estimasi net lines code yang bisa dihapus: ~1200 baris (tidak termasuk vendor code).*
*Dependencies yang bisa dihapus: `redux`, `react-redux`, `reselect`, `recharts` (opsional).*


---

# Audit Keamanan & Multi-Tenancy Scholara_

## Ringkasan Eksekutif
Audit keamanan fokus pada isolasi data antar-tenant dan pencegahan akses tidak sah (IDOR). Ditemukan kelemahan kritis pada penerapan isolasi data di tingkat query database dan kurangnya pengecekan otoritas pada beberapa endpoint API.

## Daftar Temuan Kritis

| Tag | Deskripsi Masalah | Perbaikan yang Disarankan | Lokasi |
| :--- | :--- | :--- | :--- |
| **Yagni** | Kurangnya filter `tenant_id` pada query. | Terapkan `GlobalScope` pada base model untuk enforce `school_id`. | `backend/app/Models/` |
| **Security** | Kerentanan IDOR pada fetching data by ID. | Tambahkan `where('school_id', auth()->user()->school_id)` pada setiap query. | `backend/app/Http/Controllers/` |
| **Security** | Pengecekan otorisasi tidak memadai. | Terapkan `$this->authorize()` atau middleware kebijakan pada setiap endpoint. | `backend/app/Http/Controllers/` |

## Rekomendasi Perbaikan

### Prioritas Tinggi
- **Enforcement Global Scope**: Wajibkan `GlobalScope` di semua model tenant agar query tidak secara tidak sengaja mengakses data sekolah lain.
- **Validasi Ownership**: Pastikan setiap controller yang menerima parameter ID melakukan pengecekan kepemilikan (ownership) terhadap `school_id` sebelum mengeksekusi aksi apapun.

### Prioritas Sedang
- **Audit Policy**: Lakukan audit menyeluruh terhadap `GuruDokumenService` dan `PembayaranController`. Pastikan setiap method dilindungi oleh kebijakan otorisasi yang ketat.

---
*Catatan: Isu ini bersifat arsitektural dan sangat kritis bagi keamanan SaaS EdTech. Tidak disarankan melakukan pemangkasan kode pada lapisan keamanan ini.*


---

# Database Performance Audit Report

## Ringkasan Audit

| Temuan | Jumlah / Status |
|---|---|
| Potensi N+1 Kritis | 4 |
| Index Hilang/Tidak Optimal | 5 |
| Rekomendasi Composite Index | 3 |
| Pemisahan Master/Dinamis | ✓ Jelas |

## 1. Potensi N+1 Problem

### 🔴 Daftar Siswa + Absensi + Kelas Aktif — `Kritis`

Model Siswa mendefinisikan absensis() (hasMany), kelasAktif() (belongsToMany), dan riwayatKelas() (hasMany). Jika controller menarik daftar siswa lalu mengakses properti ini di loop (misalnya view rekap per kelas), akan terjadi query terpisah per siswa. Untuk 200 siswa = 600+ query .

**✦ Perbaikan — Eager Loading**

```sql
// Gunakan with() saat menarik daftar siswa
Siswa::with([
    'kelasAktif',
    'absensis' => fn($q) => $q
        ->where('semester_id', $activeSemesterId)
        ->select('siswa_id','tanggal','status'),
])->aktif()->paginate(50);
```

### 🔴 Profil Guru + 18 Relasi Detail — `Kritis`

Model Guru memiliki 18 relasi hasMany (pendidikans, sertifikasis, jabatans, diklats, dokumens, mutasi, cutis, pkgs, absensis, dst). Halaman profil guru yang merender semua bagian tanpa eager loading akan menghasilkan 18+ query extra per guru. Lebih berbahaya lagi di halaman daftar guru .

**✦ Perbaikan — Load Sesuai Kebutuhan**

```sql
// Profil detail: load hanya yang tampil di layar
$guru = Guru::with([
    'jabatanAktif',      // hasOne — bukan jabatans
    'pendidikanTerakhir', // hasOne latestOfMany
    'rekeningUtama',     // hasOne
])->findOrFail($id);

// Untuk daftar guru — JANGAN load relasi detail
Guru::aktif()->select('id','nama','nuptk','status_keaktifan')
    ->paginate(25);
```

### 🟠 Tagihan Siswa + Pembayaran — `Medium`

Model Tagihan → pembayarans() (hasMany). Laporan tunggakan yang menarik semua tagihan lalu menghitung total bayar per tagihan tanpa eager loading atau aggregasi di DB akan menjadi bottleneck. Lebih optimal dengan subquery agregasi.

**✦ Perbaikan — Aggregasi di Query Level**

```sql
// Tambahkan withSum / withCount daripada load relasi
Tagihan::with('jenisTagihan')
    ->withSum('pembayarans as total_dibayar', 'nominal_bayar')
    ->where('school_id', $schoolId)
    ->where('status', 'cicil')
    ->get();
```

### 🟠 Exam → Questions → Answers (3 Level) — `Medium`

Model Exam → questions() → dan ExamStudentSession → answers() . Hasil ujian yang dirender per siswa per soal berpotensi 3-level N+1 jika tidak ada nested eager loading. Di skenario 30 soal × 40 siswa = ratusan query.

**✦ Perbaikan — Nested with()**

```sql
Exam::with([
    'questions:id,exam_id,nomor,bobot',
    'sessions.answers', // nested eager load
])->findOrFail($examId);
```

## 2. Audit Index — Temuan & Rekomendasi

### ❌ tagihans — kolom jatuh_tempo tidak terindex — `Missing Index`

Laporan tunggakan ( scopeTunggakan() ) memfilter dengan jatuh_tempo < now() . Tanpa index, query ini melakukan full-table scan setiap malam/setiap generate laporan. Tabel ini bertumbuh linier setiap bulan per sekolah.

**✦ Tambahkan Index**

```sql
ALTER TABLE tagihans ADD INDEX idx_tagihan_jatuh_tempo (jatuh_tempo);
-- Atau composite jika sering filter bersama status:
ALTER TABLE tagihans ADD INDEX idx_tagihan_school_jtempo_status
  (school_id, jatuh_tempo, status);
```

### ❌ pembayarans — kolom status tidak terindex — `Missing Index`

scopeValid() memfilter status = 'valid' . Rekap pembayaran harian/bulanan tanpa index pada status akan memperlambat laporan keuangan bendahara. Sama berlaku untuk pembayaran_ppdb dan guru_cuti .

**✦ Tambahkan Index**

```sql
ALTER TABLE pembayarans
  ADD INDEX idx_bayar_school_status (school_id, status, tanggal_bayar);

ALTER TABLE pembayaran_ppdb
  ADD INDEX idx_ppdb_bayar_status (school_id, status);

ALTER TABLE guru_cuti
  ADD INDEX idx_gurucuti_status (school_id, status);
```

### ⚡ nilai_akhirs — missing composite (school_id, siswa_id, semester_id) — `Kurang Optimal`

Index idx_nilaiakhir_siswa hanya cover (siswa_id, semester_id) tanpa school_id di depan. Query rapor yang dimulai dari school_id (lewat SchoolScope) tidak akan pakai index ini secara optimal di multi-tenant.

**✦ Tambahkan Composite**

```sql
ALTER TABLE nilai_akhirs
  ADD INDEX idx_nilaiakhir_school_siswa_smt
    (school_id, siswa_id, semester_id);
```

### ⚡ riwayat_kelas — missing (school_id, kelas_id, siswa_id) — `Kurang Optimal`

Relasi Siswa::kelasAktif() bergabung melalui tabel pivot riwayat_kelas . Daftar siswa per kelas aktif (query paling sering di halaman presensi) belum memiliki composite index yang ideal dengan school_id sebagai leading column.

**✦ Tambahkan Composite**

```sql
ALTER TABLE riwayat_kelas
  ADD INDEX idx_riwkel_school_kelas_siswa
    (school_id, kelas_id, siswa_id, tanggal_keluar);
```

### ⚡ pembayarans — missing (school_id, tanggal_bayar) — `Kurang Optimal`

Laporan kas harian dan rekap bulanan membutuhkan filter school_id + tanggal_bayar secara bersamaan. Index idx_bayar_tanggal yang ada hanya cover tanggal_bayar saja — tidak menggunakan SchoolScope secara efisien.

**✦ Tambahkan Composite**

```sql
ALTER TABLE pembayarans
  ADD INDEX idx_bayar_school_tanggal (school_id, tanggal_bayar, status);
```

### ✅ Index yang sudah baik — `Bagus`

Tabel-tabel berikut sudah memiliki composite index yang solid untuk query utamanya:

## 3. Pemisahan Master Data vs Data Dinamis

Skema memiliki pemisahan yang cukup jelas antara data statis dan transaksional. Ditemukan 19 tabel global/master (tanpa school_id) dan 89 tabel tenant/transaksional.

### ⚠️ SiswaKelas — Alias Deprecated Belum Dihapus — `Tech Debt`

Kelas SiswaKelas adalah alias @deprecated yang mewarisi RiwayatKelas . Jika masih ada kode yang mereferensikan SiswaKelas , ini bisa menyebabkan kebingungan mapping dan hidden bugs. Wajib dihapus setelah semua referensi dimigrasikan.

### ⚠️ activity_logs — Bisa Membengkak Cepat — `Perhatian Pertumbuhan`

Tabel activity_logs dan notification_logs adalah append-only log tanpa mekanisme archiving atau TTL di skema. Dengan sekolah aktif dan banyak aksi harian, tabel ini bisa menjadi puluhan juta baris dalam setahun. Sudah ada data_retention_policies tapi belum terhubung ke jobs cleanup.

**✦ Rekomendasi**

```sql
-- Jadwalkan job untuk archiving log > 1 tahun
-- Atau tambahkan partisi per bulan pada activity_logs
ALTER TABLE activity_logs
  PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (...);
```

### ✅ SchoolScope — Isolasi Tenant Solid — `Baik`

Implementasi SchoolScope dengan fail-closed pattern ( 1 = 0 jika school_id tidak terresolve) sudah tepat. 26 dari model utama menggunakan trait ini. Konsistensi penggunaan perlu dijaga — model seperti RiwayatKelas dan Guru yang tidak menggunakan trait harus pastikan semua query-nya selalu menyertakan where school_id secara eksplisit.

| Kategori | Jumlah | Contoh |
|---|---:|---|
| 🗂 Master / Static | 19 | plans master_religions master_school_types master_blood_types global_users saas_coupons sessions / cache |
| ⚡ Dinamis / Transaksional | 89 | absensis nilais tagihans pembayarans activity_logs notification_logs exam_answers + 82 lainnya |

---

*Dokumen Markdown ini dikonversi dari `db_performance_audit_report.html` tanpa mengubah substansi temuan audit.*


---

# Laporan Audit Sistem Transaksi Keuangan (SPP)

## Ringkasan Eksekutif
Audit fokus pada aspek integritas data, pencegahan *race condition*, dan manajemen status transaksi keuangan. Mengingat aplikasi ini menggunakan pendekatan frontend-heavy, perlindungan utama saat ini bergantung pada *optimistic UI* dan *request handling*.

## Daftar Temuan Kritis

| Tag | Deskripsi Masalah | Perbaikan yang Disarankan | Lokasi |
| :--- | :--- | :--- | :--- |
| **Security** | Risiko mutasi riwayat pembayaran. | Implementasikan *audit logging* dan *immutable history* di backend. | `src/hooks/api/useKeuangan.js` |
| **Yagni** | Potensi *race condition* (duplikasi request). | Gunakan *disabled state* pada tombol aksi saat proses berjalan. | `src/hooks/api/useKeuangan.js` |
| **Shrink** | *Illegal state jump* (transisi status tidak valid). | Terapkan *backend-side state machine* yang ketat (misal: Paid tidak bisa ke Failed). | `src/hooks/api/useKeuangan.js` |

## Rekomendasi Perbaikan

### Prioritas Tinggi
- **Pencegahan *Double-Click***: Pastikan semua tombol transaksi keuangan di UI memiliki status `disabled` saat *request* dikirim untuk mencegah *race condition* yang memicu duplikasi transaksi.
- **Backend Atomicity**: Karena *race condition* bisa terjadi di tingkat database, pastikan backend menggunakan *database transactions* (`DB::beginTransaction`) dan *pessimistic locking* (`FOR UPDATE`) saat memproses pembayaran.

### Prioritas Sedang
- **Audit Logging**: Jangan pernah mengizinkan pembaruan langsung pada record pembayaran yang sudah sukses (*Paid*). Jika ada koreksi, buatlah record baru (*reversal/void entry*) sebagai bagian dari jejak audit keuangan yang sah.

---
*Catatan: Audit ini berfokus pada logika interaksi transaksi. Integritas keuangan yang sebenarnya harus ditegakkan di sisi backend melalui atomicity database dan kontrol akses yang ketat.*


---

# AUDIT_COMPREHENSIVE_REPORT: Scholara
Health Score: 6/10

## Summary Findings
| Area | Status | Criticality |
| :--- | :--- | :--- |
| Multi-Tenancy | Solid | Medium |
| Security | Vulnerable | High |
| Architecture | Decent | Low |
| Performance | Improving | Medium |
| Frontend | Untested | High |

## Detail Temuan Kritis
1. **IDOR Vulnerability**
   - **Path**: `app/Http/Controllers/Api/*`
   - **Issue**: Direct usage of `find($id)` without verifying `school_id` owner.
   - **Impact**: Cross-tenant data leakage.
   - **Recommendation**: Always use `Auth::user()->school_id` as the root scope in queries:
     `Siswa::where('school_id', Auth::user()->school_id)->find($id);`

2. **Mass Assignment**
   - **Path**: `app/Models/*`
   - **Issue**: Models relying on `$fillable = ['*']` or over-inclusive arrays.
   - **Impact**: Malicious user injecting `school_id` or `role` fields.
   - **Recommendation**: Define explicit `$fillable` arrays.

3. **API Response Consistency**
   - **Path**: `app/Traits/ApiResponse.php`
   - **Issue**: Inconsistent return formats across different controllers.
   - **Recommendation**: Enforce a unified `success` and `error` structure via middleware/base controller.

## Rekomendasi Action Plan
1. **Immediate**: Audit all `*Controller.php` for `find($id)` queries and refactor to use `HasSchoolScope` or explicit tenant checks.
2. **Short-term**: Formalize `FormRequest` validation with `Rule::exists('table')->where('school_id', ...)` to prevent cross-tenant ID injection.
3. **Mid-term**: Implement `Pest` or `PHPUnit` tests that specifically attempt to access resources from Tenant B while authenticated as Tenant A.


---

# Master Audit Summary Report

## Executive Summary
This document consolidates audit findings across architecture, security, database performance, and transaction integrity for the **Scholara_** project.

---

## 1. Architectural Over-engineering
*Finding*: Excessive use of abstraction layers (Services/Traits) and heavy frontend dependencies (Redux/Recharts).
*Recommendation*: Simplify to native React context and flatten service-layer CRUD wrappers.

## 2. Security & Multi-Tenancy (Critical)
*Finding*: IDOR vulnerabilities due to insufficient tenant scoping on model lookup (`find($id)`) and potential mass assignment issues.
*Recommendation*: Enforce `GlobalScope` consistently. Audit all controllers for tenant ownership verification.

## 3. Database Performance
*Finding*: Critical N+1 query patterns in student/guru profile loading and missing composite indexes on transactional tables.
*Recommendation*: Implement eager loading, add missing composite indexes (school_id + query predicates), and establish data cleanup jobs for logs.

## 4. Transaction Integrity (Financial)
*Finding*: Risk of race conditions in frontend requests and potential for mutable financial history.
*Recommendation*: Implement frontend `disabled` state handling, use DB-level transactions with pessimistic locking in backend, and ensure immutable audit logs for payments.

---

## Summary of Action Plan
| Priority | Task |
| :--- | :--- |
| **Critical** | Fix IDOR vulnerabilities in `*Controller.php` |
| **High** | Implement proper model `$fillable` constraints |
| **High** | Add missing indexes to `tagihans`, `pembayarans`, `riwayat_kelas` |
| **Medium** | Implement frontend request locking to prevent race conditions |
| **Low** | Refactor over-engineered Services/Traits |

*Lean already. Ship.*


---

# Audit Summary Findings (Over-engineering)

## 1. Executive Summary
Repositori `Scholara` memiliki pondasi arsitektur yang kuat namun menderita karena abstraksi berlebih (over-engineering) dan duplikasi dokumentasi yang tidak perlu. Laporan ini merangkum temuan dari audit codebase dan dokumen teknis.

---

## 2. Findings (Ranked by Cut Magnitude)

### Documentation (Folder `docs/`)
- **delete** Gabungkan 5 file audit terpisah (`AUDIT_REPORT.md`, `Business_Logic_Audit_Report.md`, `SaaS_Audit_Report.md`, `Security_Audit_Report.md`, `UI_UX_Audit_Report.md`) ke dalam satu dokumen terpusat. [docs/]
- **delete** Hapus `02-architecture.md` (redundant/stale diagram). Gunakan `CLAUDE.md` sebagai *source of truth*. [docs/02-architecture.md]
- **delete** Hapus `16-contribution-guide.md` (terlalu panjang). Ringkas aturan utama di `README.md`. [docs/16-contribution-guide.md]

### Backend (`backend/`)
- **yagni** Hapus abstraksi berlebih pada CRUD wrapper di `app/Services/`. Pindahkan ke Controller/Model. [backend/app/Services/]
- **stdlib** Ganti `Illuminate\Support\Str` untuk manipulasi string sederhana dengan fungsi native PHP. [backend/app/Services/]
- **yagni** Hapus `app/Traits/` yang hanya digunakan di satu tempat. Gunakan komposisi eksplisit. [backend/app/Traits/]

### Frontend (`frontend/`)
- **yagni** Ganti `redux` dengan `React.useContext` + `useReducer` (boilerplate reduction). [frontend/src/lib/store.js]
- **native** Hapus library chart `recharts`. Gunakan SVG/CSS native untuk grafik sederhana. [frontend/src/components/]

---

## 3. Summary Impact
*   **Net lines removable:** ~2,000 baris (dokumentasi + boilerplate code).
*   **Dependencies removable:** `redux`, `react-redux`, `reselect`, `recharts`.

---
Lean already. Ship.

