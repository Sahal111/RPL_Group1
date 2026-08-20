# APP & ROUTES AUDIT REPORT
**SaaS Manajemen Sekolah — `app/` + `routes/`**
**Tanggal Audit:** 2026-08-20 | **File diaudit:** 230+ PHP files

---

## 1. Executive Summary

| Dimensi | Score | Catatan |
|---------|-------|---------|
| **Security** | 62/100 | 1 path traversal kritis, 3 auth bypass, banyak missing policy enforcement |
| **Architecture** | 74/100 | Struktur baik, SchoolScope solid, tapi controllers masih terlalu tebal |
| **Multi-Tenant** | 78/100 | Fondasi kuat, tapi ada kebocoran di Galeri, Pengumuman, BK, LMS |
| **Authorization** | 65/100 | Policies ada tapi tidak dipakai di controller. Permission middleware tidak konsisten |
| **Performance** | 70/100 | Beberapa N+1 dan full table scan di dashboard kepsek |

**Kesimpulan:** Backend ini **belum aman untuk production SaaS ribuan sekolah**. Ada 1 kerentanan directory traversal yang bisa membaca file `.env`, 3 isu cross-tenant data leakage aktif, dan authorization layer yang tidak konsisten. Yang sudah bagus: SchoolScope + TenantMiddleware + HasSchoolScope sudah dirancang dengan benar dan menutup sebagian besar risiko. Isu yang ditemukan bersifat surgical — tidak perlu rewrite besar.

---

## 2. 🔴 Critical Security Issues

