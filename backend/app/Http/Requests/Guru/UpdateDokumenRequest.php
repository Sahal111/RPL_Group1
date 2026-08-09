<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDokumenRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'kategori'           => 'required|in:identitas,kepegawaian,pendidikan,sertifikasi,administrasi,lainnya',
            'jenis_dokumen'      => 'nullable|string|max:80',
            'nama_dokumen'       => 'nullable|string|max:150',
            'nomor_dokumen'      => 'nullable|string|max:80',
            'tanggal_dokumen'    => 'nullable|date',
            'tanggal_berlaku'    => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after_or_equal:tanggal_berlaku',
            'penerbit'           => 'nullable|string|max:150',
            'keterangan'         => 'nullable|string|max:500',
            'catatan_versi'      => 'nullable|string|max:255',
            'file'               => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ];
    }
}
