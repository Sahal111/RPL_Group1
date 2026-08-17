<?php

namespace App\Policies;

use App\Models\Kelas;
use App\Models\User;

class KelasPolicy
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

    public function view(User $user, Kelas $kelas): bool
    {
        return $this->sameSchool($user, $kelas);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('operator');
    }

    public function update(User $user, Kelas $kelas): bool
    {
        return $this->sameSchool($user, $kelas) && $user->hasRole('operator');
    }

    public function delete(User $user, Kelas $kelas): bool
    {
        return $this->sameSchool($user, $kelas) && $user->hasRole('operator');
    }

    public function manageSiswa(User $user, Kelas $kelas): bool
    {
        return $this->sameSchool($user, $kelas) && $user->hasRole('operator');
    }

    private function sameSchool(User $user, Kelas $kelas): bool
    {
        return (int) $user->school_id === (int) $kelas->school_id;
    }
}
