<?php

namespace App\Http\Requests\NaikKelas;

use Illuminate\Foundation\Http\FormRequest;

class PreviewNaikKelasRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'kelas_id_asal' => 'required|string|exists:kelas,id',
        ];
    }

    public function messages(): array
    {
        return [
            'kelas_id_asal.required' => 'Kelas asal wajib dipilih.',
            'kelas_id_asal.exists'   => 'Kelas asal tidak ditemukan.',
        ];
    }
}
