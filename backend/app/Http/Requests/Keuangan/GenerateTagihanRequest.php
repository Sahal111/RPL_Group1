<?php

namespace App\Http\Requests\Keuangan;

use Illuminate\Foundation\Http\FormRequest;

class GenerateTagihanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis_tagihan_id' => 'required|exists:jenis_tagihans,id',
            'tahun_ajaran_id' => 'required|exists:tahun_ajarans,id',
            'bulan' => 'nullable|integer|min:1|max:12',
            'jatuh_tempo' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'jenis_tagihan_id.required' => 'Jenis tagihan wajib dipilih.',
            'tahun_ajaran_id.required' => 'Tahun ajaran wajib dipilih.',
        ];
    }
}