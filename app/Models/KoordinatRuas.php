<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KoordinatRuas extends Model
{
    use HasFactory;

    protected $table = 'koordinat_ruas';
    protected $fillable = [
        'ruas_jalan_id',
        'latitude',
        'longitude',
        'urutan',
    ];

    public function ruasJalan()
    {
        return $this->belongsTo(RuasJalan::class);
    }
}
