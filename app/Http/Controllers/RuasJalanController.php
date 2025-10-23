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
        $perPage = $request->get('per_page', 10);

        $ruas = RuasJalan::query()
            ->when($search, function ($query, $search) {
                $query->where('nm_ruas', 'like', "%{$search}%")
                    ->orWhere('kab_kot', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->appends($request->all());

        return Inertia::render('RuasJalan/Index', [
            'ruas' => $ruas,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
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
            'kl_dat_das' => 'nullable|string|max:100',
            'nm_ruas' => 'required|string|max:255',
            'thn_data' => 'nullable|integer',
            'status' => 'nullable|string|max:100',
            'fungsi' => 'nullable|string|max:100',
            'mendukung' => 'nullable|string|max:255',
            'ura_dukung' => 'nullable|string|max:255',
            'propinsi' => 'nullable|string|max:100',
            'kab_kot' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:255',
            'desa_kel' => 'nullable|string|max:255',
            'tk_ruas_aw' => 'nullable|string|max:255',
            'tk_ruas_ak' => 'nullable|string|max:255',
            'kd_patok' => 'nullable|string|max:50',
            'km_awal' => 'nullable|numeric',
            'km_akhir' => 'nullable|numeric',
            'nm_lintas' => 'nullable|string|max:255',
            'panjang' => 'nullable|numeric',
            'tipe_keras' => 'nullable|string|max:100',
            'koord_x_aw' => 'nullable|numeric',
            'koord_y_aw' => 'nullable|numeric',
            'koord_x_ak' => 'nullable|numeric',
            'koord_y_ak' => 'nullable|numeric',
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
            'nm_ruas' => 'required|string|max:255',
            'thn_data' => 'nullable|integer',
            'status' => 'nullable|string|max:100',
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

            $tableColumns = Schema::getColumnListing('ruas_jalan');

            $haversine = function ($lat1, $lon1, $lat2, $lon2) {
                $R = 6371;
                $dLat = deg2rad($lat2 - $lat1);
                $dLon = deg2rad($lon2 - $lon1);
                $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
                return 2 * $R * asin(sqrt($a));
            };

            $count = 0;
            $skipped = 0;

            foreach ($placemarks as $pm) {
                $namaRuas = trim((string) ($pm->name ?? 'Tanpa Nama'));
                $namaRuas = preg_replace('/\s+/', ' ', $namaRuas);

                // Deteksi nama kolom yang benar dari database
                $kolomNama = collect($tableColumns)->first(fn($col) => strtolower($col) === 'nm_ruas') ?? 'nm_ruas';

                // Gunakan nama kolom yang tepat dalam query
                $existing = \App\Models\RuasJalan::whereRaw("LOWER(TRIM(\"{$kolomNama}\")) = ?", [strtolower($namaRuas)])->first();

                if ($existing) {
                    Log::warning("⚠️ Duplikat terdeteksi: {$namaRuas}");
                    $skipped++;
                    continue;
                } else {
                    Log::info("✅ Ruas baru akan disimpan: {$namaRuas}");
                }

                $simpleData = [];
                foreach ($pm->xpath('.//kml:ExtendedData//kml:SimpleData') as $node) {
                    $key = trim((string) $node['name']);
                    $val = trim((string) $node);
                    if ($key !== '')
                        $simpleData[$key] = $val;
                }

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
                    $dataRuas = [
                        'nm_ruas' => $namaRuas,
                        'kl_dat_das' => 'import kmz',
                        'thn_data' => date('Y'),
                        'status' => 'baru diimpor',
                        'fungsi' => 'belum ditentukan',
                        'koord_x_aw' => $first['lng'],
                        'koord_y_aw' => $first['lat'],
                        'koord_x_ak' => $last['lng'],
                        'koord_y_ak' => $last['lat'],
                        'shape_leng' => round($totalDistance, 6),
                        'panjang' => round($totalDistance, 3),
                        'remark' => '🆕 diimpor dari file kmz',
                    ];

                    foreach ($simpleData as $key => $val) {
                        foreach ($tableColumns as $col) {
                            if (strcasecmp($col, $key) == 0) {
                                $dataRuas[$col] = $val;
                                break;
                            }
                        }
                    }

                    $ruas = \App\Models\RuasJalan::create($dataRuas);

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
                    Log::info("🆕 Tambah ruas baru: {$namaRuas}");
                } catch (\Throwable $e) {
                    DB::rollBack();
                    Log::error('❌ Gagal menyimpan ruas ' . $namaRuas, ['error' => $e->getMessage()]);
                }
            }

            Log::info("✅ Berhasil mengimpor {$count} ruas baru. {$skipped} ruas dilewati (sudah ada).");
            return back()->with('success', "Berhasil mengimpor {$count} ruas baru. {$skipped} ruas dilewati karena sudah ada.");
        }

        Log::error('❌ Gagal membuka file KMZ');
        return back()->withErrors(['msg' => 'Gagal membuka file KMZ']);
    }

    public function map()
    {
        $ruasList = \App\Models\RuasJalan::select('id', 'nm_ruas')->get();

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
                'nm_ruas' => $r->nm_ruas,
                'segments' => $segments,
            ];
        });

        return inertia('RuasJalan/Map', [
            'ruas' => $ruasDenganSegmen,
        ]);
    }

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
