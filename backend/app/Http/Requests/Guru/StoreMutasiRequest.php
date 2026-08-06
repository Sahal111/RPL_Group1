<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreMutasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis_mutasi' => ['required', 'in:Masuk,Keluar,Internal,Penugasan Sementara,Kembali Bertugas'],
            'jenis_keluar' => ['nullable', 'in:Pindah Sekolah,Mengundurkan Diri,Pensiun,Kontrak Berakhir,Meninggal Dunia,PHK,Lainnya'],
            'tanggal_mutasi' => ['required', 'date'],
            'sekolah_asal' => ['nullable', 'string', 'max:200'],
            'npsn_asal' => ['nullable', 'string', 'max:10'],
            'sekolah_tujuan' => ['nullable', 'string', 'max:200'],
            'npsn_tujuan' => ['nullable', 'string', 'max:10'],
            'tmt_mutasi' => ['nullable', 'date'],
            'jabatan_sebelum' => ['nullable', 'string', 'max:100'],
            'jabatan_sesudah' => ['nullable', 'string', 'max:100'],
            'status_kepegawaian' => ['nullable', 'in:PNS,PPPK,GTY,GTT'],
            'no_sk' => ['nullable', 'string', 'max:80'],
            'tanggal_sk' => ['nullable', 'date'],
            'instansi_penerbit_sk' => ['nullable', 'string', 'max:200'],
            'alasan_mutasi' => ['nullable', 'string', 'max:200'],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'file_sk' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'tanggal_berakhir' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'jenis_mutasi.required' => 'Jenis mutasi wajib dipilih.',
            'jenis_mutasi.in' => 'Jenis mutasi tidak valid.',
            'tanggal_mutasi.required' => 'Tanggal mutasi wajib diisi.',
        ];
    }
}