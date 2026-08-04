# 12 · Import Export Standard

---

## Prinsip

1. **Import selalu async** — jangan pernah proses file besar synchronous
2. **Export kecil boleh sync** — kalau data < 500 baris, boleh langsung return file
3. **Export besar async** — kalau data > 500 baris, generate di background, kirim link download
4. **Selalu ada template** — setiap import harus punya file template yang bisa didownload
5. **Preview sebelum eksekusi** — import tampilkan preview data dulu, baru user konfirmasi

---

## Flow Import

```
User upload file Excel
        ↓
Validasi file (mime, size, format)
        ↓
Simpan file ke temp storage
        ↓
Buat GuruImportLog (status: pending)
        ↓
Dispatch ProcessGuruImport job
        ↓
Return response: { import_log_id, status: "pending" }
        ↓
Frontend polling GET /v1/guru/import/{id}/status setiap 3 detik
        ↓
Job selesai → update GuruImportLog (status: done / partial / failed)
        ↓
Frontend tampilkan hasil: berhasil X baris, gagal Y baris + detail error
```

---

## GuruImportLog — Tabel Tracking

```sql
CREATE TABLE guru_import_logs (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id     BIGINT UNSIGNED NOT NULL,
  ulid          CHAR(26) NOT NULL UNIQUE,
  uploaded_by   BIGINT UNSIGNED NOT NULL,
  file_path     VARCHAR(255) NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  status        ENUM('pending','processing','done','partial','failed') DEFAULT 'pending',
  total_rows    INT UNSIGNED NULL,
  success_rows  INT UNSIGNED NULL DEFAULT 0,
  failed_rows   INT UNSIGNED NULL DEFAULT 0,
  error_details JSON NULL,          -- array of { row, field, message }
  started_at    TIMESTAMP NULL,
  finished_at   TIMESTAMP NULL,
  created_at    TIMESTAMP NULL,
  updated_at    TIMESTAMP NULL,

  KEY idx_import_logs_school (school_id),
  KEY idx_import_logs_status (school_id, status),
  CONSTRAINT fk_import_logs_school FOREIGN KEY (school_id) REFERENCES schools(id)
);
```

---

## Job — ProcessGuruImport

```php
<?php

namespace App\Jobs;

use App\Models\GuruImportLog;
use App\Services\Guru\GuruImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessGuruImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;   // 5 menit max
    public int $tries   = 1;     // jangan retry import — bisa duplikat data

    public function __construct(
        private readonly GuruImportLog $importLog
    ) {}

    public function handle(GuruImportService $service): void
    {
        $this->importLog->update([
            'status'     => 'processing',
            'started_at' => now(),
        ]);

        try {
            $result = $service->process($this->importLog);

            $this->importLog->update([
                'status'       => $result['failed'] > 0 ? 'partial' : 'done',
                'total_rows'   => $result['total'],
                'success_rows' => $result['success'],
                'failed_rows'  => $result['failed'],
                'error_details'=> $result['errors'],
                'finished_at'  => now(),
            ]);
        } catch (\Throwable $e) {
            $this->importLog->update([
                'status'      => 'failed',
                'finished_at' => now(),
                'error_details' => [['message' => $e->getMessage()]],
            ]);
        }
    }
}
```

---

## GuruImportService

```php
<?php

namespace App\Services\Guru;

use App\Models\Guru;
use App\Models\GuruImportLog;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;

class GuruImportService
{
    public function process(GuruImportLog $log): array
    {
        $spreadsheet = IOFactory::load(Storage::path($log->file_path));
        $sheet       = $spreadsheet->getActiveSheet();
        $rows        = $sheet->toArray();

        // Baris pertama adalah header — skip
        $headers = array_shift($rows);

        $success = 0;
        $failed  = 0;
        $errors  = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2;  // +2 karena baris 1 header, index mulai 0

            try {
                $data = $this->mapRow($headers, $row);
                $this->validateRow($data, $rowNum);

                Guru::create(array_merge($data, [
                    'school_id' => $log->school_id,
                ]));

                $success++;
            } catch (\Throwable $e) {
                $failed++;
                $errors[] = [
                    'row'     => $rowNum,
                    'message' => $e->getMessage(),
                    'data'    => $row,
                ];
            }
        }

        return [
            'total'   => count($rows),
            'success' => $success,
            'failed'  => $failed,
            'errors'  => $errors,
        ];
    }

    private function mapRow(array $headers, array $row): array
    {
        $data = array_combine($headers, $row);

        return [
            'nama'          => $data['Nama'] ?? null,
            'nuptk'         => $data['NUPTK'] ?? null,
            'nip'           => $data['NIP'] ?? null,
            'jenis_kelamin' => $data['Jenis Kelamin'] ?? null,
            'jenis_ptk'     => $data['Jenis PTK'] ?? null,
            'tanggal_lahir' => $data['Tanggal Lahir'] ?? null,
            // ... mapping kolom lain
        ];
    }

    private function validateRow(array $data, int $rowNum): void
    {
        if (empty($data['nama'])) {
            throw new \InvalidArgumentException("Baris {$rowNum}: Nama wajib diisi.");
        }

        if (!empty($data['nuptk']) && strlen($data['nuptk']) !== 16) {
            throw new \InvalidArgumentException("Baris {$rowNum}: NUPTK harus 16 digit.");
        }
    }
}
```

