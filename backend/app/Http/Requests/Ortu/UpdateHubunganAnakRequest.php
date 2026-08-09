<?php

namespace App\Http\Requests\Ortu;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHubunganAnakRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ];
    }

    public function messages(): array
    {
        return [
            'hubungan.required' => 'Hubungan wajib dipilih.',
            'hubungan.in' => 'Hubungan harus Ayah, Ibu, atau Wali.',
        ];
    }
}