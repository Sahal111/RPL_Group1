<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaasPayment extends Model
{
    use HasFactory;

    protected $table = 'saas_payments';

    protected $fillable = [
        'school_id',
        'invoice_id',
        'payment_gateway',
        'transaction_id',
        'jumlah',
        'currency_code',
        'status',
        'payload_webhook',
        'paid_at',
    ];

    protected $casts = [
        'jumlah' => 'decimal:2',
        'payload_webhook' => 'array',
        'paid_at' => 'datetime',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class, 'school_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(SaasInvoice::class, 'invoice_id');
    }
}
