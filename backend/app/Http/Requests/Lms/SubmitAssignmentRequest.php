<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class SubmitAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'catatan_siswa' => 'nullable|string',
            'file' => 'nullable|file|max:20480', // 20MB
            'url_eksternal' => 'nullable|url|max:500',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (!$this->hasFile('file') && !$this->url_eksternal && !$this->catatan_siswa) {
                $v->errors()->add('file', 'Wajib mengumpulkan file, URL, atau catatan jawaban.');
            }
        });
    }
}