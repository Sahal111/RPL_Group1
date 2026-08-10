<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamRequest extends FormRequest
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
            'deskripsi' => 'nullable|string',
            'tipe' => 'sometimes|in:ulangan_harian,ulangan_tengah_semester,ulangan_akhir_semester,kuis,tryout,lainnya',
            'waktu_mulai' => 'sometimes|date',
            'waktu_selesai' => 'sometimes|date|after:waktu_mulai',
            'durasi_menit' => 'sometimes|integer|min:1|max:480',
            'acak_soal' => 'boolean',
            'acak_pilihan' => 'boolean',
            'tampilkan_skor_langsung' => 'boolean',
            'boleh_buka_lagi' => 'boolean',
            'nilai_lulus' => 'nullable|numeric|min:0|max:100',
            'is_published' => 'boolean',
        ];
    }
}