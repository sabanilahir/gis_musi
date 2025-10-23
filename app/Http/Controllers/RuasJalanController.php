<?php

namespace App\Http\Controllers;

use App\Models\RuasJalan;
use App\Models\KoordinatRuas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
class RuasJalanController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $perPage = $request->get('per_page', 10); // ambil jumlah per halaman, default 10

        $ruas = RuasJalan::query()
            ->when($search, function ($query, $search) {
                $query->where('Nm_Ruas', 'like', "%{$search}%")
                    ->orWhere('Kab_Kot', 'like', "%{$search}%")
                    ->orWhere('Status', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage) // gunakan per_page dari request
            ->appends($request->all()); // jaga agar parameter tetap di URL

        return Inertia::render('RuasJalan/Index', [
            'ruas' => $ruas,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage, // kirim balik ke frontend biar dropdown tetap sinkron
            ],
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
        Log::info('✅ Memulai proses import file KMZ');

        $request->validate([
            'file' => 'required|file',
        ]);

        $file = $request->file('file');
        $zip = new \ZipArchive;

        if ($zip->open($file->getPathname()) === true) {
            $extractPath = storage_path('app/kmz_extract');
            if (!is_dir($extractPath))
                mkdir($extractPath, 0777, true);

            $zip->extractTo($extractPath);
            $zip->close();
            Log::info('📦 File berhasil diekstrak ke: ' . $extractPath);

            $files = glob($extractPath . '/*.kml');
            if (empty($files))
                $files = glob($extractPath . '/**/*.kml', GLOB_BRACE);
            if (count($files) === 0) {
                Log::error('❌ Tidak ditemukan file .kml di dalam KMZ');
                return back()->withErrors(['msg' => 'File .kml tidak ditemukan di dalam file .kmz']);
            }

            $kmlPath = $files[0];
            Log::info('🗺️ Menggunakan file KML: ' . $kmlPath);

            libxml_use_internal_errors(true);
            $xml = simplexml_load_file($kmlPath);
            if (!$xml) {
                Log::error('Gagal membaca file KML', ['errors' => libxml_get_errors()]);
                return back()->withErrors(['msg' => 'Gagal membaca file KML']);
            }

            $xml->registerXPathNamespace('kml', 'http://www.opengis.net/kml/2.2');
            $placemarks = $xml->xpath('//kml:Placemark');
            if (!$placemarks) {
                Log::warning('Tidak ditemukan Placemark di dalam KML');
                return back()->withErrors(['msg' => 'Tidak ditemukan Placemark dalam file KML']);
            }

            Log::info('Jumlah Placemark ditemukan: ' . count($placemarks));

            // Ambil semua kolom di tabel ruas_jalan agar kita tahu mana yang valid
            $tableColumns = Schema::getColumnListing('ruas_jalan');

            $haversine = function ($lat1, $lon1, $lat2, $lon2) {
                $R = 6371;
                $dLat = deg2rad($lat2 - $lat1);
                $dLon = deg2rad($lon2 - $lon1);
                $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
                return 2 * $R * asin(sqrt($a));
            };

            $count = 0;

            foreach ($placemarks as $pm) {
                $namaRuas = trim((string) ($pm->name ?? 'Tanpa Nama'));

                // ✅ Ambil SimpleData
                $simpleData = [];
                foreach ($pm->xpath('.//kml:ExtendedData//kml:SimpleData') as $node) {
                    $key = trim((string) $node['name']);
                    $val = trim((string) $node);
                    if ($key !== '')
                        $simpleData[$key] = $val;
                }

                // ✅ Ambil koordinat
                $segments = [];
                foreach ($pm->xpath('.//kml:LineString/kml:coordinates') as $node) {
                    $coords = preg_split('/[\s\n]+/', trim((string) $node));
                    $seg = [];
                    foreach ($coords as $c) {
                        $parts = explode(',', trim($c));
                        if (count($parts) >= 2) {
                            $seg[] = ['lng' => (float) $parts[0], 'lat' => (float) $parts[1]];
                        }
                    }
                    if ($seg)
                        $segments[] = $seg;
                }

                if (empty($segments))
                    continue;

                $first = $segments[0][0];
                $lastSeg = end($segments);
                $last = end($lastSeg);

                // Hitung total panjang
                $totalDistance = 0;
                foreach ($segments as $seg) {
                    for ($i = 1; $i < count($seg); $i++) {
                        $totalDistance += $haversine(
                            $seg[$i - 1]['lat'],
                            $seg[$i - 1]['lng'],
                            $seg[$i]['lat'],
                            $seg[$i]['lng']
                        );
                    }
                }

                DB::beginTransaction();
                try {
                    $ruas = \App\Models\RuasJalan::where('Nm_Ruas', $namaRuas)->first();

                    // ✅ Siapkan data default
                    $dataRuas = [
                        'Nm_Ruas' => $namaRuas,
                        'Kl_Dat_Das' => 'Import KMZ',
                        'Thn_Data' => date('Y'),
                        'Status' => 'Baru Diimpor',
                        'Fungsi' => 'Belum Ditentukan',
                        'Koord_X_Aw' => $first['lng'],
                        'Koord_Y_Aw' => $first['lat'],
                        'Koord_X_Ak' => $last['lng'],
                        'Koord_Y_Ak' => $last['lat'],
                        'Shape_Leng' => round($totalDistance, 6),
                        'Panjang' => round($totalDistance, 3),
                    ];

                    // ✅ Masukkan semua SimpleData yang cocok dengan kolom tabel
                    foreach ($simpleData as $key => $val) {
                        // Samakan kapitalisasi agar fleksibel
                        foreach ($tableColumns as $col) {
                            if (strcasecmp($col, $key) == 0) {
                                $dataRuas[$col] = $val;
                                break;
                            }
                        }
                    }

                    if ($ruas) {
                        // Hapus koordinat lama
                        \App\Models\KoordinatRuas::where('ruas_jalan_id', $ruas->id)->delete();
                        $dataRuas['REMARK'] = "♻️ Diperbarui dari import KMZ " . now();
                        $ruas->update($dataRuas);
                        Log::info("♻️ Update ruas lama: {$namaRuas}");
                    } else {
                        $dataRuas['REMARK'] = "🆕 Diimpor dari file KMZ";
                        $ruas = \App\Models\RuasJalan::create($dataRuas);
                        Log::info("🆕 Tambah ruas baru: {$namaRuas}");
                    }

                    // Simpan koordinat
                    $batch = [];
                    $index = 1;
                    foreach ($segments as $i => $seg) {
                        foreach ($seg as $pt) {
                            $batch[] = [
                                'ruas_jalan_id' => $ruas->id,
                                'longitude' => $pt['lng'],
                                'latitude' => $pt['lat'],
                                'urutan' => $index++,
                                'segment_ke' => $i + 1,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ];
                        }
                    }
                    \App\Models\KoordinatRuas::insert($batch);

                    DB::commit();
                    $count++;
                } catch (\Throwable $e) {
                    DB::rollBack();
                    Log::error('❌ Gagal menyimpan ruas ' . $namaRuas, [
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Log::info("✅ Berhasil mengimpor {$count} ruas jalan lengkap beserta SimpleData & koordinat.");
            return back()->with('success', "Data KMZ berhasil diimpor ($count ruas jalan).");
        }

        Log::error('❌ Gagal membuka file KMZ');
        return back()->withErrors(['msg' => 'Gagal membuka file KMZ']);
    }



public function map()
{
    // 🔹 Ambil semua ruas jalan
    $ruasList = \App\Models\RuasJalan::select('id', 'Nm_Ruas')->get();

    // 🔹 Ambil semua koordinat per ruas
    $koordinatSemua = \App\Models\KoordinatRuas::select(
            'ruas_jalan_id',
            'latitude',
            'longitude',
            'segment_ke'
        )
        ->orderBy('ruas_jalan_id')
        ->orderBy('segment_ke')
        ->orderBy('id')
        ->get()
        ->groupBy('ruas_jalan_id');

    // 🔹 Bentuk struktur data siap kirim ke frontend
    $ruasDenganSegmen = $ruasList->map(function ($r) use ($koordinatSemua) {
        $segments = collect($koordinatSemua->get($r->id, []))
            ->groupBy('segment_ke')
            ->map(function ($points, $segmentKe) {
                return [
                    'segment_ke' => $segmentKe,
                    'koordinat' => $points->map(fn($p) => [
                        'lat' => (float) $p->latitude,
                        'lng' => (float) $p->longitude,
                    ])->values(),
                ];
            })
            ->values();

        return [
            'ruas_jalan_id' => $r->id,
            'Nm_Ruas' => $r->Nm_Ruas,
            'segments' => $segments,
        ];
    });

    return inertia('RuasJalan/Map', [
        'ruas' => $ruasDenganSegmen,
    ]);
}





    // public function show($id)
    // {
    //     $ruas = RuasJalan::findOrFail($id);

    //     return inertia('RuasJalan/Show', [
    //         'ruas' => $ruas,
    //     ]);
    // }

    public function show($id)
    {
        $ruas = \App\Models\RuasJalan::with([
            'koordinat' => function ($q) {
                $q->orderBy('segment_ke')->orderBy('urutan');
            }
        ])->findOrFail($id);

        return inertia('RuasJalan/Show', [
            'ruas' => $ruas,
        ]);
    }
}
