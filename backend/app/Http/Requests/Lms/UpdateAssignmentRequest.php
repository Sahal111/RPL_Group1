<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mapel_id' => 'sometimes|exists:mapels,id',
            'kelas_id' => 'sometimes|exists:kelas,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'judul' => 'sometimes|string|max:200',
            'instruksi' => 'nullable|string',
            'lampiran' => 'nullable|file|mimes:pdf,doc,docx,zip|max:20480',
            'tipe' => 'sometimes|in:pr,proyek,latihan,portofolio,presentasi,lainnya',
            'batas_pengumpulan' => 'sometimes|date',
            'late_policy' => 'in:accept,penalty,reject',
            'late_penalty_persen' => 'numeric|min:0|max:100',
            'nilai_maksimal' => 'numeric|min:0|max:100',
            'boleh_revisi' => 'boolean',
            'is_published' => 'boolean',
        ];
    }
}