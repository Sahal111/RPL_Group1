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
            'nama' => 'required|string|max:100',
            'no_hp' => 'required|string|max:20',
            'nisn' => 'required|string|size:10|exists:siswas,nisn',
            'kode_sekolah' => 'required|string',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ];
    }

    public function messages(): array
    {
        return [
            'nisn.exists' => 'NISN tidak ditemukan dalam data siswa.',
            'nisn.size' => 'NISN harus 10 digit.',
            'hubungan.in' => 'Hubungan harus Ayah, Ibu, atau Wali.',
        ];
    }
}