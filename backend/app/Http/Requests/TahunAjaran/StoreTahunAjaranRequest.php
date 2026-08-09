<?php

namespace App\Http\Requests\TahunAjaran;

use Illuminate\Foundation\Http\FormRequest;

class StoreTahunAjaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tahun' => ['required', 'string', 'max:9', 'regex:/^\d{4}\/\d{4}$/', 'unique:tahun_ajarans,tahun'],
            'is_active' => 'nullable|boolean',
            'buat_semester' => 'nullable|boolean',
            'semester_ganjil_mulai' => 'nullable|date',
            'semester_ganjil_selesai' => 'nullable|date',
            'semester_genap_mulai' => 'nullable|date',
            'semester_genap_selesai' => 'nullable|date',
            'semester_aktif' => 'nullable|string|in:Ganjil,Genap',
            'tgl_mulai_ta' => 'nullable|date',
            'tgl_selesai_ta' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'tahun.required' => 'Tahun ajaran wajib diisi.',
            'tahun.regex' => 'Format tahun ajaran harus YYYY/YYYY, contoh: 2024/2025.',
            'tahun.unique' => 'Tahun ajaran ini sudah ada.',
        ];
    }
}