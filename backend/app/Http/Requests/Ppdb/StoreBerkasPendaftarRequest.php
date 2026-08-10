<?php

namespace App\Http\Requests\Ppdb;

use Illuminate\Foundation\Http\FormRequest;

class StoreBerkasPendaftarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis_berkas' => 'required|string|max:60',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // max 5MB
        ];
    }

    public function messages(): array
    {
        return [
            'jenis_berkas.required' => 'Jenis berkas wajib diisi.',
            'file.required' => 'File berkas wajib diunggah.',
            'file.mimes' => 'File harus berupa PDF, JPG, atau PNG.',
            'file.max' => 'Ukuran file maksimal 5 MB.',
        ];
    }
}