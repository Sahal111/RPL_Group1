<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SaasInvoice extends Model
{
    use HasFactory;

    protected $table = 'saas_invoices';

    protected $fillable = [
        'school_id',
        'subscription_id',
        'nomor_invoice',
        'jumlah',
        'diskon',
        'pajak',
        'tax_rate',
        'total',
        'currency_code',
        'status',
        'jatuh_tempo',
        'paid_at',
    ];

    protected $casts = [
        'jumlah' => 'decimal:2',
        'diskon' => 'decimal:2',
        'pajak' => 'decimal:2',
        'tax_rate' => 'decimal:4',
        'total' => 'decimal:2',
        'jatuh_tempo' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class, 'school_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(SchoolSubscription::class, 'subscription_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SaasPayment::class, 'invoice_id');
    }
}
