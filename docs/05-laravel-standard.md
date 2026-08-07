# 05 · Laravel Standard

---

## Controller

### Aturan Wajib

1. Setiap controller **extends** `App\Http\Controllers\Controller`
2. Setiap public method **wajib** type hint `JsonResponse`
3. **Tidak boleh** ada `$request->validate()` di controller — semua validasi di Form Request
4. **Tidak boleh** ada query DB langsung — semua lewat Service atau Model
5. Satu method tidak boleh lebih dari **30-40 baris**
6. Satu controller tidak boleh lebih dari **8-10 method**

### Template Controller

```php
<?php

namespace App\Http\Controllers\MasterData\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StoreGuruRequest;
use App\Http\Requests\Guru\UpdateGuruRequest;
use App\Http\Resources\GuruResource;
use App\Http\Resources\GuruDetailResource;
use App\Services\Guru\GuruService;
use Illuminate\Http\JsonResponse;

class GuruController extends Controller
{
    public function __construct(
        private readonly GuruService $guruService
    ) {}

    public function index(): JsonResponse
    {
        $gurus = $this->guruService->paginate(request()->all());
        return $this->success(GuruResource::collection($gurus));
    }

    public function store(StoreGuruRequest $request): JsonResponse
    {
        $guru = $this->guruService->create($request->validated());
        return $this->created(new GuruResource($guru), 'Data guru berhasil ditambahkan.');
    }

    public function show(string $ulid): JsonResponse
    {
        $guru = $this->guruService->findByUlid($ulid);
        return $this->success(new GuruDetailResource($guru));
    }

    public function update(UpdateGuruRequest $request, string $ulid): JsonResponse
    {
        $guru = $this->guruService->update($ulid, $request->validated());
        return $this->success(new GuruResource($guru), 'Data guru berhasil diperbarui.');
    }

    public function destroy(string $ulid): JsonResponse
    {
        $this->guruService->delete($ulid);
        return $this->success(message: 'Data guru berhasil dihapus.');
    }
}
```

### Pemecahan Controller Besar

Kalau domain punya banyak operasi, pecah per subdomain:

```
// ❌ SALAH — satu controller raksasa
MasterDataGuruController  (5000+ baris, 70+ method)

// ✅ BENAR — split per subdomain
app/Http/Controllers/MasterData/Guru/
  GuruController.php           CRUD utama + stats + foto profil
  GuruKeluargaController.php   keluarga, anak, kontak darurat
  GuruKepegawaianController.php pendidikan, sertifikasi, inpassing, jabatan
  GuruDokumenController.php    DMS — upload, approve, reject, versi
  GuruKompetensiController.php kompetensi, diklat, PKG
  GuruMutasiController.php     mutasi dan cuti
  GuruAdministrasiController.php rekening, BPJS, NPWP, penugasan
  GuruImportController.php     import Excel, zip foto
  GuruExportController.php     export Excel, PDF
```

---

## Form Request

Semua validasi **wajib** di Form Request. Tidak ada pengecualian.

```php
<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuruRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Cek permission di sini, atau biarkan true dan cek di middleware
        return $this->user()->can('master_data.guru.create');
    }

    public function rules(): array
    {
        return [
            'nama'          => ['required', 'string', 'max:150'],
            'nuptk'         => ['nullable', 'digits:16', 'unique:gurus,nuptk'],
            'nip'           => ['nullable', 'digits:18', 'unique:gurus,nip'],
            'jenis_kelamin' => ['required', 'in:Laki-laki,Perempuan'],
            'jenis_ptk'     => ['required', 'string', 'max:50'],
            'tanggal_lahir' => ['required', 'date', 'before:today'],
            'no_hp'         => ['nullable', 'string', 'max:15'],
        ];
    }

    public function messages(): array
    {
        return [
            'nuptk.digits'  => 'NUPTK harus terdiri dari 16 digit angka.',
            'nuptk.unique'  => 'NUPTK ini sudah terdaftar di sistem.',
            'tanggal_lahir.before' => 'Tanggal lahir tidak valid.',
        ];
    }
}
```

