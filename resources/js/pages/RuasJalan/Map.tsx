import React from "react";
import AppLayout from "@/layouts/app-layout";
import {
  GoogleMap,
  Polyline,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { usePage, Head } from "@inertiajs/react";

type Koordinat = { lat: number; lng: number };
type Segment = { segment_ke: number; koordinat: Koordinat[] };
type Ruas = { ruas_jalan_id: number; Nm_Ruas: string; segments: Segment[] };

export default function Map() {
  const page = usePage<{ ruas: Ruas[] }>();
  const ruas = page.props.ruas || [];
  const [selected, setSelected] = React.useState<any>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const firstPoint = ruas?.[0]?.segments?.[0]?.koordinat?.[0];
  const center = firstPoint || { lat: -3.0, lng: 103.0 };

  if (!isLoaded) return <div>⏳ Memuat peta...</div>;
  if (ruas.length === 0) return <div>⚠️ Tidak ada data ruas ditemukan.</div>;

  return (
    <AppLayout>
      <div className="p-6">
        <Head title="Peta Ruas Jalan" />
        <h1 className="text-2xl font-bold mb-3">🗺️ Peta Ruas Jalan</h1>

        <div className="w-full h-[600px] rounded-lg overflow-hidden shadow">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={10}
            mapTypeId="roadmap"
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
                            Nm_Ruas: r.Nm_Ruas,
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
              <InfoWindow
                position={selected.posisi}
                onCloseClick={() => setSelected(null)}
              >
                <div className="p-2 text-sm">
                  <h2 className="font-semibold text-gray-800">
                    🛣️ {selected.Nm_Ruas}
                  </h2>
                  <p className="text-gray-600">Segment ke-{selected.segment}</p>
                  <p className="text-gray-500 text-xs">
                    Ruas ID: {selected.ruas_id}
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </AppLayout>
  );
}

function getColor(index: number) {
  const colors = [
    "#FF0000",
    "#00BFFF",
    "#32CD32",
    "#FFA500",
    "#8A2BE2",
    "#FF1493",
    "#FFD700",
    "#1E90FF",
    "#008000",
    "#FF7F50",
  ];
  return colors[index % colors.length];
}
