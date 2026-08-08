<?php

namespace App\Http\Requests\Ortu;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrtuRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nama'          => 'required|string|max:150',
            'nik'           => 'nullable|string|max:16',
            'hubungan'      => 'required|in:Ayah,Ibu,Wali,Kakek,Nenek,Paman,Bibi,Kakak,Lainnya',
            'status'        => 'required|in:Kandung,Tiri,Angkat,Wali',
            'status_hidup'  => 'nullable|in:Masih Hidup,Meninggal,Tidak Diketahui',
            'tempat_lahir'  => 'nullable|string|max:100',
            'tahun_lahir'   => 'nullable|integer|min:1900|max:' . now()->year,
            'jenis_kelamin' => 'nullable|in:L,P',
            'agama'         => 'nullable|string|max:30',
            'pendidikan'    => 'nullable|string|max:50',
            'pekerjaan'     => 'nullable|string|max:100',
            'penghasilan'   => 'nullable|string|max:100',
            'no_hp'         => 'nullable|string|max:20',
            'email'         => 'nullable|email|max:150',
            'alamat'        => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required'     => 'Nama orang tua wajib diisi.',
            'hubungan.required' => 'Hubungan wajib dipilih.',
            'hubungan.in'       => 'Hubungan tidak valid.',
            'status.required'   => 'Status wajib dipilih.',
            'status.in'         => 'Status tidak valid.',
        ];
    }
}
