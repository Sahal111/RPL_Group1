<?php

namespace App\Http\Controllers\MasterData\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\UpdateKeluargaRequest;
use App\Http\Requests\Guru\StoreKontakDaruratRequest;
use App\Models\Guru;
use Illuminate\Support\Facades\DB;

class GuruKeluargaController extends Controller
{
    // ────────────────────────────────────────
    // SECTION: KELUARGA & ANAK
    // ────────────────────────────────────────

    public function getKeluarga($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        return $this->success([
            'keluarga' => $guru->keluarga,
            'anaks' => $guru->anaks,
        ]);
    }

    public function updateKeluarga(UpdateKeluargaRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        DB::transaction(function () use ($request, $guru) {
            $guru->keluarga()->updateOrCreate(
                ['guru_id' => $guru->id],
                [
                    'status_perkawinan' => $request->status_perkawinan,
                    'nama_pasangan' => $request->nama_pasangan,
                    'nik_pasangan' => $request->nik_pasangan,
                    'pekerjaan_pasangan' => $request->pekerjaan_pasangan,
                    'jumlah_anak' => $request->jumlah_anak ?? 0,
                ]
            );

            if ($request->has('anaks')) {
                $guru->anaks()->delete();
                foreach ($request->anaks as $i => $anak) {
                    $guru->anaks()->create([
                        'nama' => $anak['nama'],
                        'jenis_kelamin' => $anak['jenis_kelamin'] ?? null,
                        'tanggal_lahir' => $anak['tanggal_lahir'] ?? null,
                        'urutan' => $anak['urutan'] ?? ($i + 1),
                        'keterangan' => $anak['keterangan'] ?? null,
                    ]);
                }
            }
        });

        return $this->success(message: 'Data keluarga berhasil diperbarui.');
    }

    // ────────────────────────────────────────
    // SECTION: KONTAK DARURAT
    // ────────────────────────────────────────

    public function getKontakDarurat($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        return $this->success($guru->kontakDarurat);
    }

    public function storeKontakDarurat(StoreKontakDaruratRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        if ($request->is_primary) {
            $guru->kontakDarurat()->update(['is_primary' => 0]);
        }

        $data = $guru->kontakDarurat()->create($request->validated());

        return $this->created($data, 'Kontak darurat ditambahkan.');
    }

    public function updateKontakDarurat(StoreKontakDaruratRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $kontak = $guru->kontakDarurat()->findOrFail($id);

        if ($request->is_primary) {
            $guru->kontakDarurat()->where('id', '!=', $id)->update(['is_primary' => 0]);
        }

        $kontak->update($request->validated());

        return $this->success($kontak, 'Kontak darurat diperbarui.');
    }

    public function destroyKontakDarurat($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $guru->kontakDarurat()->findOrFail($id)->delete();

        return $this->success(message: 'Kontak darurat dihapus.');
    }
}