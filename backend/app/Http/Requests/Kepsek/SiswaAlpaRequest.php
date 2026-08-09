<?php

namespace App\Http\Requests\Kepsek;

use Illuminate\Foundation\Http\FormRequest;

class SiswaAlpaRequest extends FormRequest
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
            'limit' => 'nullable|integer|between:5,50',
        ];
    }
}