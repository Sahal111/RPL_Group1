<?php

namespace App\Http\Requests\TahunAjaran;

use Illuminate\Foundation\Http\FormRequest;

class AktifkanSemesterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'semester_nama' => 'required|in:Ganjil,Genap',
        ];
    }

    public function messages(): array
    {
        return [
            'semester_nama.required' => 'Nama semester wajib dipilih.',
            'semester_nama.in' => 'Semester harus Ganjil atau Genap.',
        ];
    }
}