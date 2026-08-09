<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cuti\StoreCutiRequest;
use App\Http\Requests\Cuti\UpdateCutiRequest;
use App\Models\Guru;
use App\Models\GuruCuti;
use App\Services\GuruCutiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuruCutiController extends Controller
{
    public function __construct(private GuruCutiService $service)
    {
    }

    // GET /guru/{nuptk}/cuti
    public function index($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json([
            'success' => true,
            'data' => $guru->cutis()->get(),
        ]);
    }

    // POST /guru/{nuptk}/cuti
    public function store(StoreCutiRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $result = $this->service->validate($guru, $request->all());
        if (count($result['errors']) > 0) {
            return response()->json([
                'success' => false,
                'message' => $result['errors'][0],
                'errors' => $result['errors'],
            ], 422);
        }

        $data = $request->only([
            'jenis_cuti',
            'tanggal_mulai',
            'tanggal_selesai',
            'no_sk',
            'tanggal_sk',
            'pejabat_pemberi',
            'alasan',
            'keterangan',
        ]);

        if ($request->hasFile('file_sk')) {
            $data['file_sk'] = $request->file('file_sk')
                ->store("guru-dokumen/{$guru->id}/cuti", 'public');
        }

        $cuti = $this->service->store($guru, $data);

        return response()->json([
            'success' => true,
            'message' => 'Data cuti berhasil disimpan.',
            'data' => $cuti,
            'warnings' => $result['warnings'],
        ], 201);
    }

    // PUT /guru/{nuptk}/cuti/{id}
    public function update(UpdateCutiRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $cuti = $guru->cutis()->findOrFail($id);

        $result = $this->service->validate($guru, $request->all(), $id);
        if (count($result['errors']) > 0) {
            return response()->json([
                'success' => false,
                'message' => $result['errors'][0],
                'errors' => $result['errors'],
            ], 422);
        }

        $data = $request->only([
            'jenis_cuti',
            'tanggal_mulai',
            'tanggal_selesai',
            'no_sk',
            'tanggal_sk',
            'pejabat_pemberi',
            'alasan',
            'keterangan',
        ]);

        if ($request->hasFile('file_sk')) {
            if ($cuti->file_sk)
                Storage::disk('public')->delete($cuti->file_sk);
            $data['file_sk'] = $request->file('file_sk')
                ->store("guru-dokumen/{$guru->id}/cuti", 'public');
        }

        return response()->json([
            'success' => true,
            'message' => 'Data cuti diperbarui.',
            'data' => $this->service->update($cuti, $data),
        ]);
    }

    // PATCH /guru/{nuptk}/cuti/{id}/selesai
    public function selesai($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $cuti = $guru->cutis()->where('status', 'Disetujui')->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Cuti ditandai selesai. Status guru dikembalikan ke Aktif.',
            'data' => $this->service->selesai($cuti),
        ]);
    }

    // DELETE /guru/{nuptk}/cuti/{id}
    public function destroy($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $cuti = $guru->cutis()->findOrFail($id);

        if ($cuti->file_sk)
            Storage::disk('public')->delete($cuti->file_sk);

        $this->service->destroy($cuti);

        return response()->json(['success' => true, 'message' => 'Data cuti dihapus.']);
    }
}