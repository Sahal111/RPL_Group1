<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\UpdateKepegawaianRequest;
use App\Http\Resources\GuruResource;
use App\Models\Guru;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuruKepegawaianController extends Controller
{
    /**
     * Update teacher employment status & SK details.
     */
    public function updateKepegawaian(UpdateKepegawaianRequest $request, string $guruId): JsonResponse
    {
        $guru = Guru::find($guruId) ?? Guru::where('ulid', $guruId)->first();

        if (!$guru) {
            return $this->notFound('Data guru tidak ditemukan.');
        }

        $validated = $request->validated();

        $guru->update($validated);

        return $this->success(new GuruResource($guru), 'Data kepegawaian guru berhasil diperbarui.');
    }
}