<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterOrtuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'nama_lengkap' => 'required|string|max:100',
            'no_hp' => 'required|string|max:20',
            // Ganti nisn → kode_anak karena nisn dienkripsi dan tidak bisa di-exists: check.
            // kode_anak adalah plain-text identifier yang dibagikan operator ke orang tua.
            'kode_anak' => 'required|string|size:10|exists:siswas,kode_anak',
            'kode_sekolah' => 'required|string',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ];
    }

    public function messages(): array
    {
        return [
            'kode_anak.required' => 'Kode anak wajib diisi.',
            'kode_anak.exists' => 'Kode anak tidak ditemukan. Minta kode ini ke operator sekolah.',
            'kode_anak.size' => 'Kode anak harus 10 karakter.',
            'hubungan.in' => 'Hubungan harus Ayah, Ibu, atau Wali.',
        ];
    }
}