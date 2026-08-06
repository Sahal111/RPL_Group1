<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreSertifikasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis_sertifikasi' => ['required', 'string', 'max:100'],
            'no_sertifikat' => ['nullable', 'string', 'max:80'],
            'nrg' => ['nullable', 'string', 'max:20'],
            'tahun_sertifikasi' => ['nullable', 'integer', 'min:1990', 'max:' . date('Y')],
            'lptk' => ['nullable', 'string', 'max:200'],
            'bidang_studi' => ['nullable', 'string', 'max:100'],
            'tanggal_terbit' => ['nullable', 'date'],
            'expired_at' => ['nullable', 'date', 'after:tanggal_terbit'],
            'file_sertifikat' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'jenis_sertifikasi.required' => 'Jenis sertifikasi wajib diisi.',
            'expired_at.after' => 'Tanggal kadaluarsa harus setelah tanggal terbit.',
            'file_sertifikat.max' => 'Ukuran file sertifikat maksimal 5MB.',
        ];
    }
}