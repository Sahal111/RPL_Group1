<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mapel_id' => 'sometimes|exists:mapels,id',
            'kelas_id' => 'nullable|exists:kelas,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'judul' => 'sometimes|string|max:200',
            'deskripsi' => 'nullable|string',
            'tipe' => 'sometimes|in:dokumen,video,audio,link,teks,gambar,lainnya',
            'url_eksternal' => 'nullable|url|max:500',
            'file' => 'nullable|file|max:51200',
            'urutan' => 'integer|min:0',
            'is_published' => 'boolean',
        ];
    }
}