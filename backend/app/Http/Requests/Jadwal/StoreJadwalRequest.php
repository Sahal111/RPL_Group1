<?php

namespace App\Http\Requests\Jadwal;

use Illuminate\Foundation\Http\FormRequest;

class StoreJadwalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plot_id' => 'required|integer|exists:plot_guru_mapels,id',
            'kelas_id' => 'required|integer|exists:kelas,id',
            'guru_id' => 'required|integer|exists:gurus,id',
            'mapel_id' => 'required|integer|exists:mapels,id',
            'semester_id' => 'required|integer|exists:semesters,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_ke' => 'nullable|integer',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
        ];
    }

    public function messages(): array
    {
        return [
            'hari.in' => 'Hari tidak valid.',
            'jam_mulai.date_format' => 'Format jam mulai harus HH:MM.',
            'jam_selesai.after' => 'Jam selesai harus setelah jam mulai.',
        ];
    }
}