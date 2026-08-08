<?php

namespace App\Http\Requests\Absensi;

use Illuminate\Foundation\Http\FormRequest;

class RangkumanAbsensiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dari' => 'required|date',
            'sampai' => 'required|date|after_or_equal:dari',
        ];
    }

    public function messages(): array
    {
        return [
            'dari.required' => 'Tanggal awal wajib diisi.',
            'sampai.required' => 'Tanggal akhir wajib diisi.',
            'sampai.after_or_equal' => 'Tanggal akhir harus setelah tanggal awal.',
        ];
    }
}