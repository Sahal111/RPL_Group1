<?php

namespace App\Http\Controllers\MasterData\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StoreMutasiRequest;
use App\Models\Guru;
use App\Models\Kelas;
use App\Services\MutasiGuruService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuruMutasiController extends Controller
{
    public function __construct(private MutasiGuruService $service)
    {
    }

    public function index($nuptk): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        return $this->success(
            $guru->mutasi()->orderBy('tanggal_mutasi')->get()
        );
    }

    public function allowedTransitions($nuptk): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        return $this->success([
            'status_guru' => $guru->status_keaktifan,
            'transitions' => $this->service->allowedTransitions($guru),
        ]);
    }

    public function analyze(Request $request, $nuptk): JsonResponse
    {
        $guru = Guru::with([
            'user',
            'jabatanAktif',
            'kelasWali',
            'plotGuruMapels.mapel',
            'jadwals',
            'mutasi',
        ])->where('nuptk', $nuptk)->firstOrFail();

        $result = $this->service->analyze($guru, $request->all());

        if (count($result['errors']) > 0) {
            return $this->error('Data mutasi tidak valid.', 'VALIDATION_ERROR', 422, $result);
        }

        return $this->success($result);
    }

    public function store(StoreMutasiRequest $request, $nuptk): JsonResponse
    {
        $guru = Guru::with([
            'user',
            'jabatanAktif',
            'kelasWali',
            'plotGuruMapels',
            'jadwals',
        ])->where('nuptk', $nuptk)->firstOrFail();

        $validation = $this->service->analyze($guru, $request->all());

        if (count($validation['errors']) > 0) {
            return $this->validationError(
                ['mutasi' => $validation['errors']],
                $validation['errors'][0]
            );
        }

        $data = $request->only([
            'jenis_mutasi',
            'jenis_keluar',
            'sekolah_asal',
            'npsn_asal',
            'sekolah_tujuan',
            'npsn_tujuan',
            'tanggal_mutasi',
            'tmt_mutasi',
            'tanggal_berakhir',
            'jabatan_sebelum',
            'jabatan_sesudah',
            'status_kepegawaian',
            'no_sk',
            'tanggal_sk',
            'instansi_penerbit_sk',
            'alasan_mutasi',
            'keterangan',
        ]);

        if ($request->hasFile('file_sk')) {
            $data['file_sk'] = $request->file('file_sk')
                ->store("guru-dokumen/{$guru->id}/mutasi", 'public');
        }

        $mutasi = $this->service->execute($guru, $data);

        return $this->created(
            $mutasi,
            "Mutasi {$data['jenis_mutasi']} berhasil disimpan dan sistem telah disinkronkan."
        );
    }

    public function update(StoreMutasiRequest $request, $nuptk, $id): JsonResponse
    {
        $guru = Guru::with([
            'user',
            'jabatanAktif',
            'kelasWali',
            'plotGuruMapels',
            'jadwals',
        ])->where('nuptk', $nuptk)->firstOrFail();

        $mutasi = $guru->mutasi()->findOrFail($id);

        $validation = $this->service->analyze($guru, array_merge($request->all(), ['mutasi_id' => $id]));

        if (count($validation['errors']) > 0) {
            return $this->validationError(
                ['mutasi' => $validation['errors']],
                $validation['errors'][0]
            );
        }

        $data = $request->only([
            'jenis_mutasi',
            'jenis_keluar',
            'sekolah_asal',
            'npsn_asal',
            'sekolah_tujuan',
            'npsn_tujuan',
            'tanggal_mutasi',
            'tmt_mutasi',
            'tanggal_berakhir',
            'jabatan_sebelum',
            'jabatan_sesudah',
            'status_kepegawaian',
            'no_sk',
            'tanggal_sk',
            'instansi_penerbit_sk',
            'alasan_mutasi',
            'keterangan',
        ]);

        if ($request->hasFile('file_sk')) {
            if ($mutasi->file_sk) {
                Storage::disk('public')->delete($mutasi->file_sk);
            }
            $data['file_sk'] = $request->file('file_sk')
                ->store("guru-dokumen/{$guru->id}/mutasi", 'public');
        }

        if ($data['jenis_mutasi'] !== $mutasi->jenis_mutasi) {
            $mutasi = $this->service->execute($guru, $data, $mutasi->id);
        } else {
            $mutasi->update($data);
        }

        return $this->success($mutasi->fresh(), 'Riwayat mutasi diperbarui.');
    }

    public function destroy($nuptk, $id): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $mutasi = $guru->mutasi()->findOrFail($id);
        $jenis = $mutasi->jenis_mutasi;

        if ($mutasi->is_locked) {
            $kelasWali = Kelas::where('wali_kelas_id', $guru->id)->where('is_active', 1)->pluck('nama_kelas')->toArray();
            $mapelAktif = $guru->plotGuruMapels()->where('is_active', 1)->count();

            $relasi = array_filter([
                count($kelasWali) ? 'Wali Kelas: ' . implode(', ', $kelasWali) : null,
                $mapelAktif ? "{$mapelAktif} penugasan mapel aktif" : null,
            ]);

            if (count($relasi) > 0) {
                return $this->error(
                    'Mutasi tidak dapat dihapus karena masih mempengaruhi: '
                    . implode('; ', $relasi)
                    . '. Lepaskan relasi terlebih dahulu.',
                    'CONFLICT',
                    422
                );
            }
        }

        if ($mutasi->file_sk) {
            Storage::disk('public')->delete($mutasi->file_sk);
        }

        $mutasi->delete();

        // Re-derive status dari sisa mutasi terbaru
        $sisaMutasi = $guru->mutasi()->orderByDesc('tanggal_mutasi')->first();

        if ($sisaMutasi) {
            match ($sisaMutasi->jenis_mutasi) {
                'Keluar' => $guru->update(['status_keaktifan' => 'Keluar']),
                'Masuk',
                'Kembali Bertugas' => $guru->update(['status_keaktifan' => 'Aktif']),
                default => null,
            };
        } elseif ($jenis === 'Keluar') {
            $guru->update(['status_keaktifan' => 'Aktif']);
        }

        return $this->success(message: 'Riwayat mutasi dihapus.');
    }
}