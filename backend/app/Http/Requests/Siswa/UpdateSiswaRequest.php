<?php

namespace App\Http\Requests\Siswa;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Siswa di-resolve via route parameter {nisn} sebelum validasi dipanggil.
        $siswaId = optional($this->route('siswa'))->id
            ?? \App\Models\Siswa::where('nisn', $this->route('nisn'))->value('id');

        return [
            'nik' => 'nullable|string|size:16|unique:siswas,nik,' . $siswaId,
            'nis' => 'nullable|string|max:20|unique:siswas,nis,' . $siswaId,
            'no_kk' => 'nullable|string|size:16',
            'nama' => 'required|string|max:150',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'required|string|max:100',
            'tanggal_lahir' => 'required|date|before:today',
            'agama' => 'required|in:Islam,Kristen Protestan,Kristen Katolik,Hindu,Buddha,Konghucu,Lainnya',
            'golongan_darah' => 'nullable|in:A,B,AB,O,-',
            'kewarganegaraan' => 'required|in:WNI,WNA',
            'nama_ibu_kandung' => 'required|string|max:150',
            'nama_kepala_keluarga' => 'nullable|string|max:150',
            'anak_ke' => 'nullable|integer|min:1',
            'jumlah_saudara' => 'nullable|integer|min:0',
            'status_dalam_keluarga' => 'required|in:Kandung,Tiri,Angkat',
            'pembiaya_sekolah' => 'nullable|in:Orang Tua,Sendiri,Pemerintah,Lembaga,Lainnya',
            'kebutuhan_khusus' => 'nullable|string|max:100',
            'riwayat_penyakit' => 'nullable|string',
            'imunisasi' => 'nullable|in:Lengkap,Tidak Lengkap,Tidak Diketahui',
            'alamat_jalan' => 'required|string|max:255',
            'rt' => 'nullable|string|max:4',
            'rw' => 'nullable|string|max:4',
            'desa_kelurahan' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kota_kabupaten' => 'nullable|string|max:100',
            'provinsi' => 'nullable|string|max:100',
            'kode_pos' => 'nullable|string|max:10',
            'jarak_tempat_tinggal' => 'nullable|numeric|min:0',
            'waktu_tempuh' => 'nullable|integer|min:0',
            'moda_transportasi' => 'nullable|string|max:50',
            'asal_sekolah' => 'nullable|string|max:200',
            'tanggal_masuk' => 'required|date',
            'tingkat' => 'nullable|integer|min:1|max:6',
            'status' => 'required|in:aktif,nonaktif,mutasi_keluar,lulus,meninggal',
            'orang_tua_id' => 'nullable|integer|exists:orang_tuas,id',
            'unlink_orang_tua' => 'nullable|boolean',
            ...$this->orangTuaRules(),
        ];
    }

    private function orangTuaRules(): array
    {
        $penghasilan = 'Tidak Berpenghasilan,< 500rb,500rb - 1jt,1jt - 2jt,2jt - 3jt,3jt - 5jt,> 5jt';
        $pendidikan = 'Tidak Sekolah,SD,SMP,SMA,D1,D2,D3,S1,S2,S3';
        $yearRule = 'nullable|integer|min:1900|max:' . now()->year;

        return [
            'orang_tuas' => 'nullable|array',
            'orang_tua.nama_ayah' => 'nullable|string|max:100',
            'orang_tua.nik_ayah' => 'nullable|string|max:16',
            'orang_tua.tahun_lahir_ayah' => $yearRule,
            'orang_tua.pendidikan_ayah' => "nullable|in:{$pendidikan}",
            'orang_tua.pekerjaan_ayah' => 'nullable|string|max:100',
            'orang_tua.penghasilan_ayah' => "nullable|in:{$penghasilan}",
            'orang_tua.nama_ibu' => 'nullable|string|max:100',
            'orang_tua.nik_ibu' => 'nullable|string|max:16',
            'orang_tua.tahun_lahir_ibu' => $yearRule,
            'orang_tua.pendidikan_ibu' => "nullable|in:{$pendidikan}",
            'orang_tua.pekerjaan_ibu' => 'nullable|string|max:100',
            'orang_tua.penghasilan_ibu' => "nullable|in:{$penghasilan}",
            'orang_tua.nama_wali' => 'nullable|string|max:100',
            'orang_tua.nik_wali' => 'nullable|string|max:16',
            'orang_tua.hubungan_wali' => 'nullable|string|max:50',
            'orang_tua.pekerjaan_wali' => 'nullable|string|max:100',
            'orang_tua.penghasilan_wali' => "nullable|in:{$penghasilan}",
            'orang_tua.no_hp_ayah' => 'nullable|string|max:20',
            'orang_tua.no_hp_ibu' => 'nullable|string|max:20',
            'orang_tua.no_hp_wali' => 'nullable|string|max:20',
            'orang_tua.email' => 'nullable|email|max:100',
            'orang_tua.alamat' => 'nullable|string',
        ];
    }
}