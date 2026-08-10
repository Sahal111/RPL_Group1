<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pertanyaan' => 'required|string',
            'gambar' => 'nullable|string|max:500',
            'tipe' => 'required|in:pilihan_ganda,benar_salah,esai,isian_singkat,menjodohkan',
            'pilihan' => 'nullable|array',
            'pilihan.*' => 'string',
            'jawaban_benar' => 'nullable',
            'bobot' => 'nullable|numeric|min:0|max:100',
            'pembahasan' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'pertanyaan.required' => 'Teks pertanyaan wajib diisi.',
            'tipe.required' => 'Tipe soal wajib dipilih.',
            'tipe.in' => 'Tipe soal tidak valid.',
        ];
    }
}