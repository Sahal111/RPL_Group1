<?php

namespace App\Http\Controllers\MasterData\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StorePenugasanRequest;
use App\Http\Requests\Guru\UpdateAdministrasiRequest;
use App\Models\Guru;
use App\Models\JadwalPelajaran;
use App\Models\PlotGuruMapel;
use Illuminate\Http\JsonResponse;

class GuruAdministrasiController extends Controller
{
    // ── ADMINISTRASI (Rekening, BPJS, Tunjangan) ──────────────────────────────

    public function getAdministrasi($nuptk): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        return $this->success($guru->rekenings);
    }

    public function updateAdministrasi(UpdateAdministrasiRequest $request, $nuptk): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $rekening = $guru->rekenings()->updateOrCreate(
            ['guru_id' => $guru->id, 'is_primary' => 1],
            $request->only([
                'nama_bank',
                'no_rekening',
                'atas_nama',
                'cabang',
                'npwp',
                'no_bpjs_kesehatan',
                'no_bpjs_ketenagakerjaan',
                'gaji_pokok',
                'tunjangan_fungsional',
                'tunjangan_profesi',
            ])
        );

        return $this->success($rekening, 'Data administrasi diperbarui.');
    }

    // ── PENUGASAN (Plot Guru Mapel) ────────────────────────────────────────────

    public function getPenugasan($nuptk): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $data = $guru->plotGuruMapels()
            ->with([
                'mapel:id,kode,nama_mapel,kelompok',
                'kelas:id,nama_kelas,tingkat',
                'tahunAjaran:id,tahun',
                'semester:id,nama',
            ])
            ->orderByDesc('tahun_ajaran_id')
            ->get();

        return $this->success($data);
    }

    public function storePenugasan(StorePenugasanRequest $request, $nuptk): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $exists = PlotGuruMapel::where('guru_id', $guru->id)
            ->where('mapel_id', $request->mapel_id)
            ->where('kelas_id', $request->kelas_id)
            ->where('semester_id', $request->semester_id)
            ->exists();

        if ($exists) {
            return $this->conflict('Penugasan ini sudah ada untuk semester yang dipilih.');
        }

        $plot = PlotGuruMapel::create([
            'guru_id' => $guru->id,
            'mapel_id' => $request->mapel_id,
            'kelas_id' => $request->kelas_id,
            'tahun_ajaran_id' => $request->tahun_ajaran_id,
            'semester_id' => $request->semester_id,
            'beban_jam' => $request->beban_jam ?? 0,
            'is_active' => true,
        ]);

        return $this->created(
            $plot->load([
                'mapel:id,kode,nama_mapel,kelompok',
                'kelas:id,nama_kelas,tingkat',
                'tahunAjaran:id,tahun',
                'semester:id,nama',
            ]),
            'Penugasan berhasil ditambahkan.'
        );
    }

    public function destroyPenugasan($nuptk, $id): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $plot = $guru->plotGuruMapels()->findOrFail($id);

        JadwalPelajaran::where('plot_id', $plot->id)->delete();
        $plot->delete();

        return $this->success(message: 'Penugasan dihapus beserta jadwalnya.');
    }
}