<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class UploadFotoGuruRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'foto' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png',
                'max:2048',                    // 2MB
                'dimensions:min_width=100,min_height=100', // minimal 100x100px
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'foto.required' => 'File foto wajib diupload.',
            'foto.image' => 'File harus berupa gambar.',
            'foto.mimes' => 'Format foto harus JPG atau PNG.',
            'foto.max' => 'Ukuran foto maksimal 2MB.',
            'foto.dimensions' => 'Ukuran foto minimal 100x100 piksel.',
        ];
    }
}