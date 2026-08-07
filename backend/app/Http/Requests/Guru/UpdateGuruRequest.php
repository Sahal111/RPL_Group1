<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGuruRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $guruId = $this->route('guru')?->id ?? $this->route('id') ?? $this->input('id');
        $schoolId = (app()->bound('current_school_id') ? app('current_school_id') : null) ?? $this->input('school_id');

        return [
            'nama' => ['sometimes', 'required', 'string', 'max:150'],
            'nik' => [
                'nullable',
                'string',
                'size:16',
                Rule::unique('gurus', 'nik')->where(fn ($q) => $q->where('school_id', $schoolId))->ignore($guruId),
            ],
            'nuptk' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('gurus', 'nuptk')->where(fn ($q) => $q->where('school_id', $schoolId))->ignore($guruId),
            ],
            'nip' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('gurus', 'nip')->where(fn ($q) => $q->where('school_id', $schoolId))->ignore($guruId),
            ],
            'email' => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('gurus', 'email')->where(fn ($q) => $q->where('school_id', $schoolId))->ignore($guruId),
            ],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'jenis_kelamin' => ['sometimes', 'required', 'in:L,P'],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['nullable', 'date'],
            'agama' => ['nullable', 'string', 'max:50'],
            'status_kepegawaian' => ['nullable', 'string', 'max:50'],
            'jenis_ptk' => ['nullable', 'string', 'max:50'],
            'alamat_jalan' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ];
    }
}