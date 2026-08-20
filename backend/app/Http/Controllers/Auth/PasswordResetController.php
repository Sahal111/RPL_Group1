<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Notifications\PasswordResetNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Kirim link reset password ke email user.
     *
     * Response selalu 200 (prevent email enumeration attack).
     * Token di-scope per school_id — cross-tenant reset tidak mungkin.
     */
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $schoolId = $this->resolveSchoolId();

        // Anti-enumeration: hanya lookup jika school bisa di-resolve
        if ($schoolId) {
            $user = User::where('email', $request->email)
                ->where('school_id', $schoolId)
                ->first();

            if ($user) {
                // Hapus token lama untuk (school_id, email) ini
                DB::table('password_reset_tokens')
                    ->where('school_id', $schoolId)
                    ->where('email', $request->email)
                    ->delete();

                $token = Str::random(64);

                DB::table('password_reset_tokens')->insert([
                    'school_id' => $schoolId,
                    'email' => $request->email,
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]);

                $namaSekolah = $this->getNamaSekolah($user);
                $user->notify(new PasswordResetNotification($token, $namaSekolah));
            }
        }

        // Selalu return sukses — tidak bocorkan apakah email/school ada
        return response()->json([
            'success' => true,
            'message' => 'Jika email terdaftar, link reset password akan dikirim dalam beberapa menit.',
        ]);
    }

    /**
     * Reset password menggunakan token dari email.
     * Token hanya valid dalam scope school yang sama.
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        $schoolId = $this->resolveSchoolId();

        if (!$schoolId) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menentukan sekolah. Gunakan link reset yang dikirim ke email.',
            ], 422);
        }

        $record = DB::table('password_reset_tokens')
            ->where('school_id', $schoolId)
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid atau sudah kadaluarsa.',
            ], 422);
        }

        // Cek expiry (60 menit)
        if (Carbon::parse($record->created_at)->diffInMinutes(now()) > 60) {
            DB::table('password_reset_tokens')
                ->where('school_id', $schoolId)
                ->where('email', $request->email)
                ->delete();

            return response()->json([
                'success' => false,
                'message' => 'Link reset password sudah kadaluarsa. Silakan minta link baru.',
            ], 422);
        }

        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid atau sudah kadaluarsa.',
            ], 422);
        }

        $user = User::where('email', $request->email)
            ->where('school_id', $schoolId)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak ditemukan.',
            ], 404);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Paksa logout semua device
        $user->tokens()->delete();

        // Hapus token reset
        DB::table('password_reset_tokens')
            ->where('school_id', $schoolId)
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset. Silakan login dengan password baru.',
        ]);
    }

    /**
     * Verifikasi token sebelum tampil form reset (untuk UX frontend).
     */
    public function verifyToken(string $token, string $email)
    {
        $schoolId = $this->resolveSchoolId();

        if (!$schoolId) {
            return response()->json(['valid' => false, 'message' => 'Tidak dapat menentukan sekolah.']);
        }

        $record = DB::table('password_reset_tokens')
            ->where('school_id', $schoolId)
            ->where('email', $email)
            ->first();

        if (!$record) {
            return response()->json(['valid' => false, 'message' => 'Token tidak ditemukan.']);
        }

        if (Carbon::parse($record->created_at)->diffInMinutes(now()) > 60) {
            return response()->json(['valid' => false, 'message' => 'Token sudah kadaluarsa.']);
        }

        if (!Hash::check($token, $record->token)) {
            return response()->json(['valid' => false, 'message' => 'Token tidak valid.']);
        }

        return response()->json(['valid' => true, 'message' => 'Token valid.']);
    }

    /**
     * Resolve school_id dari context tenant saat ini.
     * TenantMiddleware sudah set ini via app('current_school_id').
     */
    private function resolveSchoolId(): ?int
    {
        if (app()->bound('current_school_id')) {
            return app('current_school_id');
        }
        return null;
    }

    private function getNamaSekolah(User $user): string
    {
        if ($user->school_id) {
            $school = DB::table('schools')->where('id', $user->school_id)->first();
            return $school?->nama ?? config('app.name', 'SIAKAD');
        }
        return config('app.name', 'SIAKAD');
    }
}