<?php

namespace App\Http\Requests\Keuangan;

use Illuminate\Foundation\Http\FormRequest;

class StoreTagihanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'siswa_id' => 'required|exists:siswas,id',
            'jenis_tagihan_id' => 'required|exists:jenis_tagihans,id',
            'tahun_ajaran_id' => 'nullable|exists:tahun_ajarans,id',
            'bulan' => 'nullable|integer|min:1|max:12',
            'nominal_tagihan' => 'required|numeric|min:0',
            'nominal_diskon' => 'nullable|numeric|min:0',
            'jatuh_tempo' => 'nullable|date',
            'keterangan' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'siswa_id.required' => 'Siswa wajib dipilih.',
            'siswa_id.exists' => 'Siswa tidak ditemukan.',
            'jenis_tagihan_id.required' => 'Jenis tagihan wajib dipilih.',
            'nominal_tagihan.required' => 'Nominal tagihan wajib diisi.',
        ];
    }
}