<?php

namespace App\Http\Controllers\MasterData\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StoreDiklatRequest;
use App\Http\Requests\Guru\StoreInpassingRequest;
use App\Http\Requests\Guru\StoreJabatanRequest;
use App\Http\Requests\Guru\StorePendidikanRequest;
use App\Http\Requests\Guru\StorePkgRequest;
use App\Http\Requests\Guru\StoreSertifikasiRequest;
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
        $data = $request->only(['jenjang', 'nama_sekolah', 'jurusan', 'prodi', 'tahun_masuk', 'tahun_lulus', 'no_ijazah']);

        if ($request->hasFile('file_ijazah')) {
            $data['file_ijazah'] = $request->file('file_ijazah')
                ->store("guru-dokumen/{$guru->id}/ijazah", 'public');
        }

        return $this->created($guru->pendidikans()->create($data), 'Riwayat pendidikan ditambahkan.');
    }

    public function updatePendidikan(StorePendidikanRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $pendidikan = $guru->pendidikans()->findOrFail($id);
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
        $data = $request->only(['jenis_sertifikasi', 'no_sertifikat', 'nrg', 'tahun_sertifikasi', 'lptk', 'bidang_studi', 'tanggal_terbit', 'expired_at']);

        if ($request->hasFile('file_sertifikat')) {
            $data['file_sertifikat'] = $request->file('file_sertifikat')
                ->store("guru-dokumen/{$guru->id}/sertifikasi", 'public');
        }

        return $this->created($guru->sertifikasis()->create($data), 'Sertifikasi ditambahkan.');
    }

    public function updateSertifikasi(StoreSertifikasiRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $sert = $guru->sertifikasis()->findOrFail($id);
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
        $data = $request->only(['no_sk', 'tanggal_sk', 'tmt_inpassing', 'golongan_sesudah', 'jabatan_fungsional', 'angka_kredit']);

        if ($request->hasFile('file_sk')) {
            $data['file_sk'] = $request->file('file_sk')
                ->store("guru-dokumen/{$guru->id}/inpassing", 'public');
        }

        return $this->created($guru->inpassings()->create($data), 'Data inpassing ditambahkan.');
    }

    public function updateInpassing(StoreInpassingRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $inpassing = $guru->inpassings()->findOrFail($id);
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

    public function getJabatan($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return $this->success($guru->jabatans);
    }

    public function storeJabatan(StoreJabatanRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $data = $request->only($this->jabatanFields);
        $data['created_by'] = auth()->id();
        $data['updated_by'] = auth()->id();

        if (!empty($data['is_current'])) {
            $guru->jabatans()->update(['is_current' => false]);
        }

        return $this->created($guru->jabatans()->create($data), 'Riwayat jabatan ditambahkan.');
    }

    public function updateJabatan(StoreJabatanRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $jabatan = $guru->jabatans()->findOrFail($id);
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

    // ── DIKLAT / PELATIHAN ────────────────────────────────────────────────────

    public function getDiklat($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return $this->success($guru->diklats);
    }

    public function storeDiklat(StoreDiklatRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $data = $request->only(['nama_diklat', 'penyelenggara', 'jenis', 'tingkat', 'tanggal_mulai', 'tanggal_selesai', 'jumlah_jam', 'peran', 'no_sertifikat', 'keterangan']);

        if ($request->hasFile('file_sertifikat')) {
            $data['file_sertifikat'] = $request->file('file_sertifikat')
                ->store("guru-dokumen/{$guru->id}/diklat", 'public');
        }

        return $this->created($guru->diklats()->create($data), 'Riwayat pelatihan ditambahkan.');
    }

    public function updateDiklat(StoreDiklatRequest $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $diklat = $guru->diklats()->findOrFail($id);
        $data = $request->only(['nama_diklat', 'penyelenggara', 'jenis', 'tingkat', 'tanggal_mulai', 'tanggal_selesai', 'jumlah_jam', 'peran', 'no_sertifikat', 'keterangan']);

        if ($request->hasFile('file_sertifikat')) {
            if ($diklat->file_sertifikat) {
                Storage::disk('public')->delete($diklat->file_sertifikat);
            }
            $data['file_sertifikat'] = $request->file('file_sertifikat')
                ->store("guru-dokumen/{$guru->id}/diklat", 'public');
        }

        $diklat->update($data);
        return $this->success($diklat, 'Riwayat pelatihan diperbarui.');
    }

    public function destroyDiklat($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $diklat = $guru->diklats()->findOrFail($id);

        if ($diklat->file_sertifikat) {
            Storage::disk('public')->delete($diklat->file_sertifikat);
        }

        $diklat->delete();
        return $this->success(message: 'Riwayat pelatihan dihapus.');
    }

    // ── PKG (Penilaian Kinerja Guru) ──────────────────────────────────────────

    public function getPkg($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return $this->success(
            $guru->pkgs()->with(['tahunAjaran', 'semester', 'penilai:id,name'])->get()
        );
    }

    public function storePkg(StorePkgRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $pkg = $guru->pkgs()->updateOrCreate(
            ['tahun_ajaran_id' => $request->tahun_ajaran_id, 'semester_id' => $request->semester_id],
            [
                'nilai' => $request->nilai,
                'predikat' => $request->predikat,
                'catatan' => $request->catatan,
                'dinilai_oleh' => auth()->id(),
                'tanggal_penilaian' => $request->tanggal_penilaian ?? now(),
            ]
        );

        return $this->success($pkg, 'PKG berhasil disimpan.');
    }
}