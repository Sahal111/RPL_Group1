<?php

namespace App\Http\Requests\Keuangan;

use Illuminate\Foundation\Http\FormRequest;

class StorePembayaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tagihan_id' => 'required|exists:tagihans,id',
            'nominal_bayar' => 'required|numeric|min:1',
            'tanggal_bayar' => 'required|date|before_or_equal:today',
            'metode_bayar' => 'required|in:tunai,transfer,va,qris,lainnya',
            'no_bukti' => 'nullable|string|max:80',
            'catatan' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'tagihan_id.required' => 'Tagihan wajib dipilih.',
            'nominal_bayar.required' => 'Nominal bayar wajib diisi.',
            'nominal_bayar.min' => 'Nominal bayar harus lebih dari 0.',
            'tanggal_bayar.required' => 'Tanggal bayar wajib diisi.',
            'tanggal_bayar.before_or_equal' => 'Tanggal bayar tidak boleh di masa depan.',
            'metode_bayar.required' => 'Metode bayar wajib dipilih.',
            'metode_bayar.in' => 'Metode bayar tidak valid.',
        ];
    }
}