| Severity | File | Method | Masalah | Risiko | Solusi |
|----------|------|--------|---------|--------|--------|
| 🔴 Critical | `GuruDokumenController.php` | `downloadFile()` | Parameter `?path=` dari query string langsung dikonkatenasi ke `storage_path('app/public/' . $filePath)` tanpa validasi. Attacker bisa kirim `path=../../../../.env` | Baca file `.env`, kunci database, API keys — **total compromise** | Validasi: `realpath()` harus dimulai dari `storage_path('app/public')`. Atau hapus method ini, pakai `downloadDokumen()` yang sudah aman. |
| 🔴 Critical | `PengumumanController.php` | `index()` | Menggunakan `$request->user()->role_id` untuk cek admin, tapi kolom `role_id` sudah **dihapus dari tabel users** (sistem sekarang pakai `user_roles` many-to-many). Nilai selalu `null` → semua user diperlakukan sebagai non-admin | Authorization logic rusak diam-diam. Semua user melihat pengumuman terjadwal yang belum dipublish. Juga: lihat isu #3. | Ganti ke `$request->user()->hasRole('operator')` atau gunakan permission middleware. |
| 🔴 Critical | `GaleriController.php` (public) | `index()` | `Galeri` model **tidak menggunakan `HasSchoolScope`**. Route `/galeri` adalah public (tanpa auth). Query `Galeri::with('uploader')->get()` mengembalikan galeri **semua sekolah** sekaligus | Data sekolah A terekspos ke pengunjung sekolah B. Cross-tenant data leakage di endpoint public. | Tambahkan `HasSchoolScope` ke model `Galeri`. Untuk public endpoint, resolve school dari subdomain sebelum query. |
| 🔴 Critical | `PengumumanController.php` (public) + `OrtuController.php` | `index()` + `pengumuman()` | `Pengumuman` model **menggunakan `HasSchoolScope`** ✅, tapi route `GET /pengumuman` adalah public (tanpa auth + tanpa TenantMiddleware). Ketika tidak ada school_id, SchoolScope di-fallback ke `whereRaw('1 = 0')` → kosong. Ini benar untuk query, tapi artinya endpoint public tidak berguna jika tanpa subdomain. Lebih parah: `OrtuController::pengumuman()` query `Pengumuman::whereIn('target', ['semua', 'ortu'])` tanpa memvalidasi bahwa pengumuman tersebut milik sekolah ortu. | Ortu dari sekolah A bisa lihat pengumuman sekolah B jika subdomain dimanipulasi | Semua endpoint harus memastikan school_id ter-resolve sebelum query. |
| 🔴 Critical | `CatatanController.php` + `KonselingController.php` (BK) | `store()` | Validasi `'siswa_id' => 'required|exists:siswas,id'` tidak memfilter `school_id`. Guru BK dari **sekolah A** bisa kirim `siswa_id` dari **sekolah B** → catatan BK bocor ke sekolah lain | Data bimbingan konseling (termasuk data sensitif perilaku siswa) terattach ke siswa sekolah lain | Ganti ke: `Rule::exists('siswas', 'id')->where('school_id', app('current_school_id'))` |
| 🟠 High | `InjectTokenFromCookie.php` | `handle()` | Jika `Crypt::decryptString()` gagal (`DecryptException`), middleware menggunakan cookie **raw as-is** sebagai bearer token. Ini bypass enkripsi cookie. | Attacker yang bisa membuat cookie `auth_token` dengan token Sanctum yang valid (bukan encrypted) bisa bypass enkripsi | Jika decrypt gagal → reject request dengan 401, jangan fallback ke raw. |
| 🟠 High | `OperatorController.php` | Semua method dengan `$id` | `User::findOrFail($id)` — **User model memiliki `HasSchoolScope`** ✅, jadi query otomatis scoped ke school operator yang login. Tapi `resetPassword()` tidak mengecek apakah target user adalah operator lain yang lebih senior. Operator bisa reset password operator lain di sekolah yang sama. | Privilege escalation antar operator dalam satu sekolah | Tambahkan guard: operator tidak bisa reset password user dengan role yang sama atau lebih tinggi. |
| 🟠 High | Multiple FormRequests | `rules()` | `exists:siswas,id`, `exists:gurus,id`, `exists:kelas,id`, `exists:mapels,id`, `exists:tagihans,id` — **tidak memfilter school_id**. SchoolScope memproteksi query di controller, tapi validation layer memvalidasi existence lintas sekolah. User sekolah A bisa kirim ID resource sekolah B dan lolos validation (walaupun controller akan 404 karena SchoolScope). Ini tidak fatal karena controller aman, tapi memberikan informasi eksistensi resource sekolah lain (information disclosure). | Information disclosure: attacker bisa enumerate ID resource sekolah lain melalui validation error messages | Gunakan `Rule::exists('table', 'id')->where('school_id', app('current_school_id'))` di semua FormRequest |

---

## 3. 🏢 Multi-Tenant Audit

