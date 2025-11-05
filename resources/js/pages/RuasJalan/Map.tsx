import { Head, Link, usePage } from '@inertiajs/react';
import { GoogleMap, InfoWindow, Polyline, useJsApiLoader } from '@react-google-maps/api';
import React, { useState } from 'react';
import AppLogo from '@/components/app-logo';

type Koordinat = { lat: number; lng: number };
type Segment = { segment_ke: number; koordinat: Koordinat[] };
type Ruas = { ruas_jalan_id: number; nm_ruas: string; segments: Segment[] };

export default function MapPage() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const page = usePage<{ ruas: Ruas[] }>();
    const ruas = page.props.ruas || [];
    const [selected, setSelected] = useState<any>(null);

    const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
    const [showBasemapMenu, setShowBasemapMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true); // 👈 toggle state

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    const defaultCenter = { lat: -2.7447, lng: 102.9896 };
    const firstPoint = ruas?.[0]?.segments?.[0]?.koordinat?.[0];
    const center = firstPoint || defaultCenter;
    const [zoom] = useState(firstPoint ? 10 : 11);

    if (!isLoaded) return <div className="flex h-screen items-center justify-center">⏳ Memuat peta...</div>;

    return (
        <>
            <Head title="GIS Ruas Jalan" />

            {/* 🌊 Navbar */}
            <nav className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-blue-900 px-6 py-2 text-white shadow-md">
                <div className="flex items-center gap-3">
                    {/* Tombol Toggle Sidebar */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="mr-3 rounded bg-blue-700 px-2 py-1 text-sm hover:bg-blue-600"
                        title={sidebarOpen ? 'Sembunyikan menu' : 'Tampilkan menu'}
                    >
                        ☰
                    </button>
                    <AppLogo />
                </div>

                <div className="flex items-center gap-6 text-sm">
                    <a href="#" className="hover:underline">
                        Tentang
                    </a>
                    <a href="#" className="hover:underline">
                        Sumber Data
                    </a>
                    <a href="#" className="hover:underline">
                        Edukasi
                    </a>

                    {user ? (
                        <div className="group relative">
                            <button className="flex items-center gap-2 rounded bg-white px-3 py-1 text-blue-800 hover:bg-gray-100">
                                👤 {user.name}
                            </button>
                            <div className="absolute right-0 mt-1 hidden w-40 rounded bg-white text-gray-700 shadow-lg group-hover:block">
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                                >
                                    Keluar
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className="rounded bg-white px-3 py-1 text-blue-800 hover:bg-gray-100">
                            Login
                        </Link>
                    )}
                </div>
            </nav>

            {/* 📋 Sidebar (pakai translate-x untuk hide, bukan display:none) */}
            <aside
                className={`fixed top-12 left-0 z-40 h-[calc(100vh-3rem)] w-60 transform bg-blue-900/90 p-4 text-white shadow-lg transition-transform duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <button className="w-full rounded px-3 py-2 text-left hover:bg-blue-800">🗺️ Tentang GIS</button>
                <button className="w-full rounded px-3 py-2 text-left hover:bg-blue-800">📍 Cek Lokasi</button>
                <button className="w-full rounded px-3 py-2 text-left hover:bg-blue-800">🌐 Sumber Data</button>
                <hr className="my-2 border-blue-700" />

                {/* 🛰️ Basemap dropdown */}
                <div>
                    <button
                        onClick={() => setShowBasemapMenu(!showBasemapMenu)}
                        className="flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-blue-800"
                    >
                        <span>🛰️ Basemap</span>
                        <span className="text-xs">{showBasemapMenu ? '▲' : '▼'}</span>
                    </button>

                    {showBasemapMenu && (
                        <div className="ml-4 mt-1 space-y-1">
                            <button
                                onClick={() => setMapType('roadmap')}
                                className={`w-full rounded px-3 py-2 text-left text-sm ${
                                    mapType === 'roadmap' ? 'bg-blue-800 font-semibold' : 'hover:bg-blue-800'
                                }`}
                            >
                                🗺️ Map
                            </button>
                            <button
                                onClick={() => setMapType('satellite')}
                                className={`w-full rounded px-3 py-2 text-left text-sm ${
                                    mapType === 'satellite' ? 'bg-blue-800 font-semibold' : 'hover:bg-blue-800'
                                }`}
                            >
                                🌍 Satellite
                            </button>
                        </div>
                    )}
                </div>

                <button className="mt-2 w-full rounded px-3 py-2 text-left hover:bg-blue-800">📊 Statistik</button>
                <button className="w-full rounded px-3 py-2 text-left hover:bg-blue-800">📚 Edukasi</button>
            </aside>

            {/* 🗺️ Google Map */}
            <div className="h-screen w-full">
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={center}
                    zoom={zoom}
                    mapTypeId={mapType}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        fullscreenControl: false,
                    }}
                >
                    {ruas.map((r, ri) => {
                        const color = getColor(ri);
                        return (
                            <React.Fragment key={r.ruas_jalan_id}>
                                {r.segments.map((seg, si) => {
                                    if (!seg.koordinat || seg.koordinat.length < 2) return null;
                                    const path = seg.koordinat;
                                    const midPoint = path[Math.floor(path.length / 2)];
                                    return (
                                        <Polyline
                                            key={`${r.ruas_jalan_id}-${si}`}
                                            path={path}
                                            options={{
                                                strokeColor: color,
                                                strokeWeight: 4,
                                                strokeOpacity: 0.9,
                                            }}
                                            onClick={() =>
                                                setSelected({
                                                    ruas_id: r.ruas_jalan_id,
                                                    nm_ruas: r.nm_ruas,
                                                    segment: seg.segment_ke,
                                                    posisi: midPoint,
                                                })
                                            }
                                        />
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}

                    {selected && selected.posisi && (
                        <InfoWindow position={selected.posisi} onCloseClick={() => setSelected(null)}>
                            <div className="p-2 text-sm">
                                <h2 className="font-semibold text-gray-800">🛣️ {selected.nm_ruas}</h2>
                                <p className="text-gray-600">Segment ke-{selected.segment}</p>
                                <p className="text-xs text-gray-500">ID: {selected.ruas_id}</p>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </div>
        </>
    );
}

function getColor(index: number) {
    const colors = ['#FF0000', '#00BFFF', '#32CD32', '#FFA500', '#8A2BE2', '#FF1493', '#FFD700', '#1E90FF', '#008000', '#FF7F50'];
    return colors[index % colors.length];
}
