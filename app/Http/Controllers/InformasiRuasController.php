<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RuasJalan;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class InformasiRuasController extends Controller
{
    /**
     * Tampilkan daftar ruas jalan untuk generate barcode.
     */
    public function index()
    {
        $ruasList = RuasJalan::select('id', 'nm_ruas')->orderBy('id')->get();

        return inertia('informasiruas/Index', [
            'ruasList' => $ruasList,
        ]);
    }

    /**
     * Halaman preview ruas.
     */
    public function preview($id)
    {
        $ruas = RuasJalan::findOrFail($id);

        return inertia('informasiruas/Preview', [
            'ruas' => $ruas,
        ]);
    }

    /**
     * Generate QR Code untuk link preview.
     */
    public function generateQrCode($id)
    {
        $ruas = RuasJalan::findOrFail($id);
        $url = route('informasi-ruas.preview', $ruas->id);

        $qrcode = QrCode::format('png')->size(300)->generate($url);
        return response($qrcode)->header('Content-Type', 'image/png');
    }
}
