# Dokumen Arsitektur 3 — API Contract Standard
# SIAKAD Enterprise Platform
# Status: FINAL — Acuan untuk semua controller dan frontend

---

## Prinsip Dasar

1. Semua response JSON, selalu ada field `success` (boolean)
2. HTTP status code HARUS sesuai dengan kondisi — jangan selalu 200
3. Error selalu punya `code` yang bisa diidentifikasi frontend tanpa parse pesan
4. Pagination selalu konsisten (ada `meta` dan `links`)
5. Response tidak pernah expose ID integer mentah ke public — gunakan ULID atau slug

---

## Base URL & Versioning

```
https://{subdomain}.siakad.id/api/v1/...
```

Versi ada di URL (`/v1/`), bukan di header. Lebih mudah di-debug dan di-test.

---

## Format Response

### Success — Single Resource
```json
{
  "success": true,
  "data": {
    "id": "01J4...",
    "nama": "Ahmad Fauzi",
    "nuptk": "1234567890123456"
  }
}
```

### Success — Collection dengan Pagination
```json
{
  "success": true,
  "data": [
    { "id": "01J4...", "nama": "Ahmad Fauzi" },
    { "id": "01J5...", "nama": "Siti Aminah" }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 74,
    "from": 1,
    "to": 15
  },
  "links": {
    "first": "https://sdn1.siakad.id/api/v1/guru?page=1",
    "last":  "https://sdn1.siakad.id/api/v1/guru?page=5",
    "prev":  null,
    "next":  "https://sdn1.siakad.id/api/v1/guru?page=2"
  }
}
```

### Success — Action (create, update, delete, toggle)
```json
{
  "success": true,
  "message": "Data guru berhasil disimpan.",
  "data": {
    "id": "01J4...",
    "nama": "Ahmad Fauzi"
  }
}
```

Untuk delete:
```json
{
  "success": true,
  "message": "Data guru berhasil dihapus."
}
```

### Success — No Content (204)
Untuk operasi yang tidak perlu return data (misal: logout).
HTTP 204, body kosong.

---

## Format Error

