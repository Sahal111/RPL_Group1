<?php

namespace App\Http\Requests\Guru;

use Illuminate\Foundation\Http\FormRequest;

class StoreJabatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis_jabatan' => ['required', 'in:Struktural,Fungsional,Tambahan'],
            'jenis_pengangkatan' => ['nullable', 'in:Pengangkatan Baru,Promosi,Mutasi,Rotasi,Perpanjangan,Pelaksana Tugas (Plt)'],
            'jabatan' => ['required', 'string', 'max:100'],
            'unit_kerja' => ['nullable', 'string', 'max:150'],
            'instansi_pengangkat' => ['nullable', 'string', 'max:150'],
            'golongan' => ['nullable', 'string', 'max:10'],
            'pangkat' => ['nullable', 'string', 'max:60'],
            'status_kepegawaian' => ['nullable', 'in:CPNS,PNS,PPPK,GTY,GTT,Honorer,Kontrak'],
            'no_sk' => ['nullable', 'string', 'max:80'],
            'tanggal_sk' => ['nullable', 'date'],
            'pejabat_penandatangan' => ['nullable', 'string', 'max:100'],
            'tmt_jabatan' => ['nullable', 'date'],
            'tanggal_selesai' => ['nullable', 'date', 'after_or_equal:tmt_jabatan'],
            'masa_berlaku' => ['nullable', 'date'],
            'alasan_berakhir' => ['nullable', 'in:Mutasi,Promosi,Habis Masa Jabatan,Mengundurkan Diri,Pensiun,Lainnya'],
            'status_jabatan' => ['nullable', 'in:Aktif,Berakhir,Nonaktif,Mutasi,Pensiun'],
            'uraian_tugas' => ['nullable', 'string', 'max:500'],
            'is_current' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'jenis_jabatan.required' => 'Jenis jabatan wajib dipilih.',
            'jenis_jabatan.in' => 'Jenis jabatan tidak valid.',
            'jabatan.required' => 'Nama jabatan wajib diisi.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah TMT jabatan.',
        ];
    }
}