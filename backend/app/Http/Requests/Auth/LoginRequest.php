<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'school_id' => ['nullable', 'integer', 'exists:schools,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'login.required' => 'Email atau username wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'school_id.exists' => 'Sekolah yang dipilih tidak valid.',
        ];
    }
}
