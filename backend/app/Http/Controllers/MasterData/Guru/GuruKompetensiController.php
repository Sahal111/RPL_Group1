<?php

namespace App\Http\Controllers\MasterData\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StoreKompetensiRequest;
use App\Models\Guru;
use Illuminate\Http\JsonResponse;

class GuruKompetensiController extends Controller
{
    public function index($nuptk): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        return $this->success($guru->kompetensi);
    }

    public function store(StoreKompetensiRequest $request, $nuptk): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $data = $guru->kompetensi()->create(
            $request->only(['jenis', 'nama', 'tingkat', 'keterangan'])
        );

        return $this->created($data, 'Kompetensi ditambahkan.');
    }

    public function update(StoreKompetensiRequest $request, $nuptk, $id): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $komp = $guru->kompetensi()->findOrFail($id);

        $komp->update($request->only(['jenis', 'nama', 'tingkat', 'keterangan']));

        return $this->success($komp, 'Kompetensi diperbarui.');
    }

    public function destroy($nuptk, $id): JsonResponse
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $guru->kompetensi()->findOrFail($id)->delete();

        return $this->success(message: 'Kompetensi dihapus.');
    }
}