| File | Method | Resource | Tenant Check | Status | Perbaikan |
|------|--------|----------|--------------|--------|-----------|
| `TenantMiddleware.php` | `resolveSchoolId()` | school_id | Subdomain → DB + user->school_id fallback | ✅ Aman | - |
| `SchoolScope.php` | `apply()` | Semua model | Fail-closed (`1=0`) jika tidak ada school_id | ✅ Aman | - |
| `HasSchoolScope.php` | `bootHasSchoolScope()` | Auto-inject school_id on create | Set dari container | ✅ Aman | - |
| `User.php` | Model | users | HasSchoolScope ✅ | ✅ Aman | - |
| `Guru.php` | Model | gurus | HasSchoolScope ✅ | ✅ Aman | - |
| `Siswa.php` | Model | siswas | HasSchoolScope ✅ | ✅ Aman | - |
| `Galeri.php` | Model | galeris | **TIDAK ada HasSchoolScope** | 🔴 Berisiko | Tambahkan `HasSchoolScope` |
| `Pengumuman.php` | Model | pengumumans | HasSchoolScope ✅ | ⚠️ Perlu diperbaiki | Public route belum resolve school sebelum query |
| `BkCatatan.php` | Model | bk_catatans | HasSchoolScope (perlu verifikasi) | ⚠️ Perlu diperbaiki | Validation `exists:siswas,id` tidak scope ke school |
| `OperatorController.php` | `createGuru()` | Guru | `Guru::where('nuptk', $nuptk)` — SchoolScope aktif ✅ | ✅ Aman | - |
| `OperatorController.php` | `toggleActive()`, `resetPassword()`, `destroy()` | User | `User::findOrFail($id)` — SchoolScope aktif ✅ | ✅ Aman (tapi lihat privilege concern) | - |
| `OrtuController.php` | `dashboard()`, `profilAnak()`, dll | Siswa | Semua query via `OrangTua::where('user_id', $user->id)` | ✅ Aman | - |
| `GuruDokumenController.php` | `downloadFile()` | File | Path dari query string, no tenant check | 🔴 Berisiko | Hapus method atau validasi path |
| `ExamController.php` | `mulai()`, `jawab()`, `submit()` | Exam, Session | SchoolScope pada Exam ✅. Session cek `siswa_id = auth()->user()->siswa?->id` ✅ | ✅ Aman | - |
| `PembayaranController.php` | `store()` | Tagihan, Pembayaran | SchoolScope ✅. `lockForUpdate()` untuk race condition ✅ | ✅ Aman | - |
| `NaikKelasController.php` | `proses()` | Kelas | `Kelas::findOrFail()` — SchoolScope ✅ | ✅ Aman | - |

---

## 4. 🛣️ Route Security Audit

| Route | Middleware | Controller | Auth | Authorization | Tenant | Status |
|-------|------------|------------|------|---------------|--------|--------|
| `GET /galeri` | — | `GaleriController::index` | ❌ Public | ❌ None | 🔴 Cross-school | 🔴 |
| `GET /pengumuman` | — | `PengumumanController::index` | ❌ Public | ❌ None | ⚠️ Depends on subdomain | ⚠️ |
| `GET /auth/verify-reset-token` | throttle:10,1 | Lambda/PasswordResetController | ❌ Public | N/A | ❌ None | ⚠️ |
| `POST /auth/login` | throttle:5,1 | `AuthController::login` | ❌ Public | Cross-tenant check ✅ | ✅ Subdomain | ✅ |
| `POST /auth/forgot-password` | throttle:3,10 | `PasswordResetController` | ❌ Public | Anti-enum ✅ | ⚠️ No school filter on token | ⚠️ |
| `GET /operator/users` | auth:sanctum, role:operator, permission:akun.view | `OperatorController::index` | ✅ | ✅ | ✅ | ✅ |
| `PATCH /operator/users/{id}/toggle-active` | auth:sanctum, role:operator, permission:akun.toggle_active | `OperatorController::toggleActive` | ✅ | ⚠️ No role hierarchy check | ✅ SchoolScope | ⚠️ |
| `PATCH /operator/users/{id}/reset-password` | auth:sanctum, role:operator, permission:akun.reset_password | `OperatorController::resetPassword` | ✅ | ⚠️ Can reset any user same school | ✅ SchoolScope | ⚠️ |
| `GET /operator/master-data/guru/{nuptk}/dokumen/{id}/download` | auth:sanctum, role:operator,kepsek, permission:dms.download | `GuruDokumenController::downloadDokumen` | ✅ | ✅ | ✅ via guru relation | ✅ |
| `GET /operator/master-data/guru/{nuptk}/file-download` | auth:sanctum, role:operator,kepsek, permission:dms.download | `GuruDokumenController::downloadFile` | ✅ Auth ada | 🔴 **Path traversal** | 🔴 No path validation | 🔴 |
| `POST /lms/materi`, `tugas`, `ujian` | auth:sanctum, role:guru,wali_kelas,operator | `CourseMaterialController::store` | ✅ | ⚠️ No permission middleware | ✅ SchoolScope | ⚠️ |
| `GET /keuangan/jenis-tagihan/` | auth:sanctum, role:bendahara,operator | `JenisTagihanController::index` | ✅ | ⚠️ No per-action permission | ✅ SchoolScope | ⚠️ |
| `GET /keuangan/tagihan/rekap-siswa/{siswaId}` | auth:sanctum, role:bendahara,operator | `TagihanController::rekapSiswa` | ✅ | ⚠️ `siswaId` is integer, SchoolScope should cover | ✅ | ⚠️ verify |
| `GET /absensi/siswa/{nisn}` | auth:sanctum, permission:absensi.view_kelas_sendiri,absensi.view_all | `AbsensiController::bySiswa` | ✅ | ⚠️ Ortu bisa akses endpoint ini? | ✅ SchoolScope | ⚠️ |
| `GET /ppdb/calon-siswa/{id}` | auth:sanctum, role:admin_ppdb,operator | `CalonSiswaController::show` | ✅ | ✅ SchoolScope | ✅ | ✅ |
| `POST /bk/catatan` | auth:sanctum, role:guru_bk,kepsek,wakasek,operator | `CatatanController::store` | ✅ | 🔴 `siswa_id` validation cross-school | ⚠️ | 🔴 |
| `POST /ortu/anak` | auth:sanctum, role:ortu | `OrtuController::tambahAnak` | ✅ | ✅ NISN + kode_anak required | ✅ | ✅ |

