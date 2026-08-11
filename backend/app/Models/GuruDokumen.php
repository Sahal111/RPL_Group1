<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class GuruDokumen extends Model
{
    use SoftDeletes;

    protected $table = 'guru_dokumens';

    // ── Status Enum Constants ──
    const STATUS_BELUM_UPLOAD = 'belum_upload';
    const STATUS_MENUNGGU_REVIEW = 'menunggu_review';
    const STATUS_DISETUJUI = 'disetujui';
    const STATUS_DITOLAK = 'ditolak';
    const STATUS_PERLU_REVISI = 'perlu_revisi';
    const STATUS_KADALUARSA = 'kadaluarsa';

    const STATUSES = [
        self::STATUS_BELUM_UPLOAD,
        self::STATUS_MENUNGGU_REVIEW,
        self::STATUS_DISETUJUI,
        self::STATUS_DITOLAK,
        self::STATUS_PERLU_REVISI,
        self::STATUS_KADALUARSA,
    ];

    // ── Kategori Enum Constants ──
    const KATEGORI_IDENTITAS = 'identitas';
    const KATEGORI_PENDIDIKAN = 'pendidikan';
    const KATEGORI_KEPEGAWAIAN = 'kepegawaian';
    const KATEGORI_SERTIFIKASI = 'sertifikasi';
    const KATEGORI_ADMINISTRASI = 'administrasi';
    const KATEGORI_LAINNYA = 'lainnya';

    // ── Jenis Dokumen per Kategori (untuk slot wajib) ──
    const JENIS_WAJIB = [
        self::KATEGORI_IDENTITAS => [
            'ktp' => 'KTP',
            'kk' => 'Kartu Keluarga',
            'npwp' => 'NPWP',
            'pas_foto' => 'Pas Foto',
            'karpeg' => 'KARPEG',
            'bpjs_kesehatan' => 'BPJS Kesehatan',
        ],
        self::KATEGORI_PENDIDIKAN => [
            'ijazah_s1' => 'Ijazah S1',
            'transkrip_s1' => 'Transkrip S1',
            'ijazah_s2' => 'Ijazah S2',
        ],
        self::KATEGORI_KEPEGAWAIAN => [
            'sk_pengangkatan' => 'SK Pengangkatan',
            'sk_cpns' => 'SK CPNS',
            'sk_pns' => 'SK PNS',
            'sk_berkala' => 'SK Berkala',
        ],
        self::KATEGORI_SERTIFIKASI => [
            'sertifikat_ppg' => 'Sertifikat PPG',
        ],
        self::KATEGORI_ADMINISTRASI => [
            'pakta_integritas' => 'Pakta Integritas',
        ],
    ];

    protected $fillable = [
        'guru_id',
        'kategori',
        'jenis_dokumen',
        'nama_dokumen',
        'nomor_dokumen',
        'tanggal_dokumen',
        'tanggal_berlaku',
        'tanggal_kadaluarsa',
        'penerbit',
        'keterangan',
        'file_path',
        'file_type',
        'file_size',
        'file_hash',
        'original_filename',
        'versi',
        'status',
        'is_verified',       // backward compat — jangan hapus dulu
        'uploaded_by',
        'verified_by',
        'verified_at',
        'rejection_reason',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'tanggal_dokumen' => 'date',
        'tanggal_berlaku' => 'date',
        'tanggal_kadaluarsa' => 'date',
        'verified_at' => 'datetime',
        'file_size' => 'integer',
        'versi' => 'integer',
    ];

    // ── Appended Accessors ──
    protected $appends = ['is_expired', 'is_near_expiry'];

    public function getIsExpiredAttribute(): bool
    {
        return $this->tanggal_kadaluarsa
            && $this->tanggal_kadaluarsa->isPast();
    }

    public function getIsNearExpiryAttribute(): bool
    {
        if (!$this->tanggal_kadaluarsa)
            return false;
        return $this->tanggal_kadaluarsa->isFuture()
            && $this->tanggal_kadaluarsa->diffInDays(now()) <= 90;
    }

    // ⚠️  file_url accessor sengaja dihapus — dokumen disimpan di private disk.
    // Download hanya boleh melalui endpoint authenticated: GET /guru/{nuptk}/dokumen/{id}/download

    // ── Scopes ──
    public function scopeByKategori($query, string $kategori)
    {
        return $query->where('kategori', $kategori);
    }

    public function scopeExpired($query)
    {
        return $query->where('tanggal_kadaluarsa', '<', now());
    }

    public function scopeNearExpiry($query, int $days = 90)
    {
        return $query->whereBetween('tanggal_kadaluarsa', [now(), now()->addDays($days)]);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [
            self::STATUS_DITOLAK,
            self::STATUS_KADALUARSA,
        ]);
    }

    // ── Relationships ──
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function versions()
    {
        return $this->hasMany(GuruDokumenVersion::class, 'guru_dokumen_id')
            ->orderByDesc('versi');
    }

    public function logs()
    {
        return $this->hasMany(GuruDokumenLog::class, 'guru_dokumen_id')
            ->orderByDesc('created_at');
    }
}