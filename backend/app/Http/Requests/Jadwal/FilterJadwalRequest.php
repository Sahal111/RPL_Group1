<?php

namespace App\Http\Requests\Jadwal;

use Illuminate\Foundation\Http\FormRequest;

class FilterJadwalRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'kelas_id'        => 'required|integer',
            'tahun_ajaran_id' => 'required|integer',
            'semester_id'     => 'required|integer',
        ];
    }
}
