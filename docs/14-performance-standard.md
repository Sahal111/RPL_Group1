# 14 · Performance Standard

---

## 1. N+1 Query — Wajib Dihindari

N+1 adalah masalah performance paling umum di project ini.

```php
// ❌ SALAH — N+1
$gurus = Guru::all();
foreach ($gurus as $guru) {
    echo $guru->jabatanAktif->nama_jabatan;  // query baru tiap guru!
}
// Kalau ada 100 guru = 101 query ke DB

// ✅ BENAR — eager loading
$gurus = Guru::with(['jabatanAktif', 'pendidikanTerakhir'])->get();
foreach ($gurus as $guru) {
    echo $guru->jabatanAktif?->nama_jabatan;  // sudah di-load, 0 query tambahan
}
// Total selalu 2 query (guru + jabatan), berapapun jumlah guru
```

### Cara Deteksi N+1

Install `barryvdh/laravel-debugbar` di development:

```bash
composer require barryvdh/laravel-debugbar --dev
```

Query count akan muncul. Kalau query > 10 untuk satu endpoint, ada N+1.

### Aturan Eager Loading

```php
// Di Service, selalu definisikan relasi yang akan di-load
public function paginate(array $filters): LengthAwarePaginator
{
    return Guru::query()
        ->with([
            'jabatanAktif',          // untuk kolom jabatan di tabel list
            'pendidikanTerakhir',    // untuk kolom pendidikan di tabel list
        ])
        ->paginate(15);
}

public function findByUlid(string $ulid): Guru
{
    return Guru::where('ulid', $ulid)
        ->with([
            'user',
            'jabatanAktif', 'jabatans',
            'pendidikanTerakhir', 'pendidikans',
            'sertifikasis', 'inpassing',
            'keluargas', 'anaks', 'kontakDarurat',
            'rekenings',
        ])
        ->firstOrFail();
}
```

---

## 2. Pagination — Wajib untuk Semua List

Tidak boleh ada endpoint yang return semua data tanpa paginasi.

```php
// ❌ SALAH — bisa return ribuan baris
return Guru::all();

// ✅ BENAR
return Guru::paginate(15);         // default 15 per page
return Guru::paginate($perPage);   // dari query param, max 100
```

```php
// Validasi per_page dari request
$perPage = min((int) $request->input('per_page', 15), 100);
```

---

## 3. Select Kolom — Hanya yang Dibutuhkan

```php
// ❌ SALAH — load semua kolom termasuk yang tidak dipakai
$gurus = Guru::with('jabatanAktif')->paginate(15);

// ✅ BENAR — kalau untuk list, select kolom yang dipakai saja
$gurus = Guru::select([
    'id', 'ulid', 'school_id', 'nama', 'nuptk',
    'jenis_kelamin', 'status_keaktifan', 'is_verified', 'foto',
])->with([
    'jabatanAktif:id,guru_id,nama_jabatan',  // select di relasi juga
])->paginate(15);
```

Untuk endpoint detail (show), boleh select semua karena hanya satu row.

---

## 4. Database Index

Kolom yang wajib ada indexnya:

```sql
-- school_id di semua tabel operasional
KEY idx_gurus_school (school_id)

-- Kolom yang sering jadi WHERE filter
KEY idx_gurus_status (school_id, status_keaktifan)
KEY idx_absensis_tanggal (school_id, tanggal)
KEY idx_guru_dokumens_status (school_id, status)

-- Kolom yang sering jadi ORDER BY
KEY idx_gurus_nama (school_id, nama)

-- FK columns (otomatis dapat index di MySQL)
KEY idx_guru_jabatans_guru (guru_id)
```

Cek query yang lambat:
```sql
-- Enable slow query log di MySQL
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- log query > 1 detik
```

---

## 5. Import / Export — Pakai Job (Queue)

Import dan export file besar **wajib** dijalankan via Job, bukan synchronous.

```php
// ❌ SALAH — import langsung di controller, request timeout
public function import(Request $request)
{
    $data = Excel::import(...);  // bisa jalan 60 detik!
    return $this->success('Import selesai');
}

// ✅ BENAR — dispatch job, return langsung
public function import(StoreImportRequest $request)
{
    $path = $request->file('file')->store('temp');

    $importLog = GuruImportLog::create([
        'school_id' => auth()->user()->school_id,
        'status'    => 'pending',
        'file_path' => $path,
    ]);

    ProcessGuruImport::dispatch($importLog)->onQueue('imports');

    return $this->success(['import_log_id' => $importLog->id],
        'File sedang diproses. Kamu akan dapat notifikasi saat selesai.');
}

// Frontend polling status
GET /v1/guru/import/{importLogId}/status
```

---

## 6. Cache

```php
// Untuk data yang jarang berubah tapi sering diakses:

// School settings — di-cache per sekolah
$settings = Cache::remember("school_settings_{$schoolId}", 3600, function () use ($schoolId) {
    return SchoolSetting::where('school_id', $schoolId)->pluck('value', 'key')->toArray();
});

// Dropdown data (tahun ajaran aktif, daftar kelas, dll)
$tahunAjaran = Cache::remember("tahun_ajaran_aktif_{$schoolId}", 300, function () {
    return TahunAjaran::where('is_active', true)->first();
});

// Invalidate cache saat data berubah (di Observer)
class TahunAjaranObserver
{
    public function saved(TahunAjaran $ta): void
    {
        Cache::forget("tahun_ajaran_aktif_{$ta->school_id}");
    }
}
```

**Jangan cache** data yang sering berubah (absensi, nilai harian, status dokumen).

---

## 7. Frontend — React Query Cache

React Query sudah otomatis cache response. Atur `staleTime` dengan bijak:

```js
// Data yang jarang berubah — cache 5 menit
useQuery({
  queryKey: ['kelas'],
  queryFn:  () => api.get('/v1/kelas').then(r => r.data),
  staleTime: 1000 * 60 * 5,
});

// Data yang sering berubah (absensi hari ini) — cache 30 detik
useQuery({
  queryKey: ['absensi', kelasId, tanggal],
  queryFn:  () => api.get(`/v1/absensi/kelas/${kelasId}`).then(r => r.data),
  staleTime: 1000 * 30,
});

// Data realtime (status import) — no cache, refetch setiap 3 detik
useQuery({
  queryKey: ['import-status', importLogId],
  queryFn:  () => api.get(`/v1/guru/import/${importLogId}/status`).then(r => r.data),
  refetchInterval: 3000,
  enabled: !!importLogId,
});
```

---

## 8. File / Gambar

```php
// Simpan foto dengan nama yang unik (hindari collision)
$filename = $guru->ulid . '_' . time() . '.' . $file->extension();
$path = $file->storeAs("schools/{$schoolId}/guru/foto", $filename, 'local');

// Di API Resource — return URL, bukan path
'foto_url' => $this->foto ? asset('storage/' . $this->foto) : null,
```

Untuk produksi dengan banyak user: pertimbangkan resize foto sebelum simpan,
dan gunakan CDN / S3 agar tidak membebani server.
