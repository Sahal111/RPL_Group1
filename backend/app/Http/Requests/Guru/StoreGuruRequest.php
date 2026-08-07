<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGuruRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $schoolId = (app()->bound('current_school_id') ? app('current_school_id') : null) ?? $this->input('school_id');

        return [
            'nama' => ['required', 'string', 'max:150'],
            'nik' => [
                'nullable',
                'string',
                'size:16',
                Rule::unique('gurus', 'nik')->where(fn ($q) => $q->where('school_id', $schoolId)),
            ],
            'nuptk' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('gurus', 'nuptk')->where(fn ($q) => $q->where('school_id', $schoolId)),
            ],
            'nip' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('gurus', 'nip')->where(fn ($q) => $q->where('school_id', $schoolId)),
            ],
            'email' => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('gurus', 'email')->where(fn ($q) => $q->where('school_id', $schoolId)),
            ],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['nullable', 'date'],
            'agama' => ['nullable', 'string', 'max:50'],
            'status_kepegawaian' => ['nullable', 'string', 'max:50'],
            'jenis_ptk' => ['nullable', 'string', 'max:50'],
            'alamat_jalan' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama guru wajib diisi.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',
            'jenis_kelamin.in' => 'Jenis kelamin harus L atau P.',
            'nik.unique' => 'NIK ini sudah terdaftar di sekolah ini.',
            'nuptk.unique' => 'NUPTK ini sudah terdaftar di sekolah ini.',
            'nip.unique' => 'NIP ini sudah terdaftar di sekolah ini.',
            'email.unique' => 'Email ini sudah terdaftar di sekolah ini.',
            'foto.image' => 'Berkas foto harus berupa gambar.',
            'foto.max' => 'Ukuran foto maksimal 2MB.',
        ];
    }
}