---

## 5. 👮 Role & Permission Audit

### Sistem Role

Sistem role sudah bermigrasi ke many-to-many (`user_roles` pivot) dengan `PermissionMiddleware` sebagai pengganti `RoleMiddleware`. Desain ini bagus. Masalahnya: **migrasi belum selesai** — LMS, keuangan, tata-usaha, perpustakaan, BK masih pakai `role:xxx` tanpa `permission:xxx`.

### Privilege Escalation yang Ditemukan

**1. Operator dapat melakukan tindakan pada user dengan role yang sama atau lebih tinggi**
- `resetPassword`, `toggleActive`, `destroy` hanya dicek bahwa target bukan diri sendiri (`user->id === auth()->id()`).
- Tidak ada guard bahwa operator tidak bisa menon-aktifkan/menghapus kepsek atau operator lain.
- Fix: tambahkan role hierarchy check sebelum operasi.

**2. LMS: Guru bisa manage exam/tugas kelas yang bukan miliknya**
- Route LMS `/lms/tugas/{id}` dan `/lms/ujian/{id}` pakai `role:guru,wali_kelas,operator`.
- Tidak ada validasi bahwa `guru` yang login adalah yang membuat ujian tersebut atau mengajar kelas tersebut.
- Guru sekolah sama bisa edit/hapus ujian guru lain.
- Fix: tambahkan cek `guru_id === auth()->user()->guru->id` atau gunakan Policy.

**3. Keuangan: Tidak ada permission granular**
- Semua route keuangan hanya cek `role:bendahara,operator`. Tidak ada `permission:keuangan.view`, `keuangan.create`, dll.
- Bendahara yang seharusnya hanya view bisa delete tagihan.
- Fix: tambahkan permission middleware per action.

**4. Role hardcoded di PengumumanController**
```php
if (!in_array($request->user()->role_id, [1, 4])) { // role_id sudah dihapus!
```
Ini pattern **role_id hardcoded** yang seharusnya sudah dihapus. Menggunakan ID integer alih-alih slug. Dan kolom tersebut tidak ada di model.

### Hardcoded Role Checks Ditemukan
- `PengumumanController.php:23` — `role_id` hardcoded (kolom tidak ada)
- Pattern `getRoleSlug()` di `KonselingController` sudah benar (pakai slug)

---

## 6. 🎮 Controller Audit

### 🔴 Missing Authorization / Tenant Filter

**`GaleriController::index()`** — Public route, Galeri model tanpa SchoolScope, query tanpa filter.

