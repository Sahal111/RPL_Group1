<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class UploadDokumenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kategori' => ['required', 'in:identitas,kepegawaian,pendidikan,sertifikasi,administrasi,penghargaan,lainnya'],
            'jenis_dokumen' => ['nullable', 'string', 'max:80'],
            'nama_dokumen' => ['nullable', 'string', 'max:150'],
            'nomor_dokumen' => ['nullable', 'string', 'max:80'],
            'tanggal_dokumen' => ['nullable', 'date'],
            'tanggal_berlaku' => ['nullable', 'date'],
            'tanggal_kadaluarsa' => ['nullable', 'date', 'after_or_equal:tanggal_berlaku'],
            'penerbit' => ['nullable', 'string', 'max:150'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'kategori.required' => 'Kategori dokumen wajib dipilih.',
            'kategori.in' => 'Kategori dokumen tidak valid.',
            'file.required' => 'File dokumen wajib diupload.',
            'file.mimes' => 'Format file harus PDF, JPG, atau PNG.',
            'file.max' => 'Ukuran file maksimal 10MB.',
            'tanggal_kadaluarsa.after_or_equal' => 'Tanggal kadaluarsa harus sama atau setelah tanggal berlaku.',
        ];
    }
}