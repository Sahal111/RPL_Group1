<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StorePendidikanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenjang' => ['required', 'in:SD,SMP,SMA/SMK,D1,D2,D3,D4,S1,S2,S3'],
            'nama_sekolah' => ['required', 'string', 'max:200'],
            'jurusan' => ['nullable', 'string', 'max:100'],
            'prodi' => ['nullable', 'string', 'max:100'],
            'tahun_masuk' => ['nullable', 'integer', 'min:1950', 'max:' . date('Y')],
            'tahun_lulus' => ['nullable', 'integer', 'min:1950', 'max:' . (date('Y') + 1)],
            'no_ijazah' => ['nullable', 'string', 'max:80'],
            'file_ijazah' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'jenjang.required' => 'Jenjang pendidikan wajib dipilih.',
            'jenjang.in' => 'Jenjang pendidikan tidak valid.',
            'nama_sekolah.required' => 'Nama sekolah/institusi wajib diisi.',
            'file_ijazah.mimes' => 'File ijazah harus berformat PDF, JPG, atau PNG.',
            'file_ijazah.max' => 'Ukuran file ijazah maksimal 5MB.',
        ];
    }
}