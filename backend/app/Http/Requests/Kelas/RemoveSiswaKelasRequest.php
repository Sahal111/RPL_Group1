<?php

namespace App\Http\Requests\Kelas;

use Illuminate\Foundation\Http\FormRequest;

class RemoveSiswaKelasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis_perubahan' => 'required|in:lulus,mutasi_keluar,nonaktif,meninggal',
            'catatan' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'jenis_perubahan.required' => 'Jenis perubahan wajib dipilih.',
            'jenis_perubahan.in' => 'Jenis perubahan tidak valid.',
        ];
    }
}