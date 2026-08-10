<?php

namespace App\Http\Requests\Keuangan;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJenisTagihanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_tagihan' => 'sometimes|required|string|max:150',
            'kategori' => 'sometimes|required|in:spp,bos,komite,ppdb,lainnya',
            'nominal_default' => 'sometimes|required|numeric|min:0',
            'is_rutin' => 'sometimes|boolean',
            'tahun_ajaran_id' => 'sometimes|nullable|exists:tahun_ajarans,id',
            'is_active' => 'sometimes|boolean',
        ];
    }
}