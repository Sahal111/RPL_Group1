<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreKontakDaruratRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:150'],
            'hubungan' => ['required', 'string', 'max:50'],
            'no_hp' => ['required', 'string', 'max:20'],
            'alamat' => ['nullable', 'string', 'max:255'],
            'is_primary' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama kontak darurat wajib diisi.',
            'hubungan.required' => 'Hubungan dengan guru wajib diisi.',
            'no_hp.required' => 'Nomor HP kontak darurat wajib diisi.',
        ];
    }
}