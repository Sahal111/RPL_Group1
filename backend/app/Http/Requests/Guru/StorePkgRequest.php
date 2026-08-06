<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StorePkgRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'semester_id' => ['required', 'exists:semesters,id'],
            'nilai' => ['required', 'numeric', 'min:0', 'max:100'],
            'predikat' => ['required', 'in:Amat Baik,Baik,Cukup,Sedang,Kurang'],
            'catatan' => ['nullable', 'string'],
            'tanggal_penilaian' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'tahun_ajaran_id.required' => 'Tahun ajaran wajib dipilih.',
            'semester_id.required' => 'Semester wajib dipilih.',
            'nilai.required' => 'Nilai PKG wajib diisi.',
            'nilai.min' => 'Nilai PKG minimal 0.',
            'nilai.max' => 'Nilai PKG maksimal 100.',
            'predikat.required' => 'Predikat wajib dipilih.',
            'predikat.in' => 'Predikat tidak valid.',
        ];
    }
}