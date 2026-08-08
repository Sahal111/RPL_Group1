<?php

namespace App\Http\Requests\Operator;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrtuRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'email'    => "nullable|email|max:100|unique:users,email,{$userId}",
            'nama'     => 'nullable|string|max:150',
            'hubungan' => 'nullable|in:Ayah,Ibu,Wali,Kakek,Nenek,Paman,Bibi,Kakak,Lainnya',
        ];
    }
}
