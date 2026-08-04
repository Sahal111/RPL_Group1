# 13 · Security Standard

---

## 1. Mass Assignment

### Aturan

- **Selalu** definisikan `$fillable` secara eksplisit
- **Jangan pernah** pakai `$guarded = []`
- Field audit (`verified_at`, `verified_by`, `deleted_by`) **tidak boleh** ada di `$fillable` model yang bisa diisi user biasa

```php
// ❌ SALAH — semua field bisa di-fill
protected $guarded = [];

// ❌ SALAH — field audit bisa dimanipulasi user
protected $fillable = [
    'nama', 'nuptk',
    'verified_at', 'verified_by',  // ← bahaya!
    'is_verified',                 // ← bahaya!
    'deleted_by',                  // ← bahaya!
];

// ✅ BENAR — fillable hanya field yang boleh diisi user
protected $fillable = [
    'school_id', 'user_id', 'ulid',
    'nama', 'nuptk', 'nip', 'nik',
    'jenis_kelamin', 'tanggal_lahir',
    // ... field data saja
];

// Field audit diisi di Observer atau boot(), bukan dari request
```

### Di Controller / Service

```php
// ❌ SALAH — langsung pakai $request->all()
Guru::create($request->all());

// ✅ BENAR — pakai validated() dari Form Request
Guru::create($request->validated());

// Atau di Service, terima array dari validated
public function create(array $data): Guru
{
    return Guru::create($data);
}
```

---

## 2. Authorization — Dua Lapis Wajib

Setiap aksi sensitif harus melewati **dua lapis** authorization:

**Lapis 1 — Route Middleware** (cek permission)
```php
Route::delete('/{ulid}', [GuruController::class, 'destroy'])
    ->middleware('permission:master_data.guru.delete');
```

**Lapis 2 — Policy** (cek ownership / tenant)
```php
// GuruPolicy.php
public function delete(User $user, Guru $guru): bool
{
    // Cek school_id cocok (lindungi cross-tenant)
    return $user->school_id === $guru->school_id;
}

// Di Controller
public function destroy(string $ulid): JsonResponse
{
    $guru = Guru::where('ulid', $ulid)->firstOrFail();
    $this->authorize('delete', $guru);  // ← lapis 2

    $this->guruService->delete($ulid);
    return $this->success(message: 'Data guru berhasil dihapus.');
}
```

Middleware saja tidak cukup — user sekolah A yang punya permission
`master_data.guru.delete` tetap tidak boleh bisa hapus guru sekolah B.

---

## 3. File Upload

```php
// ❌ SALAH — hanya cek ekstensi (bisa dimanipulasi)
$request->validate([
    'file' => 'required|mimes:pdf,jpg,png',
]);

// ✅ BENAR — cek MIME type dari isi file
$request->validate([
    'file' => [
        'required',
        'file',
        'max:5120',                      // 5MB
        'mimetypes:application/pdf,image/jpeg,image/png',
    ],
]);

// Storage path — per tenant, tidak pakai nama asli file
$path = $file->store("schools/{$schoolId}/guru/dokumen", 'local');
// Jangan: $file->store('dokumen/' . $file->getClientOriginalName())
```

### Validasi Tambahan File

```php
// Untuk foto profil: cek dimensi
'foto' => ['required', 'image', 'max:2048', 'dimensions:min_width=100,min_height=100'],

// Untuk import Excel: cek ekstensi DAN mime
'file_import' => [
    'required',
    'mimes:xlsx,xls',
    'mimetypes:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
    'max:10240',
],
```

---

## 4. SQL Injection

Selalu pakai Eloquent atau Query Builder dengan binding.

```php
// ❌ SALAH — raw string interpolation
DB::select("SELECT * FROM gurus WHERE nama = '$nama'");

// ✅ BENAR — parameter binding
DB::select("SELECT * FROM gurus WHERE nama = ?", [$nama]);
Guru::where('nama', $nama)->get();  // otomatis aman
```

---

## 5. Rate Limiting

```php
// routes/api/auth.php
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');    // 5 request per 1 menit

Route::post('/register-ortu', [AuthController::class, 'registerOrtu'])
    ->middleware('throttle:10,1');

// Endpoint sensitif lain
Route::post('/guru/{ulid}/import', ...)
    ->middleware('throttle:10,1');   // import tidak boleh di-spam
```

---

## 6. Response — Jangan Expose Data Sensitif

```php
// ❌ SALAH — expose semua field termasuk sensitif
return $this->success($guru->toArray());

// ✅ BENAR — pakai API Resource yang filter field
return $this->success(new GuruResource($guru));

// Di GuruResource — jangan include:
// password, remember_token, deleted_by, last_login_ip
// Jangan expose integer id — pakai ulid
```

---

## 7. Cross-Tenant Data Isolation

Ini adalah security concern terbesar di sistem multi-tenant.

```php
// ❌ SALAH — bisa akses data sekolah lain kalau SchoolScope tidak aktif
$guru = Guru::find($id);

// ✅ BENAR — SchoolScope otomatis filter school_id
$guru = Guru::find($id);  // otomatis: WHERE school_id = {current_school_id} AND id = {id}

// Untuk model yang butuh withoutGlobalScope (misal: Super Admin):
$guru = Guru::withoutGlobalScope(SchoolScope::class)->find($id);
// Tapi ini HANYA boleh di PlatformAdminController, tidak boleh di endpoint biasa
```

---

## 8. Audit Log

Setiap operasi yang mengubah data wajib dicatat di `activity_logs`.

```php
// Melalui Observer — otomatis, tidak perlu kode manual di controller
class GuruObserver
{
    public function created(Guru $guru): void
    {
        ActivityLog::create([
            'school_id'    => $guru->school_id,
            'user_id'      => auth()->id(),
            'action'       => 'guru.created',
            'model_type'   => 'Guru',
            'model_id'     => $guru->id,
            'new_values'   => $guru->toArray(),
            'ip_address'   => request()->ip(),
            'user_agent'   => request()->userAgent(),
        ]);
    }

    public function updated(Guru $guru): void
    {
        ActivityLog::create([
            'school_id'  => $guru->school_id,
            'user_id'    => auth()->id(),
            'action'     => 'guru.updated',
            'model_type' => 'Guru',
            'model_id'   => $guru->id,
            'old_values' => $guru->getOriginal(),
            'new_values' => $guru->getChanges(),
            'ip_address' => request()->ip(),
        ]);
    }
}
```

---

## 9. CSRF

Sanctum token sudah handle CSRF untuk SPA dengan `withCredentials: true`
di axios dan konfigurasi `SANCTUM_STATEFUL_DOMAINS` di `.env`.

Untuk API token (mobile/third-party), CSRF tidak relevan — token di header sudah cukup.

---

## 10. Environment

```bash
# .env — jangan pernah commit ke git
APP_DEBUG=false         # production wajib false
APP_KEY=                # wajib di-set, jangan pakai default

# .env.example — yang di-commit, tanpa nilai sensitif
APP_DEBUG=false
APP_KEY=

DB_PASSWORD=            # kosong di example
```

Tambahkan `.env` ke `.gitignore`. Jangan pernah commit `.env` asli.
