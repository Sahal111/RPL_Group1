<?php

namespace App\Policies;

use App\Models\Siswa;
use App\Models\User;

class SiswaPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('operator')) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole('operator')
            || $user->hasRole('kepsek')
            || $user->hasRole('wali_kelas');
    }

    public function view(User $user, Siswa $siswa): bool
    {
        return $this->sameSchool($user, $siswa)
            && ($user->hasRole('operator') || $user->hasRole('kepsek') || $user->hasRole('wali_kelas'));
    }

    public function create(User $user): bool
    {
        return $user->hasRole('operator');
    }

    public function update(User $user, Siswa $siswa): bool
    {
        return $this->sameSchool($user, $siswa) && $user->hasRole('operator');
    }

    public function delete(User $user, Siswa $siswa): bool
    {
        return $this->sameSchool($user, $siswa) && $user->hasRole('operator');
    }

    public function assignKelas(User $user, Siswa $siswa): bool
    {
        return $this->sameSchool($user, $siswa) && $user->hasRole('operator');
    }

    private function sameSchool(User $user, Siswa $siswa): bool
    {
        return (int) $user->school_id === (int) $siswa->school_id;
    }
}
