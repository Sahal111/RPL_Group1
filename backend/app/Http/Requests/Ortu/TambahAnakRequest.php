<?php

namespace App\Http\Requests\Ortu;

use Illuminate\Foundation\Http\FormRequest;

class TambahAnakRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nisn' => 'required|string|size:10|exists:siswas,nisn',
            'kode_anak' => 'required|string|size:10',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ];
    }

    public function messages(): array
    {
        return [
            'nisn.required' => 'NISN wajib diisi.',
            'nisn.size' => 'NISN harus 10 digit.',
            'nisn.exists' => 'NISN tidak ditemukan.',
            'kode_anak.required' => 'Kode anak wajib diisi.',
            'hubungan.required' => 'Hubungan wajib dipilih.',
            'hubungan.in' => 'Hubungan harus Ayah, Ibu, atau Wali.',
        ];
    }
}