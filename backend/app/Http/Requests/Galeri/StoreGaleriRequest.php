<?php

namespace App\Http\Requests\Galeri;

use Illuminate\Foundation\Http\FormRequest;

class StoreGaleriRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'foto'      => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'judul'     => 'required|string|max:150',
            'deskripsi' => 'nullable|string|max:500',
            'kategori'  => 'required|in:kegiatan,prestasi,ekstrakurikuler,fasilitas,acara',
        ];
    }

    public function messages(): array
    {
        return [
            'foto.required'  => 'Foto wajib diupload.',
            'foto.image'     => 'File harus berupa gambar.',
            'foto.max'       => 'Ukuran foto maksimal 2MB.',
            'judul.required' => 'Judul galeri wajib diisi.',
            'kategori.in'    => 'Kategori tidak valid.',
        ];
    }
}
