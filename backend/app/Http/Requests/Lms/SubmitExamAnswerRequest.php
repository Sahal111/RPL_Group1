<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class SubmitExamAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_id' => 'required|integer|exists:exam_questions,id',
            'jawaban' => 'nullable',
            'file_path' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'question_id.required' => 'ID soal wajib disertakan.',
            'question_id.exists' => 'Soal tidak ditemukan.',
        ];
    }
}