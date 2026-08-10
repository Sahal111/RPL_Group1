<?php

namespace App\Http\Requests\Ppdb;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePembayaranPpdbRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis' => 'sometimes|string|max:80',
            'nominal' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:lunas,belum,cicil',
            'tanggal_bayar' => 'nullable|date',
            'no_bukti' => 'nullable|string|max:80',
        ];
    }
}