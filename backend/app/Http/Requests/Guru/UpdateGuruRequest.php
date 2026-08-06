<?php

namespace App\Http\Requests\Guru;

use App\Models\Guru;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGuruRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization ditangani middleware 'role:operator'
    }

    /**
     * Ambil instance guru dari route parameter {nuptk}
     * supaya unique rule bisa ignore ID guru yang sedang diedit.
     */
    private function getGuru(): ?Guru
    {
        return Guru::where('nuptk', $this->route('nuptk'))->first();
    }

    public function rules(): array
    {
        $guru = $this->getGuru();
        $guruId = $guru?->id;

        return [
            // ── Identitas ────────────────────────────────────
            // nuptk tidak bisa diubah via endpoint update utama
            // (ada endpoint khusus: PATCH /guru/{nuptk}/koreksi-nuptk)
            'nip' => ['nullable', 'string', 'max:18', Rule::unique('gurus', 'nip')->ignore($guruId)],
            'nip_lama' => ['nullable', 'string', 'max:9'],
            'no_karis_karsu' => ['nullable', 'string', 'max:20'],
            'nik' => ['nullable', 'string', 'max:16', Rule::unique('gurus', 'nik')->ignore($guruId)],
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
            'email' => ['nullable', 'email', 'max:100', Rule::unique('gurus', 'email')->ignore($guruId)],

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
            'status_keaktifan' => ['nullable', 'in:Aktif,Cuti,Pensiun,Mutasi,Keluar'],
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