**`CatatanController::store()`** dan **`KonselingController::store()`** — FormRequest validation `exists:siswas,id` cross-school.

**`GuruDokumenController::downloadFile()`** — Path traversal, baca file apapun di server.

### ⚠️ Missing Policy Enforcement

Semua 3 Policy yang ada (`GuruPolicy`, `SiswaPolicy`, `KelasPolicy`) sudah diimplementasi dengan baik dan memiliki `sameSchool()` check. Tapi **tidak satu pun dipanggil di controller**.

```php
// GuruPolicy ada, tapi GuruProfileController tidak pernah panggil:
$this->authorize('update', $guru); // ← tidak ada
```

SchoolScope sudah menutup sebagian besar risiko, tapi Policy adalah lapisan kedua yang wajib ada saat SchoolScope di-bypass (misal di Artisan command atau admin platform).

**Rekomendasi:** Panggil Policy di semua controller atau register secara global via `AuthServiceProvider`.

### ⚠️ Mass Assignment

Semua model sudah menggunakan `$fillable` (bukan `$guarded = []`). Tidak ada mass assignment risk yang ditemukan.

### ⚠️ Transaction Handling

| Controller | Operasi | Transaction | Status |
|------------|---------|-------------|--------|
| `PembayaranController::store()` | Bayar + update tagihan | `DB::transaction` + `lockForUpdate` | ✅ |
| `OperatorController::createGuru()` | Create user + assign role + update guru | `DB::transaction` | ✅ |
| `NaikKelasController::proses()` | Pindah banyak siswa | `DB::transaction` (perlu verifikasi) | ✅ Perlu Verifikasi |
| `CalonSiswaController::konversi()` | PPDB → Siswa aktif | Perlu Verifikasi | ⚠️ |

---

## 7. 🧠 Model Audit

### `$hidden` — Data Sensitif

| Model | `$hidden` | Masalah |
|-------|-----------|---------|
| `Siswa.php` | `national_ids` (JSON) | ✅ JSON disembunyikan. Tapi `nik`, `nisn`, `no_kk` sebagai kolom terpisah **tidak ada di `$hidden`** → terekspos via `$siswa->toArray()` atau JSON response langsung |
| `Guru.php` | `national_ids` (JSON) | Sama: `nik`, `nip`, `no_kk`, `nuptk` kolom terpisah tidak di `$hidden` |
| `OrangTua.php` | `nik` | ✅ NIK disembunyikan. `no_telepon`, `email` masih expose |
| `User.php` | `password`, `remember_token` | ✅ Standard sudah benar |

**Rekomendasi:** Gunakan `SiswaResource` secara konsisten. Jangan pernah return `$siswa` langsung tanpa resource transformasi.

### Relationships

- `User::roles()` menggunakan `withoutGlobalScope(SchoolScope::class)` — ini benar karena roles dibaca di awal sebelum school_id resolved.
- `GuruDokumenController` menggunakan `$guru->dokumens()->findOrFail($id)` — ini benar (scoped via relationship, bukan direct `GuruDokumen::findOrFail`).
- `OrtuController::getOrtuAnak()` — benar, filter via `OrangTua::where('user_id', $user->id)`.

---

## 8. 🛡️ Policy & Middleware Audit

### Middleware Stack

| Middleware | Status | Catatan |
|------------|--------|---------|
| `TenantMiddleware` | ✅ | X-School-ID header sudah dihapus (anti-injection). Resolve dari subdomain → user fallback. Cek `school->isAccessible()`. |
| `RoleMiddleware` | ✅ | Menggunakan slug, bukan ID. Load roles dengan bypass SchoolScope (benar). |
| `PermissionMiddleware` | ✅ | Desain bagus. Tapi belum semua route memakai ini. |
| `InjectTokenFromCookie` | ⚠️ | Fallback ke raw token jika decrypt gagal. Harus 401, bukan fallback. |
| `auth:sanctum` | ✅ | Standard Sanctum. |

