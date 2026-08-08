<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';
    // Hanya menyimpan created_at, tidak ada updated_at
    const UPDATED_AT = null;

    protected $fillable = ['user_id', 'action', 'module', 'subject_id', 'keterangan', 'ip_address', 'user_agent'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}