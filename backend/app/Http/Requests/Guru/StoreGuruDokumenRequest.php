<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuruDokumenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis_dokumen' => ['required', 'string', 'max:100'],
            'nama_dokumen' => ['required', 'string', 'max:150'],
            'berkas' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'nomor_dokumen' => ['nullable', 'string', 'max:100'],
            'tgl_terbit' => ['nullable', 'date'],
            'keterangan' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'jenis_dokumen.required' => 'Jenis dokumen wajib dipilih.',
            'nama_dokumen.required' => 'Nama dokumen wajib diisi.',
            'berkas.required' => 'Berkas dokumen wajib diunggah.',
            'berkas.mimes' => 'Format berkas harus PDF, JPG, JPEG, atau PNG.',
            'berkas.max' => 'Ukuran berkas maksimal 5MB.',
        ];
    }
}
