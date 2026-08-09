<?php

namespace App\Http\Requests\Cuti;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCutiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis_cuti' => 'required|in:Cuti Tahunan,Cuti Sakit,Cuti Bersalin,Cuti Alasan Penting,Cuti Besar,Lainnya',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'no_sk' => 'nullable|string|max:80',
            'tanggal_sk' => 'nullable|date',
            'pejabat_pemberi' => 'nullable|string|max:150',
            'alasan' => 'nullable|string|max:500',
            'file_sk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'keterangan' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'jenis_cuti.required' => 'Jenis cuti wajib dipilih.',
            'jenis_cuti.in' => 'Jenis cuti tidak valid.',
            'tanggal_mulai.required' => 'Tanggal mulai cuti wajib diisi.',
            'tanggal_selesai.required' => 'Tanggal selesai cuti wajib diisi.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'file_sk.mimes' => 'File SK harus berformat PDF, JPG, JPEG, atau PNG.',
            'file_sk.max' => 'Ukuran file SK maksimal 5MB.',
        ];
    }
}