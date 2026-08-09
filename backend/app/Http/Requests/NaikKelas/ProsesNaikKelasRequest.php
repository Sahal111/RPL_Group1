<?php

namespace App\Http\Requests\NaikKelas;

use Illuminate\Foundation\Http\FormRequest;

class ProsesNaikKelasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kelas_id_asal' => 'required|string|exists:kelas,id',
            'kelas_id_tujuan' => 'required|string|exists:kelas,id|different:kelas_id_asal',
        ];
    }

    public function messages(): array
    {
        return [
            'kelas_id_asal.required' => 'Kelas asal wajib dipilih.',
            'kelas_id_tujuan.required' => 'Kelas tujuan wajib dipilih.',
            'kelas_id_tujuan.different' => 'Kelas tujuan harus berbeda dengan kelas asal.',
        ];
    }
}