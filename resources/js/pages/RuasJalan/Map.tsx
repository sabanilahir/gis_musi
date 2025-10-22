import React, { useCallback, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
  GoogleMap,
  Polyline,
  Marker,
  useJsApiLoader,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
};

// Palet warna biar tiap ruas beda
const colors = ["#FF0000", "#00BFFF", "#32CD32", "#FFA500", "#8A2BE2", "#FF1493"];

export default function MapView() {
  const { ruas }: any = usePage().props;
  const [selected, setSelected] = useState<any>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const center = { lat: -3.0, lng: 103.0 };

  const renderPolylines = useCallback(() => {
    if (!ruas || ruas.length === 0) return null;

    return ruas.map((r: any, index: number) => {
      let path: { lat: number; lng: number }[] = [];

      try {
        if (r.koordinat_full) {
          path = JSON.parse(r.koordinat_full);
        } else if (r.Koord_X_Aw && r.Koord_Y_Aw && r.Koord_X_Ak && r.Koord_Y_Ak) {
          path = [
            { lat: parseFloat(r.Koord_Y_Aw), lng: parseFloat(r.Koord_X_Aw) },
            { lat: parseFloat(r.Koord_Y_Ak), lng: parseFloat(r.Koord_X_Ak) },
          ];
        }
      } catch (e) {
        console.error("Error parsing koordinat_full:", e);
      }

      if (path.length === 0) return null;

      const color = colors[index % colors.length];

      return (
        <React.Fragment key={r.id}>
          <Polyline
            path={path}
            options={{
              strokeColor: color,
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
            onClick={() => setSelected(r)}
          />

          {/* Marker awal */}
          <Marker
            position={path[0]}
            title={`Awal: ${r.Nm_Ruas}`}
            onClick={() => setSelected(r)}
          />

          {/* Marker akhir */}
          <Marker
            position={path[path.length - 1]}
            title={`Akhir: ${r.Nm_Ruas}`}
            onClick={() => setSelected(r)}
          />
        </React.Fragment>
      );
    });
  }, [ruas]);

  return (
    <AppLayout>
      <Head title="Peta Ruas Jalan" />

      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">🗺️ Peta Ruas Jalan</h1>
        <p className="text-gray-600">
          Menampilkan hasil import file KMZ dari database.
        </p>

        {isLoaded ? (
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={9}>
            {renderPolylines()}

            {selected && (
              <InfoWindow
                position={{
                  lat: parseFloat(selected.Koord_Y_Ak),
                  lng: parseFloat(selected.Koord_X_Ak),
                }}
                onCloseClick={() => setSelected(null)}
              >
                <div className="p-2 text-sm">
                  <h2 className="font-semibold text-lg">{selected.Nm_Ruas}</h2>
                  <p>🛣️ {selected.Kl_Dat_Das}</p>
                  <p>📅 Tahun: {selected.Thn_Data}</p>
                  <p>📍 Status: {selected.Status}</p>
                  <p>🏗️ Fungsi: {selected.Fungsi}</p>
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
