<?php

namespace App\Http\Requests\Ppdb;

use Illuminate\Foundation\Http\FormRequest;

class VerifikasiCalonSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:verifikasi,lulus,tidak_lulus,cadangan,dibatalkan',
            'catatan_verifikasi' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status verifikasi wajib dipilih.',
            'status.in' => 'Status tidak valid. Pilihan: verifikasi, lulus, tidak_lulus, cadangan, dibatalkan.',
        ];
    }
}