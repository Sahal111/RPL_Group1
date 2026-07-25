<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\MataPelajaran;
use Illuminate\Http\Request;

class MasterDataMapelController extends Controller
{
    /* ── Konstanta validasi ───────────────────────────────────── */
    private const KELOMPOK_VALID = ['A - Wajib', 'B - Wajib', 'C - Muatan Lokal', 'Pengembangan Diri', 'Ekstrakurikuler', 'Lainnya'];
    private const KURIKULUM_VALID = ['Kurikulum 2013', 'Kurikulum Merdeka', 'Keduanya'];

    /* ─────────────────────────────────────────────────────────── */
    /*  INDEX                                                      */
    /* ─────────────────────────────────────────────────────────── */
    public function index(Request $request)
    {
        $query = MataPelajaran::query()
            ->when(
                $request->search,
                fn($q) => $q
                    ->where('nama_mapel', 'like', "%{$request->search}%")
                    ->orWhere('kode', 'like', "%{$request->search}%")   // fix: was kode_mapel
            )
            ->when($request->kelompok, fn($q) => $q->where('kelompok', $request->kelompok))
            ->when($request->tingkat, fn($q) => $q->where('tingkat', $request->tingkat))
            ->when(
                $request->is_active !== null && $request->is_active !== '',
                fn($q) => $q->where('is_active', (bool) $request->is_active)
            )
            ->orderBy('kelompok')
            ->orderBy('nama_mapel')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $query]);
    }

    /* ─────────────────────────────────────────────────────────── */
    /*  STORE                                                      */
    /* ─────────────────────────────────────────────────────────── */
    public function store(Request $request)
    {
        $request->validate([
            'kode' => 'required|string|max:20|unique:mapels,kode',
            'nama_mapel' => 'required|string|max:150',
            'kelompok' => 'required|in:' . implode(',', self::KELOMPOK_VALID),
            'tingkat' => 'nullable|array',
            'tingkat.*' => 'in:1,2,3,4,5,6',
            'jam_per_minggu' => 'required|integer|min:1|max:40',
            'kurikulum' => 'required|in:' . implode(',', self::KURIKULUM_VALID),
        ]);

        $mapel = MataPelajaran::create([
            'kode' => strtoupper($request->kode),
            'nama_mapel' => $request->nama_mapel,
            'kelompok' => $request->kelompok,
            'tingkat' => $this->parseTingkat($request->tingkat),
            'jam_per_minggu' => (int) $request->jam_per_minggu,
            'kurikulum' => $request->kurikulum,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil ditambahkan.',
            'data' => $mapel,
        ], 201);
    }

    /* ─────────────────────────────────────────────────────────── */
    /*  SHOW                                                       */
    /* ─────────────────────────────────────────────────────────── */
    public function show($id)
    {
        return response()->json(['success' => true, 'data' => MataPelajaran::findOrFail($id)]);
    }

    /* ─────────────────────────────────────────────────────────── */
    /*  UPDATE                                                     */
    /* ─────────────────────────────────────────────────────────── */
    public function update(Request $request, $id)
    {
        $mapel = MataPelajaran::findOrFail($id);

        $request->validate([
            'kode' => "required|string|max:20|unique:mapels,kode,{$id}",
            'nama_mapel' => 'required|string|max:150',
            'kelompok' => 'required|in:' . implode(',', self::KELOMPOK_VALID),
            'tingkat' => 'nullable|array',
            'tingkat.*' => 'in:1,2,3,4,5,6',
            'jam_per_minggu' => 'required|integer|min:1|max:40',
            'kurikulum' => 'required|in:' . implode(',', self::KURIKULUM_VALID),
            'is_active' => 'boolean',
        ]);

        $mapel->update([
            'kode' => strtoupper($request->kode),
            'nama_mapel' => $request->nama_mapel,
            'kelompok' => $request->kelompok,
            'tingkat' => $this->parseTingkat($request->tingkat),
            'jam_per_minggu' => (int) $request->jam_per_minggu,
            'kurikulum' => $request->kurikulum,
            'is_active' => $request->boolean('is_active', $mapel->is_active),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil diperbarui.',
            'data' => $mapel->fresh(),
        ]);
    }

    /* ─────────────────────────────────────────────────────────── */
    /*  TOGGLE ACTIVE                                              */
    /* ─────────────────────────────────────────────────────────── */
    public function toggleActive($id)
    {
        $mapel = MataPelajaran::findOrFail($id);
        $mapel->update(['is_active' => !$mapel->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Status mata pelajaran berhasil diubah.',
            'data' => $mapel->fresh(),
        ]);
    }

    /* ─────────────────────────────────────────────────────────── */
    /*  DESTROY                                                    */
    /* ─────────────────────────────────────────────────────────── */
    public function destroy($id)
    {
        MataPelajaran::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil dihapus.',
        ]);
    }

    /* ─────────────────────────────────────────────────────────── */
    /*  DROPDOWN (untuk jadwal, plot guru, dll)                   */
    /* ─────────────────────────────────────────────────────────── */
    public function dropdown()
    {
        $data = MataPelajaran::where('is_active', true)
            ->orderBy('kelompok')
            ->orderBy('nama_mapel')
            ->get(['id', 'kode', 'nama_mapel', 'kelompok', 'tingkat']);   // fix: was kode_mapel

        return response()->json(['success' => true, 'data' => $data]);
    }

    /* ─────────────────────────────────────────────────────────── */
    /*  EXPORT CSV                                                 */
    /* ─────────────────────────────────────────────────────────── */
    public function export(Request $request)
    {
        $rows = MataPelajaran::query()
            ->when($request->kelompok, fn($q) => $q->where('kelompok', $request->kelompok))
            ->when($request->tingkat, fn($q) => $q->where('tingkat', $request->tingkat))
            ->when(
                $request->is_active !== null && $request->is_active !== '',
                fn($q) => $q->where('is_active', (bool) $request->is_active)
            )
            ->orderBy('kelompok')
            ->orderBy('nama_mapel')
            ->get();

        $filename = 'master_mapel_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');

            // BOM UTF-8 supaya Excel bisa baca karakter Indonesia
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['kode', 'nama_mapel', 'kelompok', 'tingkat', 'jam_per_minggu', 'kurikulum', 'is_active']);

            foreach ($rows as $m) {
                fputcsv($handle, [
                    $m->kode,
                    $m->nama_mapel,
                    $m->kelompok,
                    $m->tingkat ?? 'Semua',
                    $m->jam_per_minggu,
                    $m->kurikulum,
                    $m->is_active ? '1' : '0',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /* ─────────────────────────────────────────────────────────── */
    /*  DOWNLOAD TEMPLATE CSV                                      */
    /* ─────────────────────────────────────────────────────────── */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template_import_mapel.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['kode', 'nama_mapel', 'kelompok', 'tingkat', 'jam_per_minggu', 'kurikulum']);

            // Baris contoh
            fputcsv($handle, ['MTK', 'Matematika', 'A - Wajib', 'Semua', '4', 'Keduanya']);
            fputcsv($handle, ['IPA', 'Ilmu Pengetahuan Alam', 'A - Wajib', '4,5,6', '3', 'Kurikulum Merdeka']);
            fputcsv($handle, ['BTQ', 'Baca Tulis Quran', 'C - Muatan Lokal', '1,2,3', '2', 'Kurikulum 2013']);
            fputcsv($handle, ['PJOK', 'Pendidikan Jasmani', 'B - Wajib', 'Semua', '3', 'Keduanya']);

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /* ─────────────────────────────────────────────────────────── */
    /*  IMPORT CSV                                                 */
    /* ─────────────────────────────────────────────────────────── */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        // Deteksi & skip BOM UTF-8
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        // Baca baris header
        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return response()->json(['success' => false, 'message' => 'File CSV kosong atau tidak valid.'], 422);
        }

        // Normalise: trim + lowercase
        $header = array_map(fn($h) => strtolower(trim($h)), $header);

        $required = ['kode', 'nama_mapel', 'kelompok', 'jam_per_minggu', 'kurikulum'];
        $missing = array_diff($required, $header);
        if ($missing) {
            fclose($handle);
            return response()->json([
                'success' => false,
                'message' => 'Kolom wajib tidak ditemukan: ' . implode(', ', $missing),
            ], 422);
        }

        $imported = 0;
        $skipped = 0;
        $errors = [];
        $rowNum = 1;

        while (($cols = fgetcsv($handle)) !== false) {
            $rowNum++;

            // Skip baris kosong
            if (count(array_filter($cols, fn($c) => trim($c) !== '')) === 0) {
                continue;
            }

            $data = array_combine($header, array_pad($cols, count($header), ''));

            $kode = strtoupper(trim($data['kode'] ?? ''));
            $namaMapel = trim($data['nama_mapel'] ?? '');
            $kelompok = trim($data['kelompok'] ?? '');
            $tingkatRaw = trim($data['tingkat'] ?? '');
            $jamRaw = trim($data['jam_per_minggu'] ?? '');
            $kurikulum = trim($data['kurikulum'] ?? '');

            // ── Validasi wajib ─────────────────────────────────
            if (!$kode || !$namaMapel || !$kelompok || !$jamRaw || !$kurikulum) {
                $errors[] = "Baris {$rowNum}: kolom wajib ada yang kosong.";
                $skipped++;
                continue;
            }
            if (!in_array($kelompok, self::KELOMPOK_VALID)) {
                $errors[] = "Baris {$rowNum}: kelompok '{$kelompok}' tidak valid.";
                $skipped++;
                continue;
            }
            if (!in_array($kurikulum, self::KURIKULUM_VALID)) {
                $errors[] = "Baris {$rowNum}: kurikulum '{$kurikulum}' tidak valid.";
                $skipped++;
                continue;
            }
            if (!is_numeric($jamRaw) || (int) $jamRaw < 1 || (int) $jamRaw > 40) {
                $errors[] = "Baris {$rowNum}: jam_per_minggu harus angka 1–40, ditemukan '{$jamRaw}'.";
                $skipped++;
                continue;
            }

            // ── Olah kolom tingkat ────────────────────────────
            if (!$tingkatRaw || strtolower($tingkatRaw) === 'semua') {
                $tingkatValue = null;
            } else {
                $tList = array_map('trim', explode(',', $tingkatRaw));
                $valid = array_filter($tList, fn($t) => in_array($t, ['1', '2', '3', '4', '5', '6']));
                $tingkatValue = count($valid) === 6 ? null : implode(',', array_values($valid));
            }

            // ── Upsert berdasarkan kode ───────────────────────
            MataPelajaran::updateOrCreate(
                ['kode' => $kode],
                [
                    'nama_mapel' => $namaMapel,
                    'kelompok' => $kelompok,
                    'tingkat' => $tingkatValue,
                    'jam_per_minggu' => (int) $jamRaw,
                    'kurikulum' => $kurikulum,
                    'is_active' => true,
                ]
            );

            $imported++;
        }

        fclose($handle);

        return response()->json([
            'success' => true,
            'message' => "Import selesai. {$imported} data berhasil diimpor, {$skipped} baris dilewati.",
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
        ]);
    }

    /* ─────────────────────────────────────────────────────────── */
    /*  HELPER                                                     */
    /* ─────────────────────────────────────────────────────────── */

    /**
     * Konversi array tingkat dari frontend → string atau null.
     * null  → berlaku untuk semua tingkat (1–6).
     * "1,3" → hanya tingkat 1 dan 3.
     */
    private function parseTingkat(?array $tingkat): ?string
    {
        if (empty($tingkat) || count($tingkat) === 6) {
            return null;
        }

        return implode(',', array_values(array_filter($tingkat, fn($t) => in_array($t, ['1', '2', '3', '4', '5', '6']))));
    }
}