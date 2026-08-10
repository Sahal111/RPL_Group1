<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PasswordResetNotification extends Notification
{
    use Queueable;

    public function __construct(
        private string $token,
        private string $namaSekolah = 'SIAKAD'
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = config('app.frontend_url', config('app.url'))
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Reset Password — ' . $this->namaSekolah)
            ->greeting('Halo, ' . $notifiable->name . '!')
            ->line('Kami menerima permintaan reset password untuk akun kamu.')
            ->action('Reset Password', $resetUrl)
            ->line('Link ini akan kadaluarsa dalam **60 menit**.')
            ->line('Jika kamu tidak meminta reset password, abaikan email ini. Password kamu tidak akan berubah.')
            ->salutation('Salam, Tim ' . $this->namaSekolah);
    }
}