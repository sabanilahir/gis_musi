<?php

namespace App\Http\Controllers;

use App\Models\RuasJalan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class RuasJalanController extends Controller
{
    public function index()
    {
        $ruas = RuasJalan::latest()->paginate(10);
        return Inertia::render('RuasJalan/Index', [
            'ruas' => $ruas,
        ]);
    }

    public function create()
    {
        return Inertia::render('RuasJalan/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'Kl_Dat_Das' => 'nullable|string|max:100',
            'Nm_Ruas' => 'required|string|max:255',
            'Thn_Data' => 'nullable|integer',
            'Status' => 'nullable|string|max:100',
            'Fungsi' => 'nullable|string|max:100',
            'Mendukung' => 'nullable|string|max:255',
            'Ura_Dukung' => 'nullable|string|max:255',
            'Propinsi' => 'nullable|string|max:100',
            'Kab_Kot' => 'nullable|string|max:100',
            'Kecamatan' => 'nullable|string|max:255',
            'Desa_Kel' => 'nullable|string|max:255',
            'Tk_Ruas_Aw' => 'nullable|string|max:255',
            'Tk_Ruas_Ak' => 'nullable|string|max:255',
            'Kd_Patok' => 'nullable|string|max:50',
            'Km_Awal' => 'nullable|numeric',
            'Km_Akhir' => 'nullable|numeric',
            'Nm_Lintas' => 'nullable|string|max:255',
            'Panjang' => 'nullable|numeric',
            'Tipe_Keras' => 'nullable|string|max:100',
            'Koord_X_Aw' => 'nullable|numeric',
            'Koord_Y_Aw' => 'nullable|numeric',
            'Koord_X_Ak' => 'nullable|numeric',
            'Koord_Y_Ak' => 'nullable|numeric',
        ]);

        RuasJalan::create($validated);

        return redirect()->route('ruas-jalan.index')->with('success', 'Data berhasil ditambahkan.');
    }

    public function edit(RuasJalan $ruasJalan)
    {
        return Inertia::render('RuasJalan/Edit', [
            'ruas' => $ruasJalan,
        ]);
    }

    public function update(Request $request, RuasJalan $ruasJalan)
    {
        $validated = $request->validate([
            'Nm_Ruas' => 'required|string|max:255',
            'Thn_Data' => 'nullable|integer',
            'Status' => 'nullable|string|max:100',
            // tambahkan field lain sesuai kebutuhan
        ]);

        $ruasJalan->update($validated);

        return redirect()->route('ruas-jalan.index')->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(RuasJalan $ruasJalan)
    {
        $ruasJalan->delete();
        return redirect()->route('ruas-jalan.index')->with('success', 'Data berhasil dihapus.');
    }

    public function import(Request $request)
    {

        Log::info('✅ melakukan cek file import KMZ');

        $request->validate([
            'file' => 'required|file',
        ]);
        Log::info('=== MULAI IMPORT KMZ ===');
        $file = $request->file('file');
        $zip = new \ZipArchive;

        Log::info('File path: ' . $file->getPathname());
        // dd('Masuk ke fungsi import');
        if ($zip->open($file->getPathname()) === true) {
            $extractPath = storage_path('app/kmz_extract');

            if (!is_dir($extractPath)) {
                mkdir($extractPath, 0777, true);
            }

            $zip->extractTo($extractPath);
            $zip->close();
            Log::info('File berhasil diekstrak ke: ' . $extractPath);

            // cari semua file KML di folder hasil ekstraksi
            $files = glob($extractPath . '/*.kml');
            if (empty($files)) {
                $files = glob($extractPath . '/**/*.kml', GLOB_BRACE);
            }

            Log::info('File KML ditemukan:', $files);

            if (count($files) === 0) {
                Log::error('File .kml tidak ditemukan di dalam file .kmz');
                return back()->withErrors(['msg' => 'File .kml tidak ditemukan di dalam file .kmz']);
            }

            $kmlPath = $files[0];
            Log::info('File KML yang digunakan: ' . $kmlPath);

            libxml_use_internal_errors(true);
            $xml = simplexml_load_file($kmlPath);
            if (!$xml) {
                Log::error('Gagal membaca file KML', ['errors' => libxml_get_errors()]);
                return back()->withErrors(['msg' => 'Gagal membaca file KML']);
            }

            $xml->registerXPathNamespace('kml', 'http://www.opengis.net/kml/2.2');
            $placemarks = $xml->xpath('//kml:Placemark');

            if (!$placemarks) {
                Log::warning('Tidak ditemukan Placemark di KML');
                return back()->withErrors(['msg' => 'Tidak ditemukan data Placemark di dalam KML']);
            }

            Log::info('Jumlah Placemark ditemukan: ' . count($placemarks));

            $count = 0;
            foreach ($placemarks as $pm) {
                $name = (string) $pm->name;
                $desc = strip_tags((string) $pm->description);
                $coordsNode = $pm->xpath('.//kml:coordinates')[0] ?? null;

                if ($coordsNode) {
                    $coords = trim((string) $coordsNode);
                    $coordArray = preg_split('/\s+/', $coords);
                    $first = explode(',', $coordArray[0]);
                    $last = explode(',', end($coordArray));

                    RuasJalan::create([
                        'Nm_Ruas' => $name,
                        'Ura_Dukung' => $desc,
                        'Koord_X_Aw' => $first[0] ?? null,
                        'Koord_Y_Aw' => $first[1] ?? null,
                        'Koord_X_Ak' => $last[0] ?? null,
                        'Koord_Y_Ak' => $last[1] ?? null,
                        'Thn_Data' => date('Y'),
                        'Status' => 'Baru Diimpor',
                        'Fungsi' => 'Belum Ditentukan',
                    ]);

                    $count++;
                } else {
                    Log::warning('Placemark tanpa koordinat', ['name' => $name]);
                }
            }

            Log::info("Berhasil mengimpor $count ruas jalan.");

            return back()->with('success', "Data KMZ berhasil diimpor ($count ruas jalan).");
        }

        Log::error('Gagal membuka file KMZ');
        return back()->withErrors(['msg' => 'Gagal membuka file KMZ']);
    }

}
