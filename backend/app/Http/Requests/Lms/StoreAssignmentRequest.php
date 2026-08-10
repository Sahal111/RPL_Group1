<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mapel_id' => 'required|exists:mapels,id',
            'kelas_id' => 'required|exists:kelas,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'judul' => 'required|string|max:200',
            'instruksi' => 'nullable|string',
            'lampiran' => 'nullable|file|mimes:pdf,doc,docx,zip|max:20480',
            'tipe' => 'required|in:pr,proyek,latihan,portofolio,presentasi,lainnya',
            'batas_pengumpulan' => 'required|date|after:now',
            'late_policy' => 'in:accept,penalty,reject',
            'late_penalty_persen' => 'numeric|min:0|max:100',
            'nilai_maksimal' => 'numeric|min:0|max:100',
            'boleh_revisi' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'mapel_id.required' => 'Mata pelajaran wajib dipilih.',
            'kelas_id.required' => 'Kelas wajib dipilih.',
            'judul.required' => 'Judul tugas wajib diisi.',
            'tipe.required' => 'Tipe tugas wajib dipilih.',
            'batas_pengumpulan.required' => 'Batas waktu pengumpulan wajib diisi.',
            'batas_pengumpulan.after' => 'Batas waktu harus di masa depan.',
        ];
    }
}