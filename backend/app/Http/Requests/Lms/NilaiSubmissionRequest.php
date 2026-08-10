<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class NilaiSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nilai' => 'required|numeric|min:0|max:100',
            'feedback_guru' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'nilai.required' => 'Nilai wajib diisi.',
            'nilai.max' => 'Nilai maksimal 100.',
        ];
    }
}