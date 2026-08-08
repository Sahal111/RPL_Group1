<?php

namespace App\Http\Requests\Operator;

class CreateWaliKelasUserRequest extends CreateUserRequest
{
    protected function roleRules(): array
    {
        return [
            'nuptk' => 'required|string|max:16|exists:gurus,nuptk',
            'kelas_id' => 'nullable|integer|exists:kelas,id',
            'no_sk' => 'nullable|string|max:80',
            'tmt_jabatan' => 'nullable|date',
        ];
    }
}