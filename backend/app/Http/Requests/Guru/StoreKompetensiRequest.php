<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreKompetensiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis' => ['required', 'in:bahasa,it,bidang_keahlian,lainnya'],
            'nama' => ['required', 'string', 'max:150'],
            'tingkat' => ['nullable', 'in:Dasar,Menengah,Mahir,Ahli'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'jenis.required' => 'Jenis kompetensi wajib dipilih.',
            'jenis.in' => 'Jenis kompetensi tidak valid.',
            'nama.required' => 'Nama kompetensi wajib diisi.',
        ];
    }
}