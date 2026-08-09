<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKepegawaianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status_kepegawaian' => ['nullable', 'string', 'max:50'],
            'jenis_ptk' => ['nullable', 'string', 'max:50'],
            'status_aktif' => ['nullable', 'boolean'],
            'no_sk_pengangkatan' => ['nullable', 'string', 'max:100'],
            'tgl_sk_pengangkatan' => ['nullable', 'date'],
            'instansi_pengangkat' => ['nullable', 'string', 'max:100'],
            'tmt_pns' => ['nullable', 'date'],
            'tmt_gty' => ['nullable', 'date'],
            'masa_kerja_tahun' => ['nullable', 'integer'],
        ];
    }
}