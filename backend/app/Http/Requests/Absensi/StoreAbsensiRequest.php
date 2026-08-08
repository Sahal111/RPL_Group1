<?php

namespace App\Http\Requests\Absensi;

use Illuminate\Foundation\Http\FormRequest;

class StoreAbsensiRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'kelas_id'             => 'required|integer|exists:kelas,id',
            'jadwal_id'            => 'nullable|integer|exists:jadwals,id',
            'tanggal'              => 'required|date|before_or_equal:today',
            'absensi'              => 'required|array|min:1',
            'absensi.*.siswa_id'   => 'required|integer|exists:siswas,id',
            'absensi.*.status'     => 'required|in:Hadir,Sakit,Izin,Alpa',
            'absensi.*.keterangan' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'kelas_id.required'           => 'Kelas wajib dipilih.',
            'tanggal.required'            => 'Tanggal absensi wajib diisi.',
            'tanggal.before_or_equal'     => 'Tanggal absensi tidak boleh melebihi hari ini.',
            'absensi.required'            => 'Data absensi wajib diisi.',
            'absensi.*.siswa_id.required' => 'ID siswa wajib ada.',
            'absensi.*.status.required'   => 'Status absensi wajib diisi.',
            'absensi.*.status.in'         => 'Status harus Hadir, Sakit, Izin, atau Alpa.',
        ];
    }
}
