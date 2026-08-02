<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 560px;
            margin: 40px auto;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .header {
            background: #16a34a;
            padding: 24px 32px;
        }

        .header h1 {
            color: #fff;
            margin: 0;
            font-size: 18px;
        }

        .header p {
            color: #bbf7d0;
            margin: 4px 0 0;
            font-size: 13px;
        }

        .body {
            padding: 32px;
            color: #374151;
        }

        .body p {
            line-height: 1.7;
            margin: 0 0 16px;
        }

        .highlight {
            background: #fef9c3;
            border-left: 4px solid #eab308;
            padding: 12px 16px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .highlight strong {
            color: #92400e;
        }

        .badge {
            display: inline-block;
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 13px;
            font-weight: bold;
        }

        .footer {
            background: #f9fafb;
            padding: 16px 32px;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Reminder Kadaluarsa Dokumen</h1>
            <p>SIAKAD MI Nurul Huda 3</p>
        </div>
        <div class="body">
            <p>Yth. <strong>{{ $namaGuru }}</strong>,</p>
            <p>Kami ingin menginformasikan bahwa dokumen berikut akan segera kadaluarsa:</p>

            <div class="highlight">
                <strong>📄 {{ $namaDokumen }}</strong><br>
                Kadaluarsa pada: <strong>{{ $tanggalKadaluarsa }}</strong><br>
                <span class="badge">{{ $hariSebelum }} hari lagi</span>
            </div>

            <p>Harap segera memperbarui dokumen tersebut dengan menghubungi operator atau mengupload dokumen terbaru
                melalui SIAKAD.</p>
            <p>Terima kasih atas perhatiannya.</p>
            <p>Salam,<br><strong>Tim SIAKAD MI Nurul Huda 3</strong></p>
        </div>
        <div class="footer">
            Email ini dikirim otomatis oleh sistem. Mohon tidak membalas email ini.
        </div>
    </div>
</body>

</html>