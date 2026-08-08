<?php

namespace App\Http\Requests\Operator;

class CreateGuruUserRequest extends CreateUserRequest
{
    protected function roleRules(): array
    {
        return [
            'nuptk' => 'required|string|max:16|exists:gurus,nuptk',
        ];
    }
}