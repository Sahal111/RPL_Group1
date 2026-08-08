<?php

namespace App\Http\Controllers\MasterData\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StorePendidikanRequest;
use App\Http\Requests\Guru\StoreSertifikasiRequest;
use App\Http\Requests\Guru\StoreInpassingRequest;
use App\Http\Requests\Guru\StoreJabatanRequest;
use App\Models\Guru;
use Illuminate\Support\Facades\Storage;

class GuruKepegawaianController extends Controller
{
    // ────────────────────────────────────────
    // SECTION: PENDIDIKAN
    // ────────────────────────────────────────

    public function getPendidikan($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        return $this->success($guru->pendidikans);
    }

    public function storePendidikan(StorePendidikanRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'jenjang' => 'required|in:SD,SMP,SMA/SMK,D1,D2,D3,D4,S1,S2,S3',
            'nama_sekolah' => 'required|string|max:200',
            'jurusan' => 'nullable|string|max:100',
            'prodi' => 'nullable|string|max:100',
            'tahun_masuk' => 'nullable|integer|min:1950|max:' . date('Y'),
            'tahun_lulus' => 'nullable|integer|min:1950|max:' . (date('Y') + 1),
            'no_ijazah' => 'nullable|string|max:80',
            'file_ijazah' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['jenjang', 'nama_sekolah', 'jurusan', 'prodi', 'tahun_masuk', 'tahun_lulus', 'no_ijazah']);

        if ($request->hasFile('file_ijazah')) {
            $data['file_ijazah'] = $request->file('file_ijazah')
                ->store("guru-dokumen/{$guru->id}/ijazah", 'public');
        }

        $pendidikan = $guru->pendidikans()->create($data);

