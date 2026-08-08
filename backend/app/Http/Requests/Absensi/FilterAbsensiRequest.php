<?php

namespace App\Http\Requests\Absensi;

use Illuminate\Foundation\Http\FormRequest;

class FilterAbsensiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dari' => 'nullable|date',
            'sampai' => 'nullable|date|after_or_equal:dari',
            'bulan' => 'nullable|integer|between:1,12',
            'tahun' => 'nullable|integer',
        ];
    }
}