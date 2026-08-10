<?php

namespace App\Http\Requests\Ppdb;

use Illuminate\Foundation\Http\FormRequest;

class VerifikasiBerkasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status_verifikasi' => 'required|in:approved,rejected',
            'catatan' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'status_verifikasi.required' => 'Status verifikasi wajib dipilih.',
            'status_verifikasi.in' => 'Status tidak valid. Pilihan: approved, rejected.',
            'catatan.required_if' => 'Catatan wajib diisi jika berkas ditolak.',
        ];
    }
}