---

## Service Layer

Service menampung semua business logic.
Service **tidak boleh** tahu tentang HTTP (Request, Response).
Service **boleh** dipanggil dari controller, job, command, atau seeder.

```php
<?php

namespace App\Services\Guru;

use App\Models\Guru;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class GuruService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return Guru::query()
            ->with(['jabatanAktif', 'pendidikanTerakhir'])
            ->when($filters['search'] ?? null, fn($q, $s) =>
                $q->where('nama', 'like', "%{$s}%")
                  ->orWhere('nuptk', 'like', "%{$s}%")
            )
            ->when($filters['status'] ?? null, fn($q, $s) =>
                $q->where('status_keaktifan', $s)
            )
            ->orderBy($filters['sort'] ?? 'nama', $filters['order'] ?? 'asc')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function findByUlid(string $ulid): Guru
    {
        return Guru::where('ulid', $ulid)
            ->with([
                'user', 'jabatanAktif', 'pendidikanTerakhir',
                'sertifikasi', 'inpassing',
            ])
            ->firstOrFail();
    }

    public function create(array $data): Guru
    {
        return DB::transaction(function () use ($data) {
            return Guru::create($data);
            // Observer akan handle audit log, event, dll
        });
    }

    public function update(string $ulid, array $data): Guru
    {
        $guru = $this->findByUlid($ulid);

        DB::transaction(function () use ($guru, $data) {
            $guru->update($data);
        });

        return $guru->fresh();
    }

    public function delete(string $ulid): void
    {
        $guru = $this->findByUlid($ulid);
        $guru->delete();  // SoftDelete, trigger Observer
    }
}
```

---

## Model

### Aturan Wajib

```php
<?php

namespace App\Models;

use App\Models\Scopes\SchoolScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Guru extends Model
{
    use SoftDeletes;

    protected $table = 'gurus';

    // 1. Fillable HARUS eksplisit
    //    Jangan pakai $guarded = []
    protected $fillable = [
        'school_id',   // ← wajib ada
        'user_id',
        'ulid',
        'nama',
        // ... field lain
    ];

    // 2. Hidden — sembunyikan field sensitif dari serialisasi
    protected $hidden = [
        'deleted_at',
        'deleted_by',
    ];

    // 3. Cast untuk tipe data yang tepat
    protected $casts = [
        'tanggal_lahir'     => 'date',
        'tanggal_bergabung' => 'date',
        'is_verified'       => 'boolean',
        'status_aktif'      => 'boolean',
        'national_ids'      => 'array',  // JSON fleksibel NIK/NUPTK/SSN
        'address_details'   => 'array',  // JSON fleksibel detail alamat
    ];

    // 4. Append accessor yang sering dipakai
    protected $appends = ['nama_lengkap'];

    // 5. Boot — otomatis set audit field + ulid + SchoolScope
    protected static function booted(): void
    {
        // Multi-tenant scope
        static::addGlobalScope(new SchoolScope);

        // Auto-fill ulid
        static::creating(function ($model) {
            $model->ulid ??= (string) \Illuminate\Support\Str::ulid();
        });

        // Auto-fill audit fields
        static::creating(function ($model) {
            $model->created_by ??= auth()->id();
            $model->updated_by ??= auth()->id();
        });

        static::updating(function ($model) {
            $model->updated_by = auth()->id();
        });

        static::deleting(function ($model) {
            $model->deleted_by = auth()->id();
            $model->save();
        });
    }

    // 6. Scope — filter yang sering dipakai
    public function scopeAktif($query)
    {
        return $query->where('status_keaktifan', 'Aktif');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    // 7. Accessor
    public function getNamaLengkapAttribute(): string
    {
        return trim(
            ($this->gelar_depan ? $this->gelar_depan . ' ' : '') .
            $this->nama .
            ($this->gelar_belakang ? ', ' . $this->gelar_belakang : '')
        );
    }

    // 8. Relasi — selalu pakai nama yang deskriptif
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jabatanAktif()
    {
        return $this->hasOne(GuruJabatan::class)
            ->where('is_jabatan_aktif', true)
            ->latest();
    }

    public function pendidikanTerakhir()
    {
        return $this->hasOne(GuruPendidikan::class)
            ->orderByDesc('tahun_lulus');
    }

    public function dokumens()
    {
        return $this->hasMany(GuruDokumen::class);
    }
}
```

