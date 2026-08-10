<?php

namespace App\Http\Requests\Ppdb;

use Illuminate\Foundation\Http\FormRequest;

class StorePembayaranPpdbRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis' => 'required|string|max:80',
            'nominal' => 'required|numeric|min:0',
            'status' => 'required|in:lunas,belum,cicil',
            'tanggal_bayar' => 'nullable|date',
            'no_bukti' => 'nullable|string|max:80',
        ];
    }

    public function messages(): array
    {
        return [
            'jenis.required' => 'Jenis pembayaran wajib diisi.',
            'nominal.required' => 'Nominal wajib diisi.',
            'nominal.min' => 'Nominal tidak boleh negatif.',
            'status.required' => 'Status pembayaran wajib dipilih.',
            'status.in' => 'Status tidak valid.',
        ];
    }
}