---

## Controller Import

```php
// GuruImportController.php

public function store(StoreImportRequest $request): JsonResponse
{
    $file = $request->file('file');
    $path = $file->store("schools/{$request->user()->school_id}/imports/temp", 'local');

    $importLog = GuruImportLog::create([
        'school_id'   => $request->user()->school_id,
        'uploaded_by' => $request->user()->id,
        'file_path'   => $path,
        'file_name'   => $file->getClientOriginalName(),
        'status'      => 'pending',
    ]);

    ProcessGuruImport::dispatch($importLog)->onQueue('imports');

    return $this->success(
        ['import_log_id' => $importLog->ulid],
        'File sedang diproses. Pantau status di halaman import.'
    );
}

public function status(string $ulid): JsonResponse
{
    $log = GuruImportLog::where('ulid', $ulid)->firstOrFail();
    $this->authorize('view', $log);

    return $this->success(new ImportLogResource($log));
}

public function template(): \Symfony\Component\HttpFoundation\BinaryFileResponse
{
    // Return file template Excel yang bisa didownload
    return response()->download(
        storage_path('app/templates/template-import-guru.xlsx'),
        'template-import-guru.xlsx'
    );
}
```

---

## Frontend — Import Flow

```jsx
// hooks/api/useGuruImport.js
export const useImportGuru = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (formData) =>
      api.post('/v1/guru/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data),
    onSuccess: (res) => {
      // Simpan importLogId untuk polling
    },
  });
};

export const useImportStatus = (importLogId) => useQuery({
  queryKey: ['import-status', importLogId],
  queryFn:  () => api.get(`/v1/guru/import/${importLogId}/status`).then(r => r.data),
  refetchInterval: (data) => {
    // Stop polling kalau sudah selesai
    const done = ['done', 'partial', 'failed'];
    return done.includes(data?.data?.status) ? false : 3000;
  },
  enabled: !!importLogId,
});
```

---

## Export Standard

```php
// GuruExportController.php

// Export kecil (<500 baris) — sync, langsung download
public function exportExcel(): \Symfony\Component\HttpFoundation\BinaryFileResponse
{
    $gurus = Guru::with(['jabatanAktif', 'pendidikanTerakhir'])->get();

    // Pakai PhpSpreadsheet atau maatwebsite/excel
    $filename = 'data-guru-' . now()->format('Y-m-d') . '.xlsx';
    return Excel::download(new GuruExport($gurus), $filename);
}

// Export besar — async job, notifikasi saat siap
public function exportBesar(Request $request): JsonResponse
{
    $exportJob = ExportLog::create([...]);
    ProcessGuruExport::dispatch($exportJob)->onQueue('exports');

    return $this->success(
        ['export_log_id' => $exportJob->ulid],
        'Sedang menyiapkan file. Kamu akan dapat notifikasi saat siap didownload.'
    );
}
```

---

## Template Excel

Template import harus:
- Baris pertama: header kolom (nama kolom harus konsisten dengan `mapRow()`)
- Baris kedua: contoh data yang valid
- Baris ketiga dst: data kosong
- Sheet kedua (opsional): panduan pengisian

Simpan template di: `storage/app/templates/template-import-{domain}.xlsx`

---

## Error Display di Frontend

```
Hasil Import:
┌─────────────────────────────────────┐
│ Total data   : 120 baris            │
│ Berhasil     : 115 baris  ✅        │
│ Gagal        : 5 baris    ❌        │
└─────────────────────────────────────┘

Detail Error:
Baris 12 — NUPTK harus 16 digit (nilai: "1234")
Baris 34 — Nama wajib diisi
Baris 56 — NUPTK sudah terdaftar: 1234567890123456
Baris 78 — Tanggal lahir tidak valid (nilai: "31-13-2000")
Baris 99 — Jenis kelamin tidak valid (nilai: "M")

[Download laporan error sebagai Excel]
```
