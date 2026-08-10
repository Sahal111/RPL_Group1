<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class NilaiEsaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nilai_akhir' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'nilai_akhir.required' => 'Nilai akhir wajib diisi.',
            'nilai_akhir.max' => 'Nilai akhir maksimal 100.',
        ];
    }
}