### Yang Tidak Boleh Ada di Model

```php
// ❌ JANGAN ada HTTP logic di model
public function uploadFoto(Request $request) { ... }

// ❌ JANGAN ada business logic kompleks di model
public function hitungMasaKerja() {
    // 50 baris logic — ini harusnya di Service
}

// ❌ JANGAN pakai $guarded = []
protected $guarded = [];

// ❌ JANGAN hapus field dari $hidden tanpa alasan keamanan
protected $hidden = [];  // sembunyikan minimal: password, token, audit fields
```

---

## Observer

Observer untuk side-effect yang terjadi setelah operasi DB.
Daftarkan di `AppServiceProvider`.

```php
<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Guru;

class GuruObserver
{
    public function created(Guru $guru): void
    {
        ActivityLog::record('guru.created', $guru);
        // event(new GuruCreated($guru));  // untuk notifikasi dll
    }

    public function updated(Guru $guru): void
    {
        ActivityLog::record('guru.updated', $guru, $guru->getChanges());
    }

    public function deleted(Guru $guru): void
    {
        ActivityLog::record('guru.deleted', $guru);
    }
}
```

---

## Route

### Struktur File Route

```
routes/
  api.php              ← entry point, include sub-file
  api/
    auth.php
    operator.php
    guru.php
    kepsek.php
    ortu.php
    absensi.php
    public.php
```

### Aturan Route

```php
// ✅ BENAR — named route, pakai resource helper
Route::apiResource('guru', GuruController::class)->names('guru');

// ✅ BENAR — action tambahan dengan nama
Route::post('guru/{ulid}/verify', [GuruController::class, 'verify'])
    ->name('guru.verify');

// ❌ SALAH — inline closure di route
Route::get('/guru/{nuptk}/akun', function (Request $request, $nuptk) {
    $guru = Guru::where('nuptk', $nuptk)->first();
    return response()->json($guru->user);
});

// ❌ SALAH — tidak ada middleware permission
Route::get('/guru', [GuruController::class, 'index']);
```

### Contoh Route yang Benar

```php
// routes/api/guru.php
Route::middleware(['auth:sanctum', 'permission:master_data.guru.view'])
    ->prefix('v1/guru')
    ->group(function () {

        Route::get('/', [GuruController::class, 'index'])->name('guru.index');
        Route::get('/{ulid}', [GuruController::class, 'show'])->name('guru.show');

        Route::middleware('permission:master_data.guru.create')
            ->post('/', [GuruController::class, 'store'])->name('guru.store');

        Route::middleware('permission:master_data.guru.update')
            ->put('/{ulid}', [GuruController::class, 'update'])->name('guru.update');

        Route::middleware('permission:master_data.guru.delete')
            ->delete('/{ulid}', [GuruController::class, 'destroy'])->name('guru.destroy');

        // Subdomain
        Route::prefix('/{ulid}/dokumen')
            ->middleware('permission:dms.view_all')
            ->group(function () {
                Route::get('/', [GuruDokumenController::class, 'index']);
                Route::middleware('permission:dms.upload')
                    ->post('/', [GuruDokumenController::class, 'store']);
                Route::middleware('permission:dms.approve')
                    ->patch('/{dokumenId}/approve', [GuruDokumenController::class, 'approve']);
            });
    });
```
