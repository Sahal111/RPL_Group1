<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Http\Resources\GuruResource;
use App\Models\Guru;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuruKepegawaianController extends Controller
{
    /**
     * Update teacher employment status & SK details.
     */
    public function updateKepegawaian(Request $request, string $guruId): JsonResponse
    {
        $guru = Guru::find($guruId) ?? Guru::where('ulid', $guruId)->first();

        if (!$guru) {
            return $this->notFound('Data guru tidak ditemukan.');
        }

        $validated = $request->validate([
            'status_kepegawaian' => ['nullable', 'string', 'max:50'],
            'jenis_ptk' => ['nullable', 'string', 'max:50'],
            'status_aktif' => ['nullable', 'boolean'],
            'no_sk_pengangkatan' => ['nullable', 'string', 'max:100'],
            'tgl_sk_pengangkatan' => ['nullable', 'date'],
            'instansi_pengangkat' => ['nullable', 'string', 'max:100'],
            'tmt_pns' => ['nullable', 'date'],
            'tmt_gty' => ['nullable', 'date'],
            'masa_kerja_tahun' => ['nullable', 'integer'],
        ]);

        $guru->update($validated);

        return $this->success(new GuruResource($guru), 'Data kepegawaian guru berhasil diperbarui.');
    }
}
