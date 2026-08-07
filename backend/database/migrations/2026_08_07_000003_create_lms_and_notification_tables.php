<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Modul LMS (Learning Management System) + Notification Dispatcher
 *
 * Tabel baru — semua punya school_id (operasional, per-tenant).
 *
 * Flow LMS:
 *   course_materials  → guru upload materi belajar per mapel per kelas
 *   assignments       → guru buat tugas/PR harian
 *   assignment_submissions → siswa kumpulkan tugas
 *   exams             → definisi ujian/kuis
 *   exam_questions    → soal per ujian
 *   exam_student_sessions → siswa mulai mengerjakan
 *   exam_answers      → jawaban siswa per soal
 *
 * Flow Notifikasi:
 *   notification_templates → template pesan per event (whatsapp, email, push)
 *   notification_logs      → log setiap pengiriman notifikasi
 */
return new class extends Migration {
    public function up(): void
    {
        // ── COURSE_MATERIALS ─────────────────────────────────────────
        Schema::create('course_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('mapel_id')
                ->comment('FK ke mapels.id')
                ->constrained('mapels')->cascadeOnDelete();
            $table->foreignId('kelas_id')->nullable()
                ->comment('NULL = berlaku semua kelas yang pakai mapel ini')
                ->constrained('kelas')->nullOnDelete();
            $table->foreignId('guru_id')
                ->comment('FK ke gurus.id — siapa yang upload')
                ->constrained('gurus')->cascadeOnDelete();
            $table->foreignId('semester_id')->nullable()
                ->constrained('semesters')->nullOnDelete();

            $table->string('judul', 200);
            $table->text('deskripsi')->nullable();
            $table->enum('tipe', [
                'dokumen',    // PDF, Word, PPT
                'video',      // Upload langsung atau embed (YouTube, Drive)
                'audio',      // Rekaman pelajaran
                'link',       // URL eksternal
                'teks',       // Konten langsung (rich text)
                'gambar',     // Foto/infografis
                'lainnya',
            ])->default('dokumen');

            // File atau URL
            $table->string('storage_path', 500)->nullable()
                ->comment('Relative path di Object Storage (untuk tipe dokumen/video/audio/gambar)');
            $table->string('url_eksternal', 500)->nullable()
                ->comment('URL YouTube, Google Drive, dll (untuk tipe link/video embed)');
            $table->string('mime_type', 80)->nullable();
            $table->unsignedBigInteger('ukuran_bytes')->nullable()
                ->comment('Ukuran file dalam bytes — 0 jika tipe link');

            $table->unsignedSmallInteger('urutan')->default(0)
                ->comment('Urutan tampil di daftar materi');
            $table->boolean('is_published')->default(false)
                ->comment('0=draft, 1=siswa bisa lihat');
            $table->timestamp('published_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index(['school_id', 'mapel_id', 'semester_id'], 'idx_cm_school_mapel_smt');
            $table->index(['school_id', 'kelas_id'], 'idx_cm_school_kelas');
            $table->index(['school_id', 'is_published'], 'idx_cm_school_pub');
        });

        // ── ASSIGNMENTS ──────────────────────────────────────────────
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('mapel_id')
                ->constrained('mapels')->cascadeOnDelete();
            $table->foreignId('kelas_id')
                ->comment('Tugas untuk kelas ini')
                ->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('guru_id')
                ->comment('Guru pemberi tugas')
                ->constrained('gurus')->cascadeOnDelete();
            $table->foreignId('semester_id')->nullable()
                ->constrained('semesters')->nullOnDelete();

            $table->string('judul', 200);
            $table->longtext('instruksi')->nullable()
                ->comment('Instruksi lengkap tugas — bisa HTML rich text');
            $table->string('lampiran', 500)->nullable()
                ->comment('Path file lampiran soal (PDF, Word)');

            $table->enum('tipe', [
                'pr',          // Pekerjaan Rumah
                'proyek',      // Project jangka panjang
                'latihan',     // Latihan soal tidak dinilai
                'portofolio',  // Kumpulan karya
                'presentasi',  // Presentasi kelas
                'lainnya',
            ])->default('pr');

            $table->timestamp('batas_pengumpulan')
                ->comment('Deadline — siswa tidak bisa kumpul setelah ini jika late_policy = reject');
            $table->enum('late_policy', [
                'accept',       // Tetap diterima, tidak ada penalti otomatis
                'penalty',      // Diterima tapi nilai dikurangi otomatis
                'reject',       // Ditolak sistem setelah deadline
            ])->default('accept');
            $table->decimal('late_penalty_persen', 5, 2)->default(0)
                ->comment('Persentase pengurangan nilai jika late. 0 jika late_policy bukan penalty');

            $table->decimal('nilai_maksimal', 6, 2)->default(100);
            $table->boolean('boleh_revisi')->default(false)
                ->comment('Apakah siswa boleh mengumpulkan ulang setelah dinilai');
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index(['school_id', 'kelas_id', 'semester_id'], 'idx_assign_school_kelas_smt');
            $table->index(['school_id', 'guru_id'], 'idx_assign_school_guru');
            $table->index(['school_id', 'batas_pengumpulan'], 'idx_assign_school_deadline');
        });

        // ── ASSIGNMENT_SUBMISSIONS ───────────────────────────────────
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('assignment_id')
                ->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('siswa_id')
                ->constrained('siswas')->cascadeOnDelete();

            $table->text('catatan_siswa')->nullable()
                ->comment('Keterangan dari siswa saat mengumpulkan');
            $table->string('storage_path', 500)->nullable()
                ->comment('Path file tugas yang dikumpulkan');
            $table->string('url_eksternal', 500)->nullable()
                ->comment('Link Google Drive, GitHub, dll');

            $table->enum('status', [
                'draft',          // Belum dikumpulkan (disimpan sementara)
                'submitted',      // Sudah dikumpulkan, menunggu penilaian
                'late',           // Dikumpulkan setelah deadline
                'graded',         // Sudah dinilai
                'returned',       // Dikembalikan untuk revisi
                'resubmitted',    // Dikumpulkan ulang setelah revisi
            ])->default('draft');

            $table->timestamp('submitted_at')->nullable();
            $table->decimal('nilai', 6, 2)->nullable()
                ->comment('Nilai yang diberikan guru. NULL jika belum dinilai');
            $table->text('feedback_guru')->nullable()
                ->comment('Komentar/feedback dari guru');
            $table->foreignId('dinilai_oleh')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->timestamp('dinilai_at')->nullable();

            $table->timestamps();

            $table->unique(['assignment_id', 'siswa_id'], 'uq_submission_assign_siswa');
            $table->index(['school_id', 'assignment_id', 'status'], 'idx_sub_school_assign_status');
            $table->index(['school_id', 'siswa_id', 'status'], 'idx_sub_school_siswa_status');
        });

        // ── EXAMS ────────────────────────────────────────────────────
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('mapel_id')
                ->constrained('mapels')->cascadeOnDelete();
            $table->foreignId('kelas_id')
                ->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('guru_id')
                ->comment('Guru pembuat ujian')
                ->constrained('gurus')->cascadeOnDelete();
            $table->foreignId('semester_id')->nullable()
                ->constrained('semesters')->nullOnDelete();

            $table->string('judul', 200);
            $table->text('deskripsi')->nullable()
                ->comment('Petunjuk ujian yang tampil di awal sebelum mulai');
            $table->enum('tipe', [
                'ulangan_harian',
                'ulangan_tengah_semester',
                'ulangan_akhir_semester',
                'kuis',
                'tryout',
                'lainnya',
            ])->default('ulangan_harian');

            $table->timestamp('waktu_mulai')
                ->comment('Kapan ujian bisa dimulai');
            $table->timestamp('waktu_selesai')
                ->comment('Kapan ujian otomatis ditutup');
            $table->unsignedSmallInteger('durasi_menit')
                ->comment('Durasi maksimal per siswa (dalam menit)');

            $table->boolean('acak_soal')->default(false)
                ->comment('1 = urutan soal diacak per siswa');
            $table->boolean('acak_pilihan')->default(false)
                ->comment('1 = urutan pilihan jawaban diacak');
            $table->boolean('tampilkan_skor_langsung')->default(false)
                ->comment('1 = siswa langsung lihat skor setelah submit');
            $table->boolean('boleh_buka_lagi')->default(false)
                ->comment('1 = siswa bisa review jawaban setelah submit (tapi tidak bisa ubah)');

            $table->decimal('nilai_lulus', 5, 2)->default(70)
                ->comment('KKM/passing grade ujian ini');
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index(['school_id', 'kelas_id', 'waktu_mulai'], 'idx_exams_school_kelas_waktu');
            $table->index(['school_id', 'guru_id'], 'idx_exams_school_guru');
        });

        // ── EXAM_QUESTIONS ───────────────────────────────────────────
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('exam_id')
                ->constrained('exams')->cascadeOnDelete();

            $table->unsignedSmallInteger('nomor')
                ->comment('Nomor urut soal');
            $table->longtext('pertanyaan')
                ->comment('Teks soal — bisa HTML dengan LaTeX untuk rumus matematika');
            $table->string('gambar', 500)->nullable()
                ->comment('Path gambar soal (opsional)');
            $table->enum('tipe', [
                'pilihan_ganda',    // a,b,c,d,e — satu jawaban benar
                'pilihan_ganda_mx', // Multiple choice — bisa lebih dari satu benar
                'benar_salah',      // True/False
                'isian_singkat',    // Short answer — teks pendek
                'esai',             // Esai — dinilai manual oleh guru
                'menjodohkan',      // Matching — pasangkan kolom kiri dan kanan
            ])->default('pilihan_ganda');

            $table->json('pilihan')->nullable()
                ->comment('JSON: [{key:"a", teks:"...", gambar:null}, ...] untuk pilihan_ganda');
            $table->json('jawaban_benar')
                ->comment('JSON: ["a"] atau ["a","c"] untuk mx atau "teks" untuk isian');
            $table->decimal('bobot', 5, 2)->default(1)
                ->comment('Bobot soal ini. Total bobot ujian biasanya 100');
            $table->text('pembahasan')->nullable()
                ->comment('Penjelasan jawaban benar — ditampilkan setelah selesai jika diizinkan');

            $table->timestamps();

            $table->unique(['exam_id', 'nomor'], 'uq_exam_question_nomor');
            $table->index(['school_id', 'exam_id'], 'idx_eq_school_exam');
        });

        // ── EXAM_STUDENT_SESSIONS ─────────────────────────────────────
        Schema::create('exam_student_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('exam_id')
                ->constrained('exams')->cascadeOnDelete();
            $table->foreignId('siswa_id')
                ->constrained('siswas')->cascadeOnDelete();

            $table->timestamp('mulai_at')
                ->comment('Kapan siswa mulai mengerjakan');
            $table->timestamp('selesai_at')->nullable()
                ->comment('Kapan siswa submit atau waktu habis');
            $table->enum('status', [
                'in_progress', // Sedang mengerjakan
                'submitted',   // Sudah submit manual
                'timeout',     // Waktu habis, otomatis submit
                'aborted',     // Ditutup paksa (disconnect, kecurangan, dll)
            ])->default('in_progress');

            // Hasil
            $table->decimal('skor_mentah', 7, 2)->nullable()
                ->comment('Total bobot soal yang benar sebelum normalisasi');
            $table->decimal('nilai_akhir', 5, 2)->nullable()
                ->comment('Nilai 0-100 setelah normalisasi dan penilaian esai');
            $table->boolean('lulus')->nullable()
                ->comment('NULL jika belum dinilai, true/false setelah final');
            $table->timestamp('dinilai_at')->nullable();
            $table->json('urutan_soal')->nullable()
                ->comment('Array id soal sesuai urutan yang didapat siswa (jika acak_soal)');

            $table->timestamps();

            $table->unique(['exam_id', 'siswa_id'], 'uq_exam_session_exam_siswa');
            $table->index(['school_id', 'exam_id', 'status'], 'idx_ess_school_exam_status');
            $table->index(['school_id', 'siswa_id'], 'idx_ess_school_siswa');
        });

        // ── EXAM_ANSWERS ──────────────────────────────────────────────
        Schema::create('exam_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('session_id')
                ->comment('FK ke exam_student_sessions.id')
                ->constrained('exam_student_sessions')->cascadeOnDelete();
            $table->foreignId('question_id')
                ->comment('FK ke exam_questions.id')
                ->constrained('exam_questions')->cascadeOnDelete();

            // Jawaban siswa
            $table->json('jawaban')->nullable()
                ->comment('["a"] untuk pg, ["a","c"] untuk mx, "teks" untuk isian/esai');
            $table->string('file_path', 500)->nullable()
                ->comment('Upload file jawaban (untuk tipe esai dengan attachment)');

            // Penilaian
            $table->boolean('is_correct')->nullable()
                ->comment('NULL untuk esai (dinilai manual), true/false untuk objective');
            $table->decimal('skor', 5, 2)->nullable()
                ->comment('Skor soal ini (0 sd bobot soal)');
            $table->text('feedback')->nullable()
                ->comment('Feedback per soal dari guru (terutama untuk esai)');
            $table->timestamp('dijawab_at')->nullable();

            $table->timestamps();

            $table->unique(['session_id', 'question_id'], 'uq_exam_answer_session_q');
            $table->index(['school_id', 'session_id'], 'idx_ea_school_session');
        });

        // ── NOTIFICATION_TEMPLATES ────────────────────────────────────
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()
                ->comment('NULL = template global platform. NOT NULL = kustomisasi per sekolah')
                ->constrained('schools')->cascadeOnDelete();

            $table->string('event_slug', 80)->unique()
                ->comment('Event yang memicu: siswa.alpa, tagihan.jatuh_tempo, ppdb.diterima, absensi.izin');
            $table->string('nama', 150)
                ->comment('Nama template: Notifikasi Siswa Alpa');

            // Konten per channel — nullable karena tidak semua event punya semua channel
            $table->text('template_whatsapp')->nullable()
                ->comment('Template pesan WhatsApp. Variabel: {{nama_siswa}}, {{nama_kelas}}, dll');
            $table->text('template_email_subject')->nullable();
            $table->longtext('template_email_body')->nullable()
                ->comment('HTML body email. Variabel sama seperti WhatsApp');
            $table->text('template_sms')->nullable()
                ->comment('Template SMS singkat (160 char)');
            $table->text('template_push')->nullable()
                ->comment('Template push notification (singkat, max ~120 char)');

            // Konfigurasi pengiriman
            $table->boolean('channel_whatsapp')->default(false);
            $table->boolean('channel_email')->default(false);
            $table->boolean('channel_sms')->default(false);
            $table->boolean('channel_push')->default(true);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
        });

        // ── NOTIFICATION_LOGS ─────────────────────────────────────────
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('template_id')->nullable()
                ->comment('FK ke notification_templates.id. NULL jika ad-hoc')
                ->constrained('notification_templates')->nullOnDelete();

            // Penerima
            $table->string('recipient_type', 30)
                ->comment('Tipe penerima: siswa, orang_tua, guru, kepsek, operator');
            $table->unsignedBigInteger('recipient_id')
                ->comment('ID record penerima (siswas.id, orang_tuas.id, dll)');
            $table->string('recipient_name', 150)->nullable()
                ->comment('Nama snapshot penerima saat kirim (untuk log historis)');
            $table->string('recipient_phone', 20)->nullable()
                ->comment('Nomor HP/WA saat kirim');
            $table->string('recipient_email', 150)->nullable();

            // Event yang memicu
            $table->string('event_slug', 80)
                ->comment('Sama dengan notification_templates.event_slug');
            $table->json('context')->nullable()
                ->comment('Data konteks saat kirim: {siswa_id, tanggal, kelas, dll}');

            // Konten yang benar-benar dikirim (setelah variabel di-render)
            $table->string('channel', 20)
                ->comment('whatsapp, email, sms, push');
            $table->text('pesan_terkirim')->nullable()
                ->comment('Pesan final setelah variabel dirender');

            // Status pengiriman
            $table->enum('status', [
                'queued',    // Antri di queue
                'sent',      // Berhasil dikirim ke gateway
                'delivered', // Konfirmasi diterima penerima (jika gateway support delivery report)
                'failed',    // Gagal kirim
                'cancelled', // Dibatalkan sebelum dikirim
            ])->default('queued');

            $table->string('gateway', 30)->nullable()
                ->comment('Gateway yang dipakai: fonnte, wablas, sendgrid, firebase, dll');
            $table->string('gateway_ref', 100)->nullable()
                ->comment('Reference ID dari gateway untuk tracking');
            $table->text('error_message')->nullable()
                ->comment('Pesan error jika status = failed');

            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();

            $table->timestamps();

            $table->index(['school_id', 'event_slug', 'created_at'], 'idx_notif_school_event');
            $table->index(['school_id', 'recipient_type', 'recipient_id'], 'idx_notif_school_recipient');
            $table->index(['school_id', 'status'], 'idx_notif_school_status');
            $table->index('sent_at', 'idx_notif_sent_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_templates');
        Schema::dropIfExists('exam_answers');
        Schema::dropIfExists('exam_student_sessions');
        Schema::dropIfExists('exam_questions');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('course_materials');
    }
};