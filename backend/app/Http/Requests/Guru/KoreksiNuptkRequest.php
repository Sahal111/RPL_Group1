<?php

namespace App\Http\Requests\Guru;

use App\Models\Guru;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KoreksiNuptkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $guru = Guru::where('nuptk', $this->route('nuptk'))->first();

        return [
            'nuptk_baru' => [
                'required',
                'string',
                'size:16',
                'regex:/^\d{16}$/',
                Rule::unique('gurus', 'nuptk')->ignore($guru?->id),
            ],
            'alasan' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'nuptk_baru.required' => 'NUPTK baru wajib diisi.',
            'nuptk_baru.size' => 'NUPTK harus tepat 16 karakter.',
            'nuptk_baru.regex' => 'NUPTK harus terdiri dari 16 digit angka.',
            'nuptk_baru.unique' => 'NUPTK ini sudah digunakan guru lain.',
            'alasan.required' => 'Alasan koreksi NUPTK wajib diisi.',
        ];
    }
}