### Validation Error (422)
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Data yang dikirim tidak valid.",
  "errors": {
    "nama": ["Nama wajib diisi."],
    "nuptk": [
      "NUPTK harus terdiri dari 16 digit.",
      "NUPTK sudah terdaftar."
    ],
    "tanggal_lahir": ["Format tanggal tidak valid."]
  }
}
```

### Unauthorized — Belum Login (401)
```json
{
  "success": false,
  "code": "UNAUTHENTICATED",
  "message": "Sesi kamu sudah berakhir. Silakan login kembali."
}
```

### Forbidden — Tidak Punya Akses (403)
```json
{
  "success": false,
  "code": "FORBIDDEN",
  "message": "Kamu tidak memiliki izin untuk melakukan tindakan ini."
}
```

### Not Found (404)
```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "Data yang kamu cari tidak ditemukan."
}
```

### Account Inactive (403)
```json
{
  "success": false,
  "code": "ACCOUNT_INACTIVE",
  "message": "Akun kamu belum aktif. Hubungi operator sekolah."
}
```

### Too Many Requests (429)
```json
{
  "success": false,
  "code": "TOO_MANY_REQUESTS",
  "message": "Terlalu banyak percobaan. Coba lagi dalam 60 detik.",
  "retry_after": 60
}
```

### Server Error (500)
```json
{
  "success": false,
  "code": "SERVER_ERROR",
  "message": "Terjadi kesalahan di server. Tim kami sudah diberi tahu."
}
```

### Tenant Suspended (403)
```json
{
  "success": false,
  "code": "SCHOOL_SUSPENDED",
  "message": "Akses sekolah kamu sedang ditangguhkan. Hubungi tim SIAKAD."
}
```

---

## Error Codes (Lengkap)

```
UNAUTHENTICATED         -- belum login / token expired
ACCOUNT_INACTIVE        -- akun nonaktif
ACCOUNT_PENDING         -- akun menunggu approval (ortu baru daftar)
FORBIDDEN               -- tidak punya permission
NOT_FOUND               -- resource tidak ada
VALIDATION_ERROR        -- input tidak valid
CONFLICT                -- duplicate data (misal: NUPTK sudah ada)
SCHOOL_SUSPENDED        -- tenant ditangguhkan
SCHOOL_TRIAL_EXPIRED    -- masa trial habis
PLAN_LIMIT_REACHED      -- sudah capai limit paket (max user, max storage)
TOO_MANY_REQUESTS       -- rate limit
SERVER_ERROR            -- unhandled exception
IMPORT_FAILED           -- batch import gagal
IMPORT_PARTIAL          -- import selesai tapi ada baris yang gagal
```

---

## ApiResponse Trait

```php
// app/Traits/ApiResponse.php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponse
{
    protected function success(
        mixed $data = null,
        string $message = '',
        int $status = 200
    ): JsonResponse {
        $response = ['success' => true];

        if ($message) {
            $response['message'] = $message;
        }

        if ($data instanceof LengthAwarePaginator) {
            $response['data']  = $data->items();
            $response['meta']  = [
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
                'per_page'     => $data->perPage(),
                'total'        => $data->total(),
                'from'         => $data->firstItem(),
                'to'           => $data->lastItem(),
            ];
            $response['links'] = [
                'first' => $data->url(1),
                'last'  => $data->url($data->lastPage()),
                'prev'  => $data->previousPageUrl(),
                'next'  => $data->nextPageUrl(),
            ];
        } elseif ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    protected function created(mixed $data, string $message = 'Data berhasil ditambahkan.'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    protected function error(
        string $message,
        string $code = 'SERVER_ERROR',
        int $status = 500,
        mixed $errors = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'code'    => $code,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }

    protected function validationError(array $errors, string $message = 'Data yang dikirim tidak valid.'): JsonResponse
    {
        return $this->error($message, 'VALIDATION_ERROR', 422, $errors);
    }

    protected function notFound(string $message = 'Data tidak ditemukan.'): JsonResponse
    {
        return $this->error($message, 'NOT_FOUND', 404);
    }

    protected function forbidden(string $message = 'Kamu tidak memiliki izin.'): JsonResponse
    {
        return $this->error($message, 'FORBIDDEN', 403);
    }
}
```

---

## Controller Base

```php
// app/Http/Controllers/Controller.php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;

abstract class Controller
{
    use ApiResponse;
}
```

---

## Contoh Controller yang Benar

```php
// BEFORE (yang ada sekarang)
public function store(Request $request)
{
    $validated = $request->validate([
        'nama' => 'required|string|max:150',
        'nuptk' => 'required|digits:16|unique:gurus',
    ]);

    $guru = Guru::create($validated);
    return response()->json(['success' => true, 'data' => $guru], 201);
}

// AFTER (target)
public function store(StoreGuruRequest $request): JsonResponse
{
    $guru = $this->guruService->create($request->validated());
    return $this->created(new GuruResource($guru), 'Data guru berhasil ditambahkan.');
}
```

---

## API Resource Standard

```php
// app/Http/Resources/GuruResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GuruResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->ulid,     // jangan expose integer ID
            'nuptk'            => $this->nuptk,
            'nip'              => $this->nip,
            'nama'             => $this->nama,
            'nama_lengkap'     => $this->nama_lengkap,
            'jenis_kelamin'    => $this->jenis_kelamin,
            'jenis_ptk'        => $this->jenis_ptk,
            'status_keaktifan' => $this->status_keaktifan,
            'foto_url'         => $this->foto ? asset('storage/' . $this->foto) : null,
            'is_verified'      => $this->is_verified,

            // Relasi — hanya disertakan kalau di-load (cegah N+1)
            'jabatan_aktif' => $this->whenLoaded('jabatanAktif', fn() =>
                new GuruJabatanResource($this->jabatanAktif)
            ),
            'pendidikan_terakhir' => $this->whenLoaded('pendidikanTerakhir', fn() =>
                new GuruPendidikanResource($this->pendidikanTerakhir)
            ),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
```

---

## Route Naming Convention

```
GET    /api/v1/guru                → guru.index
POST   /api/v1/guru                → guru.store
GET    /api/v1/guru/{nuptk}        → guru.show
PUT    /api/v1/guru/{nuptk}        → guru.update
DELETE /api/v1/guru/{nuptk}        → guru.destroy

GET    /api/v1/guru/{nuptk}/dokumen          → guru.dokumen.index
POST   /api/v1/guru/{nuptk}/dokumen          → guru.dokumen.store
PATCH  /api/v1/guru/{nuptk}/dokumen/{id}/approve  → guru.dokumen.approve
```

---

## Query Parameter Standard

```
?page=1               -- pagination (default 1)
?per_page=15          -- items per page (default 15, max 100)
?search=ahmad         -- full-text search
?sort=nama            -- field untuk sort
?order=asc            -- asc atau desc (default asc)
?filter[status]=aktif -- filter per field
?include=jabatan,dokumen  -- eager load relasi (whitelist di controller)
```

---

## Header Wajib dari Frontend

```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json   (untuk POST/PUT)
X-Requested-With: XMLHttpRequest
```

---

## Global Exception Handler

```php
// app/Exceptions/Handler.php
// Tangkap semua exception dan format ke response standar

use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

// AuthenticationException      → 401 UNAUTHENTICATED
// AuthorizationException       → 403 FORBIDDEN
// ModelNotFoundException        → 404 NOT_FOUND
// ValidationException          → 422 VALIDATION_ERROR
// NotFoundHttpException        → 404 NOT_FOUND (route tidak ada)
// Throwable (semua lainnya)    → 500 SERVER_ERROR (log ke storage/logs)
```
