<?php

namespace App\Http\Requests\Keuangan;

use Illuminate\Foundation\Http\FormRequest;

class StoreJenisTagihanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_tagihan' => 'required|string|max:150',
            'kategori' => 'required|in:spp,bos,komite,ppdb,lainnya',
            'nominal_default' => 'required|numeric|min:0',
            'is_rutin' => 'boolean',
            'tahun_ajaran_id' => 'nullable|exists:tahun_ajarans,id',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'nama_tagihan.required' => 'Nama tagihan wajib diisi.',
            'kategori.required' => 'Kategori wajib dipilih.',
            'kategori.in' => 'Kategori tidak valid.',
            'nominal_default.required' => 'Nominal default wajib diisi.',
            'nominal_default.min' => 'Nominal tidak boleh negatif.',
        ];
    }
}