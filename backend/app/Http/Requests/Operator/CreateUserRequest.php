<?php

namespace App\Http\Requests\Operator;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Base rules untuk semua endpoint pembuatan akun pengguna oleh operator.
 * Field tambahan per-role di-extend melalui subclass atau dengan merge di rules().
 */
class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return array_merge($this->baseRules(), $this->roleRules());
    }

    protected function baseRules(): array
    {
        return [
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8',
            'nama' => 'required|string|max:150',
        ];
    }

    /**
     * Override di subclass untuk tambahkan field spesifik role.
     */
    protected function roleRules(): array
    {
        return [];
    }
}