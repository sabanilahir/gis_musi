import React, { useMemo, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
  GoogleMap,
  Polyline,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
};

export default function Show() {
  const { ruas }: any = usePage().props;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [showInfo, setShowInfo] = useState(true); // kontrol popup InfoWindow

  const koordinat = ruas.koordinat || [];

  // 🔹 Kelompokkan berdasarkan segment_ke
  const segments = useMemo(() => {
    const grouped: Record<number, any[]> = {};
    koordinat.forEach((k: any) => {
      const seg = k.segment_ke || 1;
      if (!grouped[seg]) grouped[seg] = [];
      grouped[seg].push({
        lat: parseFloat(k.latitude),
        lng: parseFloat(k.longitude),
      });
    });
    return Object.values(grouped);
  }, [koordinat]);

  const allPoints = koordinat.map((k: any) => ({
    lat: parseFloat(k.latitude),
    lng: parseFloat(k.longitude),
  }));

  const center =
    allPoints.length > 0
      ? allPoints[Math.floor(allPoints.length / 2)]
      : { lat: -3.0, lng: 103.0 };

  const handleBack = () => window.history.back();

  return (
    <AppLayout>
      <Head title={`Peta ${ruas.nm_ruas}`} />

      <div className="p-6 space-y-6">
        {/* Header: Judul & Tombol Kembali */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              {ruas.nm_ruas}
            </h1>
            {ruas.keterangan && (
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                {ruas.keterangan}
              </p>
            )}
          </div>

          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Kembali
          </button>
        </div>

        {/* Keterangan Ruas */}
        <div
          className="p-4 rounded-xl shadow border transition-colors duration-300
          bg-white dark:bg-gray-800 dark:text-gray-100 text-sm md:text-base"
        >
          <p><strong>Tahun:</strong> {ruas.thn_data}</p>
          <p><strong>Status:</strong> {ruas.status}</p>
          <p><strong>Fungsi:</strong> {ruas.fungsi}</p>
          <p><strong>Jumlah Koordinat:</strong> {koordinat.length} titik</p>
          <p><strong>Jumlah Segmen:</strong> {segments.length}</p>
        </div>

        {/* Peta */}
        <div>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={12}
            >
              {segments.map((seg, idx) => (
                <Polyline
                  key={idx}
                  path={seg}
                  options={{
                    strokeColor: "#007BFF",
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                  }}
                />
              ))}

              {/* Titik awal dan akhir */}
              {allPoints.length > 0 && (
                <>
                  <Marker
                    position={allPoints[0]}
                    label="Awal"
                    onClick={() => setShowInfo(true)}
                  />
                  <Marker
                    position={allPoints[allPoints.length - 1]}
                    label="Akhir"
                  />

                  {/* Popup InfoWindow untuk Nama Ruas */}
                  {showInfo && (
                    <InfoWindow
                      position={allPoints[0]}
                      onCloseClick={() => setShowInfo(false)}
                    >
                      <div className="text-gray-800 text-sm font-medium">
                        📍 {ruas.nm_ruas}
                      </div>
                    </InfoWindow>
                  )}
                </>
              )}
            </GoogleMap>
          ) : (
            <div className="text-gray-500 text-center py-10">
              Memuat peta...
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
