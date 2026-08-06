<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKeluargaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status_perkawinan' => ['nullable', 'in:Belum Menikah,Menikah,Cerai Hidup,Cerai Mati'],
            'nama_pasangan' => ['nullable', 'string', 'max:150'],
            'nik_pasangan' => ['nullable', 'string', 'max:16'],
            'pekerjaan_pasangan' => ['nullable', 'string', 'max:100'],
            'jumlah_anak' => ['nullable', 'integer', 'min:0'],

            // Array anak
            'anaks' => ['nullable', 'array'],
            'anaks.*.id' => ['nullable', 'integer', 'exists:guru_anaks,id'],
            'anaks.*.nama' => ['required_with:anaks', 'string', 'max:150'],
            'anaks.*.jenis_kelamin' => ['nullable', 'in:L,P'],
            'anaks.*.tanggal_lahir' => ['nullable', 'date'],
            'anaks.*.urutan' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'anaks.*.nama.required_with' => 'Nama anak wajib diisi.',
            'anaks.*.jenis_kelamin.in' => 'Jenis kelamin anak tidak valid.',
            'anaks.*.tanggal_lahir.date' => 'Format tanggal lahir anak tidak valid.',
        ];
    }
}