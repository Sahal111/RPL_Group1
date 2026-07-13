<?php

namespace App\Models;

/**
 * SiswaKelas — alias backward-compatible untuk RiwayatKelas.
 * Controller lama yang masih reference SiswaKelas akan tetap bekerja.
 * Secara bertahap ganti ke RiwayatKelas::class.
 */
class SiswaKelas extends RiwayatKelas
{
    // Mewarisi semua dari RiwayatKelas (tabel: riwayat_kelas)
}