import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { GoogleMap, InfoWindow, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useState } from 'react';

const containerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '12px',
};

export default function Show() {
    const { ruas }: any = usePage().props;
    const [selected, setSelected] = useState<any>(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    // Default center (kalau koordinat tersedia, pakai itu)
    const center =
        ruas.Koord_Y_Aw && ruas.Koord_X_Aw ? { lat: parseFloat(ruas.Koord_Y_Aw), lng: parseFloat(ruas.Koord_X_Aw) } : { lat: -3.0, lng: 103.0 };

    const renderPolyline = useCallback(() => {
        let path: { lat: number; lng: number }[] = [];

        try {
            if (ruas.koordinat_full) {
                path = JSON.parse(ruas.koordinat_full);
            } else if (ruas.Koord_X_Aw && ruas.Koord_Y_Aw && ruas.Koord_X_Ak && ruas.Koord_Y_Ak) {
                path = [
                    { lat: parseFloat(ruas.Koord_Y_Aw), lng: parseFloat(ruas.Koord_X_Aw) },
                    { lat: parseFloat(ruas.Koord_Y_Ak), lng: parseFloat(ruas.Koord_X_Ak) },
                ];
            }
        } catch (e) {
            console.error('Error parsing koordinat_full:', e);
        }

        if (path.length === 0) return null;

        return (
            <>
                <Polyline
                    path={path}
                    options={{
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                    }}
                    onClick={() => setSelected(ruas)}
                />
                <Marker position={path[0]} title="Titik Awal" />
                <Marker position={path[path.length - 1]} title="Titik Akhir" />
            </>
        );
    }, [ruas]);

    return (
        <AppLayout>
            <Head title={`Detail Ruas - ${ruas.Nm_Ruas}`} />

            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{ruas.Nm_Ruas}</h1>
                    <Link href={route('ruas-jalan.index')} className="text-blue-600 hover:underline">
                        ← Kembali ke daftar
                    </Link>
                </div>

                <div className="space-y-2 rounded-lg bg-white p-4 text-sm text-gray-800 shadow dark:bg-gray-800 dark:text-gray-100">
                    <p>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Tahun:</span> {ruas.Thn_Data}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span> {ruas.Status}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Fungsi:</span> {ruas.Fungsi}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Uraian:</span> {ruas.Ura_Dukung || '-'}
                    </p>
                </div>
                {isLoaded ? (
                    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11} mapTypeId="satellite">
                        {renderPolyline()}

                        {selected && (
                            <InfoWindow
                                position={{
                                    lat: parseFloat(ruas.Koord_Y_Ak),
                                    lng: parseFloat(ruas.Koord_X_Ak),
                                }}
                                onCloseClick={() => setSelected(null)}
                            >
                                <div className="text-sm">
                                    <h2 className="font-semibold">{ruas.Nm_Ruas}</h2>
                                    <p>{ruas.Status}</p>
                                    <p>{ruas.Fungsi}</p>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                ) : (
                    <div className="text-gray-500">Memuat peta...</div>
                )}
            </div>
        </AppLayout>
    );
}
