<?php

namespace App\Http\Requests\Operator;

class CreateOrtuUserRequest extends CreateUserRequest
{
    protected function roleRules(): array
    {
        return [
            'no_hp' => 'nullable|string|max:20',
            'nisn' => 'required|string|max:10|exists:siswas,nisn',
            'hubungan' => 'required|in:Ayah,Ibu,Wali',
        ];
    }
}