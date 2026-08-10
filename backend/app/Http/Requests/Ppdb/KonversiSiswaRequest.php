<?php

namespace App\Http\Requests\Ppdb;

use Illuminate\Foundation\Http\FormRequest;

class KonversiSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nisn' => 'nullable|string|max:20|unique:siswas,nisn',
            'nik' => 'nullable|string|max:20',
            'no_kk' => 'nullable|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'nisn.unique' => 'NISN ini sudah digunakan oleh siswa lain.',
        ];
    }
}