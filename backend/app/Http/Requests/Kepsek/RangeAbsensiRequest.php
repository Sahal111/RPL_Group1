<?php

namespace App\Http\Requests\Kepsek;

use Illuminate\Foundation\Http\FormRequest;

class RangeAbsensiRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'dari'   => 'required|date',
            'sampai' => 'required|date|after_or_equal:dari',
        ];
    }

    public function messages(): array
    {
        return [
            'dari.required'           => 'Tanggal mulai wajib diisi.',
            'sampai.required'         => 'Tanggal selesai wajib diisi.',
            'sampai.after_or_equal'   => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ];
    }
}
