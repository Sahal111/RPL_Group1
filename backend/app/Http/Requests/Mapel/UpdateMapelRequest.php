<?php

namespace App\Http\Requests\Mapel;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMapelRequest extends FormRequest
{
    private const KELOMPOK_VALID = ['A - Wajib', 'B - Wajib', 'C - Muatan Lokal', 'Pengembangan Diri', 'Ekstrakurikuler', 'Lainnya'];
    private const KURIKULUM_VALID = ['Kurikulum 2013', 'Kurikulum Merdeka', 'Keduanya'];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'kode' => "required|string|max:20|unique:mapels,kode,{$id}",
            'nama_mapel' => 'required|string|max:150',
            'kelompok' => 'required|in:' . implode(',', self::KELOMPOK_VALID),
            'tingkat' => 'nullable|array',
            'tingkat.*' => 'in:1,2,3,4,5,6',
            'jam_per_minggu' => 'required|integer|min:1|max:40',
            'kurikulum' => 'required|in:' . implode(',', self::KURIKULUM_VALID),
            'is_active' => 'boolean',
        ];
    }
}