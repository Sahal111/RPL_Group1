<?php

namespace App\Http\Requests\Ppdb;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCalonSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_lengkap' => 'sometimes|string|max:150',
            'jenis_kelamin' => 'sometimes|in:L,P',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'sometimes|date|before:today',
            'agama' => 'nullable|string|max:30',
            'alamat' => 'nullable|string',
            'asal_sekolah' => 'nullable|string|max:200',
            'nama_orang_tua' => 'nullable|string|max:150',
            'no_hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'jalur' => 'nullable|in:Zonasi,Prestasi,Afirmasi,Pindah Tugas,Regular',
        ];
    }
}