<?php

namespace App\Http\Requests\Ppdb;

use Illuminate\Foundation\Http\FormRequest;

class StoreCalonSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tahun_ajaran_id' => 'required|exists:tahun_ajarans,id',
            'nama_lengkap' => 'required|string|max:150',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'required|date|before:today',
            'agama' => 'nullable|string|max:30',
            'alamat' => 'nullable|string',
            'asal_sekolah' => 'nullable|string|max:200',
            'nama_orang_tua' => 'nullable|string|max:150',
            'no_hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'jalur' => 'nullable|in:Zonasi,Prestasi,Afirmasi,Pindah Tugas,Regular',
        ];
    }

    public function messages(): array
    {
        return [
            'tahun_ajaran_id.required' => 'Tahun ajaran wajib dipilih.',
            'tahun_ajaran_id.exists' => 'Tahun ajaran tidak valid.',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',
            'jenis_kelamin.in' => 'Jenis kelamin tidak valid.',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',
            'tanggal_lahir.before' => 'Tanggal lahir harus sebelum hari ini.',
            'jalur.in' => 'Jalur pendaftaran tidak valid.',
        ];
    }
}