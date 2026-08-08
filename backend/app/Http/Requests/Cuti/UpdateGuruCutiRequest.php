<?php

namespace App\Http\Requests\Cuti;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGuruCutiRequest extends FormRequest
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
}