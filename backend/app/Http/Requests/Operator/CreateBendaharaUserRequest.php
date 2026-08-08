<?php

namespace App\Http\Requests\Operator;

class CreateBendaharaUserRequest extends CreateUserRequest
{
    protected function roleRules(): array
    {
        return [
            'no_hp' => 'nullable|string|max:20',
            'jabatan' => 'nullable|string|max:100',
            'no_sk' => 'nullable|string|max:80',
            'tmt_jabatan' => 'nullable|date',
        ];
    }
}