### Policy Enforcement Gap

```
GuruPolicy       → ditulis dengan baik ✅ → tidak dipakai di GuruProfileController ❌
SiswaPolicy      → ditulis dengan baik ✅ → tidak dipakai di MasterDataSiswaController ❌
KelasPolicy      → ditulis dengan baik ✅ → tidak dipakai di MasterDataKelasController ❌
```

---

## 9. 📁 File & Document Security

### 🔴 Path Traversal — `GuruDokumenController::downloadFile()`

```php
// SEKARANG — BERBAHAYA:
$filePath = $request->query('path');
$fullPath = storage_path('app/public/' . $filePath);
// Attacker: ?path=../../../../.env
// Hasil: membaca /var/www/html/... (atau root server) untuk file .env
```

```php
// SEHARUSNYA:
$filePath = $request->query('path');
$base = realpath(storage_path('app/public'));
$fullPath = realpath($base . '/' . $filePath);

if (!$fullPath || !str_starts_with($fullPath, $base)) {
    abort(403, 'Akses ditolak.');
}
```

Atau lebih aman: **hapus method ini sepenuhnya** dan ganti semua referensi ke `downloadDokumen()` yang menggunakan ID dokumen dan sudah aman.

### GuruDokumenController::downloadDokumen() — Aman ✅

Menggunakan `$guru->dokumens()->findOrFail($id)` (scoped ke guru + school) lalu `storage_path('app/public/' . $dokumen->file_path)` (path dari DB, bukan dari request).

### Foto Upload

`OrtuController::updateProfil()` — hapus foto lama sebelum simpan baru ✅. Tapi tidak ada validasi MIME type yang ketat pada semua upload endpoint. Perlu verifikasi per controller.

---

## 10. ⚡ Performance & Scalability

### N+1 Queries

| File | Method | Masalah | Fix |
|------|--------|---------|-----|
| `KepsekController::dashboard()` | `Absensi::whereBetween(...)->get()` + loop | Load semua absensi 7 hari ke memory, filter di PHP. Di 1000 sekolah × 500 siswa = 500K rows in memory per request | Gunakan `groupBy()` + `selectRaw()` di DB, bukan filter PHP |
| `KepsekController::dashboard()` | Multiple count queries (`Siswa::count()`, `Kelas::count()`, dll) | 5+ separate queries untuk dashboard | Gabungkan dengan `select(DB::raw('...'))`  atau cache |
| `AbsensiController::showKelas()` | `RiwayatKelas::with('siswa')` | Seharusnya aman dengan eager load ✅ | - |

### Full Table Scan Potensial

```php
// KepsekController.php — 7 hari absensi semua kelas, ALL records ke memory:
$absensi7Hari = Absensi::whereBetween('tanggal', [...])->get(); // BERBAHAYA di scale
```

Di 1000 sekolah dengan 500 siswa masing-masing: `500 × 7 = 3500 rows per sekolah`, tapi query ini **tidak difilter per sekolah** — SchoolScope menambahkan `WHERE school_id = ?` ✅. Tetap saja, pattern `->get()` lalu filter PHP tidak scalable.

### Missing Pagination

- `OperatorController::pendingOrtu()` — `->get()` tanpa pagination. Jika sekolah besar dengan banyak ortu pending, ini akan OOM.
- `KepsekController::daftarGuru()` / `daftarSiswa()` — perlu verifikasi apakah ada pagination.

### Cache

Tidak ditemukan caching di controller utama. Dashboard kepsek adalah kandidat utama untuk Redis cache dengan TTL 5 menit.

---

## 11. 🔧 Recommended Architecture

### 1. Konsistensi Authorization Layer

Pilih satu dari dua strategi, jangan keduanya:

