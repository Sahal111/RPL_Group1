<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreInpassingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'no_sk' => ['required', 'string', 'max:100'],
            'tanggal_sk' => ['required', 'date'],
            'tmt_inpassing' => ['required', 'date'],
            'golongan_sesudah' => ['nullable', 'string', 'max:10'],
            'jabatan_fungsional' => ['nullable', 'string', 'max:100'],
            'angka_kredit' => ['nullable', 'numeric', 'min:0'],
            'file_sk' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'no_sk.required' => 'Nomor SK inpassing wajib diisi.',
            'tanggal_sk.required' => 'Tanggal SK wajib diisi.',
            'tmt_inpassing.required' => 'TMT inpassing wajib diisi.',
        ];
    }
}