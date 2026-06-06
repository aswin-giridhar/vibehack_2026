"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Craving, Recommendation } from "../../lib/blindbite-types";

// Strip Leaflet's broken default-icon URL resolution (we use divIcons everywhere anyway)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "",
  iconRetinaUrl: "",
  shadowUrl: "",
});

function cravingIcon(text: string) {
  return L.divIcon({
    className: "",
    iconSize: [120, 36],
    iconAnchor: [60, 18],
    html: `
      <div style="display:flex;align-items:center;gap:6px;transform:translateX(-50%);">
        <span class="craving-pulse" style="display:inline-flex;width:14px;height:14px;border-radius:9999px;background:#C0392B;border:2px solid white;box-shadow:0 4px 12px rgba(0,0,0,.25);"></span>
        <span style="background:#C0392B;color:white;font-size:11px;font-weight:600;padding:4px 10px;border-radius:9999px;white-space:nowrap;font-family:Inter,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.15);">🔥 ${escape(text)}</span>
      </div>`,
  });
}

function recIcon(r: Recommendation) {
  const isBest = r.is_best_match;
  const ai = r.is_ai_generated;
  const label = ai ? "🤖 ai pick" : `@${r.recommender_name}`;
  const ring = isBest
    ? "box-shadow:0 0 0 3px #C8F135, 0 6px 16px rgba(0,0,0,.25);"
    : "box-shadow:0 4px 14px rgba(0,0,0,.2);";
  return L.divIcon({
    className: "",
    iconSize: [140, 32],
    iconAnchor: [70, 16],
    html: `
      <div style="transform:translateX(-50%);display:inline-flex;align-items:center;gap:6px;background:#0D0D0D;color:white;font-size:11px;font-weight:600;padding:5px 10px 5px 6px;border-radius:9999px;font-family:Inter,sans-serif;${ring}">
        <span style="background:white;color:#0D0D0D;border-radius:9999px;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;">${ai ? "🤖" : "🍴"}</span>
        <span style="white-space:nowrap;">${escape(label)}</span>
        ${isBest ? '<span style="color:#C8F135;">✨</span>' : ""}
      </div>`,
  });
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

export type MapViewProps = {
  center: { lat: number; lng: number };
  craving?: Craving | null;
  recommendations?: Recommendation[];
  cravings?: Craving[]; // recommender mode — show many craving pins
  onPickRec?: (r: Recommendation) => void;
  onPickCraving?: (c: Craving) => void;
};

export function MapView(props: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-full w-full animate-pulse bg-[#ece5d8]" aria-hidden />
    );
  }

  const { center, craving, recommendations = [], cravings = [], onPickRec, onPickCraving } = props;

  return (
    <div className="warm-map h-full w-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={center.lat} lng={center.lng} />

        {craving && (
          <Marker
            position={[craving.latitude, craving.longitude]}
            icon={cravingIcon(craving.text.length > 28 ? craving.text.slice(0, 26) + "…" : craving.text)}
            eventHandlers={onPickCraving ? { click: () => onPickCraving(craving) } : undefined}
          />
        )}

        {cravings.map((c) => (
          <Marker
            key={c.id}
            position={[c.latitude, c.longitude]}
            icon={cravingIcon(c.text.length > 28 ? c.text.slice(0, 26) + "…" : c.text)}
            eventHandlers={onPickCraving ? { click: () => onPickCraving(c) } : undefined}
          />
        ))}

        {recommendations.map((r) => (
          <Marker
            key={r.id}
            position={[r.latitude, r.longitude]}
            icon={recIcon(r)}
            eventHandlers={onPickRec ? { click: () => onPickRec(r) } : undefined}
          />
        ))}
      </MapContainer>
    </div>
  );
}