**Opsi A (Recommended):** Permission-based sepenuhnya
```php
// routes: selalu ada permission middleware
->middleware('permission:lms.exam.create')

// controller: cek ownership resource
$exam = Exam::findOrFail($id);
if ($exam->guru_id !== auth()->user()->guru?->id && !auth()->user()->hasRole('operator')) {
    abort(403);
}
```

**Opsi B:** Policy-based sepenuhnya
```php
// controller: pakai authorize()
$this->authorize('update', $exam);

// ExamPolicy: implement sameSchool() + isOwner()
```

Jangan campur keduanya tanpa konvensi yang jelas.

### 2. Fix FormRequest `exists:` Validation

Buat custom rule atau helper:
```php
// Reusable rule:
Rule::exists('siswas', 'id')->where('school_id', app('current_school_id'))

// Buat macro di AppServiceProvider:
Rule::macro('existsInSchool', fn(string $table) =>
    Rule::exists($table, 'id')->where('school_id', app('current_school_id'))
);

// Pakai di FormRequest:
'siswa_id' => ['required', Rule::existsInSchool('siswas')],
```

### 3. Fix Path Traversal — Hapus `downloadFile()`

Method ini adalah security anti-pattern. Hapus dan buat API yang proper:
```php
// GANTI: GET /guru/{nuptk}/file-download?path=xxx
// DENGAN: GET /guru/{nuptk}/dokumen/{id}/download (sudah ada, sudah aman)
```

### 4. Fix Galeri + Pengumuman Public Routes

```php
// routes/api/public.php — tambahkan TenantMiddleware:
Route::middleware('tenant')->group(function () {
    Route::get('/galeri', [GaleriController::class, 'index']);
    Route::get('/pengumuman', [PengumumanController::class, 'index']);
});

// Galeri model:
class Galeri extends Model {
    use SoftDeletes, HasSchoolScope; // ← tambahkan ini
}
```

### 5. Fix InjectTokenFromCookie

```php
// SEKARANG (berbahaya):
} catch (DecryptException) {
    $token = $raw; // fallback ke raw
}

// SEHARUSNYA:
} catch (DecryptException) {
    return $next($request); // lanjut tanpa token, auth:sanctum akan handle 401
}
```

### 6. Fix PengumumanController::index()

```php
// SEKARANG (broken):
if (!in_array($request->user()->role_id, [1, 4])) {

// SEHARUSNYA:
if (!$request->user()?->hasRole('operator') && !$request->user()?->hasRole('kepsek')) {
```

### 7. Dashboard Performance

```php
// SEKARANG:
$absensi7Hari = Absensi::whereBetween('tanggal', [...])->get();
// lalu filter PHP dalam loop

// SEHARUSNYA:
$absensi7Hari = Absensi::whereBetween('tanggal', [...]
    ->selectRaw('tanggal, status, COUNT(*) as total')
    ->groupBy('tanggal', 'status')
    ->get()
    ->groupBy('tanggal');
```

---

## 12. 🚨 Priority Fix

### P0 — WAJIB DIPERBAIKI SEBELUM PRODUCTION

1. **`GuruDokumenController::downloadFile()` — Path Traversal**
   - Attacker bisa baca `.env`, database credentials, semua file server
   - Fix: hapus method atau validasi `realpath()` + `str_starts_with()`

2. **`GaleriController` — Cross-School Data Leakage**
   - Tambahkan `HasSchoolScope` ke model Galeri
   - Tambahkan TenantMiddleware atau school resolution ke public routes

3. **`PengumumanController::index()` — Broken Authorization (`role_id` tidak ada)**
   - Ganti ke `hasRole('operator')` atau hasRole('kepsek')
   - Ini bug aktif yang menyebabkan semua pengumuman terjadwal bocor

4. **`InjectTokenFromCookie` — Decrypt Fallback**
   - Hapus fallback ke raw token. Return `$next($request)` atau 401 pada DecryptException.

