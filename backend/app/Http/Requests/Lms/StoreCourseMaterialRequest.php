<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mapel_id' => 'required|exists:mapels,id',
            'kelas_id' => 'nullable|exists:kelas,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'judul' => 'required|string|max:200',
            'deskripsi' => 'nullable|string',
            'tipe' => 'required|in:dokumen,video,audio,link,teks,gambar,lainnya',
            'url_eksternal' => 'nullable|url|max:500|required_if:tipe,link',
            'file' => 'nullable|file|max:51200', // 50MB
            'urutan' => 'integer|min:0',
            'is_published' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'mapel_id.required' => 'Mata pelajaran wajib dipilih.',
            'judul.required' => 'Judul materi wajib diisi.',
            'tipe.required' => 'Tipe materi wajib dipilih.',
            'tipe.in' => 'Tipe materi tidak valid.',
            'url_eksternal.required_if' => 'URL wajib diisi untuk tipe link.',
            'file.max' => 'Ukuran file maksimal 50 MB.',
        ];
    }
}