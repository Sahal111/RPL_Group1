<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiklatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_diklat' => ['required', 'string', 'max:200'],
            'penyelenggara' => ['nullable', 'string', 'max:200'],
            'jenis' => ['nullable', 'in:diklat,bimtek,workshop,seminar,pelatihan,kursus'],
            'tingkat' => ['nullable', 'in:Kecamatan,Kabupaten/Kota,Provinsi,Nasional,Internasional'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_selesai' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'jumlah_jam' => ['nullable', 'integer', 'min:1'],
            'peran' => ['nullable', 'in:peserta,narasumber,panitia,moderator'],
            'no_sertifikat' => ['nullable', 'string', 'max:100'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'file_sertifikat' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_diklat.required' => 'Nama diklat/pelatihan wajib diisi.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ];
    }
}