<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Notifications\PasswordResetNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Kirim link reset password ke email user.
     *
     * Response selalu sukses (prevent email enumeration attack):
     * kita tidak memberitahu apakah email terdaftar atau tidak.
     */
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        // Selalu return 200 walaupun email tidak ditemukan (anti-enumeration)
        if (!$user) {
            return response()->json([
                'success' => true,
                'message' => 'Jika email terdaftar, link reset password akan dikirim dalam beberapa menit.',
            ]);
        }

        // Hapus token lama untuk email ini
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Buat token baru
        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Kirim notifikasi email
        $namaSekolah = $this->getNamaSekolah($user);
        $user->notify(new PasswordResetNotification($token, $namaSekolah));

        return response()->json([
            'success' => true,
            'message' => 'Jika email terdaftar, link reset password akan dikirim dalam beberapa menit.',
        ]);
    }

    /**
     * Reset password menggunakan token dari email.
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        // Cari token di database
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid atau sudah kadaluarsa.',
            ], 422);
        }

        // Cek apakah token sudah kadaluarsa (60 menit)
        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->diffInMinutes(now()) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'success' => false,
                'message' => 'Link reset password sudah kadaluarsa. Silakan minta link baru.',
            ], 422);
        }

        // Verifikasi token
        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid atau sudah kadaluarsa.',
            ], 422);
        }

        // Update password user
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak ditemukan.',
            ], 404);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Hapus semua token Sanctum lama (paksa logout semua device)
        $user->tokens()->delete();

        // Hapus token reset
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset. Silakan login dengan password baru.',
        ]);
    }

    /**
     * Cek apakah token valid (opsional — untuk UX frontend).
     */
    public function verifyToken(string $token, string $email)
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$record) {
            return response()->json(['valid' => false, 'message' => 'Token tidak ditemukan.']);
        }

        $expired = \Carbon\Carbon::parse($record->created_at)->diffInMinutes(now()) > 60;

        if ($expired) {
            return response()->json(['valid' => false, 'message' => 'Token sudah kadaluarsa.']);
        }

        if (!Hash::check($token, $record->token)) {
            return response()->json(['valid' => false, 'message' => 'Token tidak valid.']);
        }

        return response()->json(['valid' => true, 'message' => 'Token valid.']);
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