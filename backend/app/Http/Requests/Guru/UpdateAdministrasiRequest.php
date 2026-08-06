<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdministrasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_bank' => ['nullable', 'string', 'max:100'],
            'no_rekening' => ['nullable', 'string', 'max:30'],
            'atas_nama' => ['nullable', 'string', 'max:150'],
            'cabang' => ['nullable', 'string', 'max:100'],
            'npwp' => ['nullable', 'string', 'max:20'],
            'no_bpjs_kesehatan' => ['nullable', 'string', 'max:30'],
            'no_bpjs_ketenagakerjaan' => ['nullable', 'string', 'max:30'],
            'gaji_pokok' => ['nullable', 'numeric', 'min:0'],
            'tunjangan_fungsional' => ['nullable', 'numeric', 'min:0'],
            'tunjangan_profesi' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}