<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamRequest extends FormRequest
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
            'deskripsi' => 'nullable|string',
            'tipe' => 'required|in:ulangan_harian,ulangan_tengah_semester,ulangan_akhir_semester,kuis,tryout,lainnya',
            'waktu_mulai' => 'required|date',
            'waktu_selesai' => 'required|date|after:waktu_mulai',
            'durasi_menit' => 'required|integer|min:1|max:480',
            'acak_soal' => 'boolean',
            'acak_pilihan' => 'boolean',
            'tampilkan_skor_langsung' => 'boolean',
            'boleh_buka_lagi' => 'boolean',
            'nilai_lulus' => 'nullable|numeric|min:0|max:100',
            'is_published' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'mapel_id.required' => 'Mata pelajaran wajib dipilih.',
            'kelas_id.required' => 'Kelas wajib dipilih.',
            'judul.required' => 'Judul ujian wajib diisi.',
            'tipe.required' => 'Tipe ujian wajib dipilih.',
            'waktu_mulai.required' => 'Waktu mulai wajib diisi.',
            'waktu_selesai.after' => 'Waktu selesai harus setelah waktu mulai.',
            'durasi_menit.required' => 'Durasi ujian wajib diisi.',
        ];
    }
}