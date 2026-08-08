<?php

namespace App\Http\Requests\Kelas;

use Illuminate\Foundation\Http\FormRequest;

class AddSiswaKelasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'siswa_id' => 'required|integer|exists:siswas,id',
            'jenis_perubahan' => 'required|in:masuk_baru,naik_kelas,mutasi_masuk',
        ];
    }
}