        return $this->created($pendidikan, 'Riwayat pendidikan ditambahkan.');
    }

    public function updatePendidikan(StorePendidikanRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $pendidikan = $guru->pendidikans()->findOrFail($id);

        $request->validate([
            'jenjang' => 'required|in:SD,SMP,SMA/SMK,D1,D2,D3,D4,S1,S2,S3',
            'nama_sekolah' => 'required|string|max:200',
            'jurusan' => 'nullable|string|max:100',
            'prodi' => 'nullable|string|max:100',
            'tahun_masuk' => 'nullable|integer|min:1950|max:' . date('Y'),
            'tahun_lulus' => 'nullable|integer|min:1950|max:' . (date('Y') + 1),
            'no_ijazah' => 'nullable|string|max:80',
            'file_ijazah' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['jenjang', 'nama_sekolah', 'jurusan', 'prodi', 'tahun_masuk', 'tahun_lulus', 'no_ijazah']);

        if ($request->hasFile('file_ijazah')) {
            if ($pendidikan->file_ijazah) {
                Storage::disk('public')->delete($pendidikan->file_ijazah);
            }
            $data['file_ijazah'] = $request->file('file_ijazah')
                ->store("guru-dokumen/{$guru->id}/ijazah", 'public');
        }

        $pendidikan->update($data);

        return $this->success($pendidikan, 'Riwayat pendidikan diperbarui.');
    }

    public function destroyPendidikan($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $pendidikan = $guru->pendidikans()->findOrFail($id);

        if ($pendidikan->file_ijazah) {
            Storage::disk('public')->delete($pendidikan->file_ijazah);
        }

        $pendidikan->delete();

        return $this->success(message: 'Riwayat pendidikan dihapus.');
    }

    // ────────────────────────────────────────
    // SECTION: SERTIFIKASI
    // ────────────────────────────────────────

    public function getSertifikasi($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        return $this->success($guru->sertifikasis);
    }

    public function storeSertifikasi(StoreSertifikasiRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'jenis_sertifikasi' => 'required|string|max:100',
            'no_sertifikat' => 'nullable|string|max:80',
            'nrg' => 'nullable|string|max:20',
            'tahun_sertifikasi' => 'nullable|integer|min:1990|max:' . date('Y'),
            'lptk' => 'nullable|string|max:200',
            'bidang_studi' => 'nullable|string|max:100',
            'tanggal_terbit' => 'nullable|date',
            'expired_at' => 'nullable|date|after:tanggal_terbit',
            'file_sertifikat' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['jenis_sertifikasi', 'no_sertifikat', 'nrg', 'tahun_sertifikasi', 'lptk', 'bidang_studi', 'tanggal_terbit', 'expired_at']);

        if ($request->hasFile('file_sertifikat')) {
            $data['file_sertifikat'] = $request->file('file_sertifikat')
                ->store("guru-dokumen/{$guru->id}/sertifikasi", 'public');
        }

        $sert = $guru->sertifikasis()->create($data);

        return $this->created($sert, 'Sertifikasi ditambahkan.');
    }

    public function updateSertifikasi(StoreSertifikasiRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $sert = $guru->sertifikasis()->findOrFail($id);

        $request->validate([
            'jenis_sertifikasi' => 'required|string|max:100',
            'no_sertifikat' => 'nullable|string|max:80',
            'nrg' => 'nullable|string|max:20',
            'tahun_sertifikasi' => 'nullable|integer|min:1990|max:' . date('Y'),
            'lptk' => 'nullable|string|max:200',
            'bidang_studi' => 'nullable|string|max:100',
            'tanggal_terbit' => 'nullable|date',
            'expired_at' => 'nullable|date|after:tanggal_terbit',
            'file_sertifikat' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['jenis_sertifikasi', 'no_sertifikat', 'nrg', 'tahun_sertifikasi', 'lptk', 'bidang_studi', 'tanggal_terbit', 'expired_at']);

        if ($request->hasFile('file_sertifikat')) {
            if ($sert->file_sertifikat) {
                Storage::disk('public')->delete($sert->file_sertifikat);
            }
            $data['file_sertifikat'] = $request->file('file_sertifikat')
                ->store("guru-dokumen/{$guru->id}/sertifikasi", 'public');
        }

        $sert->update($data);

        return $this->success($sert, 'Sertifikasi diperbarui.');
    }

    public function destroySertifikasi($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $sert = $guru->sertifikasis()->findOrFail($id);

        if ($sert->file_sertifikat) {
            Storage::disk('public')->delete($sert->file_sertifikat);
        }

        $sert->delete();

        return $this->success(message: 'Sertifikasi dihapus.');
    }

    // ────────────────────────────────────────
    // SECTION: INPASSING
    // ────────────────────────────────────────

    public function getInpassing($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        return $this->success($guru->inpassings);
    }

    public function storeInpassing(StoreInpassingRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'no_sk' => 'required|string|max:100',
            'tanggal_sk' => 'required|date',
            'tmt_inpassing' => 'required|date',
            'golongan_sesudah' => 'nullable|string|max:10',
            'jabatan_fungsional' => 'nullable|string|max:100',
            'angka_kredit' => 'nullable|numeric|min:0',
            'file_sk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['no_sk', 'tanggal_sk', 'tmt_inpassing', 'golongan_sesudah', 'jabatan_fungsional', 'angka_kredit']);

        if ($request->hasFile('file_sk')) {
            $data['file_sk'] = $request->file('file_sk')
                ->store("guru-dokumen/{$guru->id}/inpassing", 'public');
        }

        $inpassing = $guru->inpassings()->create($data);

        return $this->created($inpassing, 'Data inpassing ditambahkan.');
    }

    public function updateInpassing(StoreInpassingRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $inpassing = $guru->inpassings()->findOrFail($id);

        $request->validate([
            'no_sk' => 'required|string|max:100',
            'tanggal_sk' => 'required|date',
            'tmt_inpassing' => 'required|date',
            'golongan_sesudah' => 'nullable|string|max:10',
            'jabatan_fungsional' => 'nullable|string|max:100',
            'angka_kredit' => 'nullable|numeric|min:0',
            'file_sk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['no_sk', 'tanggal_sk', 'tmt_inpassing', 'golongan_sesudah', 'jabatan_fungsional', 'angka_kredit']);

        if ($request->hasFile('file_sk')) {
            if ($inpassing->file_sk) {
                Storage::disk('public')->delete($inpassing->file_sk);
            }
            $data['file_sk'] = $request->file('file_sk')
                ->store("guru-dokumen/{$guru->id}/inpassing", 'public');
        }

        $inpassing->update($data);

        return $this->success($inpassing, 'Data inpassing diperbarui.');
    }

    public function destroyInpassing($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $inpassing = $guru->inpassings()->findOrFail($id);

        if ($inpassing->file_sk) {
            Storage::disk('public')->delete($inpassing->file_sk);
        }

        $inpassing->delete();

        return $this->success(message: 'Data inpassing dihapus.');
    }

    // ────────────────────────────────────────
    // SECTION: JABATAN
    // ────────────────────────────────────────

    private array $jabatanFields = [
        'jenis_jabatan',
        'jenis_pengangkatan',
        'jabatan',
        'unit_kerja',
        'instansi_pengangkat',
        'golongan',
        'pangkat',
        'status_kepegawaian',
        'no_sk',
        'tanggal_sk',
        'pejabat_penandatangan',
        'tmt_jabatan',
        'tanggal_selesai',
        'masa_berlaku',
        'alasan_berakhir',
        'status_jabatan',
        'uraian_tugas',
        'is_current',
    ];

    private array $jabatanRules = [
        'jenis_jabatan' => 'required|in:Struktural,Fungsional,Tambahan',
        'jenis_pengangkatan' => 'nullable|in:Pengangkatan Baru,Promosi,Mutasi,Rotasi,Perpanjangan,Pelaksana Tugas (Plt)',
        'jabatan' => 'required|string|max:100',
        'unit_kerja' => 'nullable|string|max:150',
        'instansi_pengangkat' => 'nullable|string|max:150',
        'golongan' => 'nullable|string|max:10',
        'pangkat' => 'nullable|string|max:60',
        'status_kepegawaian' => 'nullable|in:CPNS,PNS,PPPK,GTY,GTT,Honorer,Kontrak',
        'no_sk' => 'nullable|string|max:80',
        'tanggal_sk' => 'nullable|date',
        'pejabat_penandatangan' => 'nullable|string|max:100',
        'tmt_jabatan' => 'nullable|date',
        'tanggal_selesai' => 'nullable|date|after_or_equal:tmt_jabatan',
        'masa_berlaku' => 'nullable|date',
        'alasan_berakhir' => 'nullable|in:Mutasi,Promosi,Habis Masa Jabatan,Mengundurkan Diri,Pensiun,Lainnya',
        'status_jabatan' => 'nullable|in:Aktif,Berakhir,Nonaktif,Mutasi,Pensiun',
        'uraian_tugas' => 'nullable|string|max:500',
        'is_current' => 'boolean',
    ];

    public function getJabatan($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        return $this->success($guru->jabatans);
    }

    public function storeJabatan(StoreJabatanRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $request->validate($this->jabatanRules);

        $data = $request->only($this->jabatanFields);
        $data['created_by'] = auth()->id();
        $data['updated_by'] = auth()->id();

        if (!empty($data['is_current'])) {
            $guru->jabatans()->update(['is_current' => false]);
        }

        $jabatan = $guru->jabatans()->create($data);

        return $this->created($jabatan, 'Riwayat jabatan ditambahkan.');
    }

    public function updateJabatan(StoreJabatanRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $jabatan = $guru->jabatans()->findOrFail($id);
        $request->validate($this->jabatanRules);

        $data = $request->only($this->jabatanFields);
        $data['updated_by'] = auth()->id();

        if (!empty($data['is_current'])) {
            $guru->jabatans()->where('id', '!=', $id)->update(['is_current' => false]);
        }

        $jabatan->update($data);

        return $this->success($jabatan, 'Riwayat jabatan diperbarui.');
    }

    public function destroyJabatan($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $guru->jabatans()->findOrFail($id)->delete();

        return $this->success(message: 'Riwayat jabatan dihapus.');
    }
}