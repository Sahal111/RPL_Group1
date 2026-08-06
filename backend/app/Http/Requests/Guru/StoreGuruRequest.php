<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuruRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization ditangani middleware 'role:operator'
    }

    public function rules(): array
    {
        return [
            // ── Identitas wajib ──────────────────────────────
            'nuptk' => ['required', 'string', 'max:16', 'unique:gurus,nuptk'],
            'nip' => ['nullable', 'string', 'max:18', 'unique:gurus,nip'],
            'nip_lama' => ['nullable', 'string', 'max:9'],
            'no_karis_karsu' => ['nullable', 'string', 'max:20'],
            'nik' => ['nullable', 'string', 'max:16', 'unique:gurus,nik'],
            'no_kk' => ['nullable', 'string', 'max:16'],
            'no_karpeg' => ['nullable', 'string', 'max:20'],
            'nama' => ['required', 'string', 'max:100'],
            'gelar_depan' => ['nullable', 'string', 'max:30'],
            'gelar_belakang' => ['nullable', 'string', 'max:50'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'tempat_lahir' => ['required', 'string', 'max:60'],
            'tanggal_lahir' => ['required', 'date'],
            'agama' => ['required', 'in:Islam,Kristen Protestan,Kristen Katolik,Hindu,Buddha,Konghucu,Lainnya'],
            'kewarganegaraan' => ['nullable', 'string', 'max:30'],
            'status_hidup' => ['nullable', 'in:Aktif,Meninggal'],
            'nama_ibu_kandung' => ['nullable', 'string', 'max:100'],
            'golongan_darah' => ['nullable', 'in:A,B,AB,O,A+,A-,B+,B-,AB+,AB-,O+,O-'],

            // ── Kontak ───────────────────────────────────────
            'no_hp' => ['required', 'string', 'max:20'],
            'no_wa' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:100', 'unique:gurus,email'],

            // ── Alamat ───────────────────────────────────────
            'alamat_jalan' => ['nullable', 'string', 'max:255'],
            'rt' => ['nullable', 'string', 'max:5'],
            'rw' => ['nullable', 'string', 'max:5'],
            'dusun' => ['nullable', 'string', 'max:100'],
            'desa_kelurahan' => ['nullable', 'string', 'max:60'],
            'kecamatan' => ['nullable', 'string', 'max:60'],
            'kota_kabupaten' => ['nullable', 'string', 'max:60'],
            'provinsi' => ['nullable', 'string', 'max:60'],
            'kode_pos' => ['nullable', 'string', 'max:10'],

            // ── Kepegawaian ──────────────────────────────────
            'jenis_ptk' => ['required', 'string', 'max:50'],
            'status_kepegawaian' => ['required', 'in:PNS,PPPK,GTY,GTT,Honorer,Lainnya'],
            'status_keaktifan' => ['nullable', 'in:Aktif,Pensiun,Mutasi,Keluar,Nonaktif'],
            'tanggal_bergabung' => ['nullable', 'date'],
            'tmt_pns' => ['nullable', 'date'],
            'tmt_gty' => ['nullable', 'date'],
            'no_sk_pengangkatan' => ['nullable', 'string', 'max:80'],
            'tgl_sk_pengangkatan' => ['nullable', 'date'],
            'instansi_pengangkat' => ['nullable', 'string', 'max:150'],
            'masa_kerja_tahun' => ['nullable', 'integer', 'min:0', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'nuptk.required' => 'NUPTK wajib diisi.',
            'nuptk.max' => 'NUPTK maksimal 16 karakter.',
            'nuptk.unique' => 'NUPTK ini sudah terdaftar di sistem.',
            'nip.unique' => 'NIP ini sudah terdaftar di sistem.',
            'nik.unique' => 'NIK ini sudah terdaftar di sistem.',
            'email.unique' => 'Email ini sudah terdaftar di sistem.',
            'nama.required' => 'Nama wajib diisi.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',
            'jenis_kelamin.in' => 'Jenis kelamin tidak valid.',
            'tempat_lahir.required' => 'Tempat lahir wajib diisi.',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',
            'tanggal_lahir.date' => 'Format tanggal lahir tidak valid.',
            'agama.required' => 'Agama wajib dipilih.',
            'agama.in' => 'Agama yang dipilih tidak valid.',
            'no_hp.required' => 'Nomor HP wajib diisi.',
            'jenis_ptk.required' => 'Jenis PTK wajib diisi.',
            'status_kepegawaian.required' => 'Status kepegawaian wajib dipilih.',
            'status_kepegawaian.in' => 'Status kepegawaian tidak valid.',
        ];
    }
}