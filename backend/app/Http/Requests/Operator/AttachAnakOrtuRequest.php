<?php

namespace App\Http\Requests\Operator;

use Illuminate\Foundation\Http\FormRequest;

class AttachAnakOrtuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nisn' => 'required|string|max:10|exists:siswas,nisn',
            'hubungan' => 'required|in:Ayah,Ibu,Wali,Kakek,Nenek,Paman,Bibi,Kakak,Lainnya',
        ];
    }
}