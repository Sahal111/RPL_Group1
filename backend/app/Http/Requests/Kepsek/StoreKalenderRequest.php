<?php

namespace App\Http\Requests\Kepsek;

use Illuminate\Foundation\Http\FormRequest;

class StoreKalenderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'judul'           => 'required|string|max:255',
            'deskripsi'       => 'nullable|string',
            'jenis'           => 'required|in:jadwal_ujian,libur_nasional,libur_semester,kegiatan,rapat',
            'tanggal_mulai'   => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
        ];
    }

    public function messages(): array
    {
        return [
            'judul.required'           => 'Judul kegiatan wajib diisi.',
            'jenis.required'           => 'Jenis kegiatan wajib dipilih.',
            'jenis.in'                 => 'Jenis kegiatan tidak valid.',
            'tanggal_mulai.required'   => 'Tanggal mulai wajib diisi.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ];
    }
}
