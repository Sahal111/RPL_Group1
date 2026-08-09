<?php

namespace App\Http\Requests\Pengumuman;

use Illuminate\Foundation\Http\FormRequest;

class StorePengumumanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'judul'      => 'required|string|max:255',
            'konten'     => 'required|string',
            'kategori'   => 'required|string',
            'target'     => 'required|in:semua,internal,ortu',
            'publish_at' => 'nullable|date|after:now',
        ];
    }

    public function messages(): array
    {
        return [
            'judul.required'   => 'Judul pengumuman wajib diisi.',
            'konten.required'  => 'Konten pengumuman wajib diisi.',
            'target.in'        => 'Target harus semua, internal, atau ortu.',
            'publish_at.after' => 'Waktu publish harus di masa mendatang.',
        ];
    }
}