5. **BK `exists:siswas,id` tanpa school constraint**
   - Guru BK bisa attach catatan ke siswa sekolah lain
   - Fix: `Rule::exists('siswas', 'id')->where('school_id', app('current_school_id'))`

### P1 — WAJIB DIPERBAIKI SECEPATNYA

6. **Semua FormRequest `exists:` — tambahkan school_id constraint**
   - StoreTagihanRequest, StoreExamRequest, StoreJadwalRequest, StoreKelasRequest, AddSiswaKelasRequest, dll.

7. **LMS: Guru bisa edit/hapus ujian guru lain**
   - Tambahkan cek `guru_id === auth()->user()->guru->id` di ExamController, AssignmentController, CourseMaterialController

8. **Keuangan: Tambahkan permission middleware per action**
   - `jenis-tagihan`, `tagihan`, `pembayaran` semua butuh granular permission

9. **`OperatorController::resetPassword()` — role hierarchy check**
   - Operator tidak boleh reset password operator/kepsek lain

10. **Policy enforcement di controllers**
    - Panggil `$this->authorize()` di GuruProfileController, MasterDataSiswaController, MasterDataKelasController

### P2 — OPTIMASI

11. **`KepsekController::dashboard()` — query performance**
    - Ganti `->get()` + filter PHP dengan aggregate SQL query
    - Tambahkan cache Redis TTL 5 menit

12. **`OperatorController::pendingOrtu()` — tambahkan pagination**

13. **`Siswa.php` dan `Guru.php` — tambahkan nik, nisn, nip ke `$hidden`**
    - Atau enforce penggunaan SiswaResource/GuruResource di semua endpoint

14. **Konsistensi: migrasi semua route dari `role:xxx` ke `permission:xxx`**

### P3 — NICE TO HAVE

15. Buat `ExistingInSchool` custom validation rule (reusable)
16. Daftarkan Policy di `AuthServiceProvider::policies` array
17. Rate limiting untuk download endpoint (anti-scraping)
18. Audit log untuk setiap file download (dokumen sensitif)
19. Tambahkan `MIME type validation` di semua file upload endpoint

---

## Final Verdict

**Backend `app/` dan `routes/` BELUM cukup aman untuk production SaaS ribuan sekolah.**

**5 masalah paling berbahaya yang harus diperbaiki terlebih dahulu:**

| # | Masalah | Dampak |
|---|---------|--------|
| 1 | `downloadFile()` path traversal | Server takeover — baca `.env`, DB credentials |
| 2 | `Galeri` model tanpa SchoolScope + public route | Cross-school data leakage |
| 3 | `PengumumanController` `role_id` bug | Broken auth, data bocor |
| 4 | `InjectTokenFromCookie` decrypt fallback | Auth bypass via unencrypted cookie |
| 5 | BK `exists:siswas,id` tanpa school constraint | Cross-school data corruption |

**Yang sudah sangat baik:**
- `SchoolScope` + `HasSchoolScope` + `TenantMiddleware` — fondasi tenant isolation sangat solid
- `OrtuController` — isolasi anak ke user yang benar, diimplementasi dengan baik
- `PembayaranController::store()` — `DB::transaction` + `lockForUpdate` untuk race condition
- `OperatorController` — semua `findOrFail` sudah terlindungi SchoolScope
- `AuthController::login()` — cross-tenant login block yang benar
- `GuruDokumenController::downloadDokumen()` — download via DB ID sudah aman
- Semua model core (Guru, Siswa, User, Tagihan, Pembayaran, dll) sudah pakai `HasSchoolScope`

**Dengan menyelesaikan 5 P0 dan 5 P1 di atas, backend ini akan menjadi fondasi SaaS yang solid.**

---

*Audit berdasarkan 230+ PHP files: 50 controllers, 60 form requests, 100+ models, 4 middleware, 3 policies, 14 route files. Tidak mencakup tests, config, frontend React.*
