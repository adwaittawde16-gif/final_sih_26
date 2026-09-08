"use client";

import React, { useEffect, useRef, useState } from "react";
import { GeoPoint } from "@/types";
import { Card } from "@/components/ui/card";
import { MapPin, Layers } from "lucide-react";

declare global {
  interface Window {
    L: any;
  }
}

interface LeafletMapViewProps {
  points: GeoPoint[];
  title?: string;
  subtitle?: string;
  height?: string;
}

export function LeafletMapView({
  points,
  title = "Tactical GPS Location Visualizer",
  subtitle = "Interactive Leaflet map showing real-time GPS coordinates of CCTV sightings, nocturnal cell towers, and surveillance spots.",
  height = "420px"
}: LeafletMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load Leaflet CSS & JS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!window.L && !document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else if (window.L) {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current && window.L) {
      renderMarkers();
    }
  }, [points, activeCategory, mapLoaded]);

  function initMap() {
    if (!mapRef.current || mapInstanceRef.current || !window.L) return;

    // Default center: Mumbai (18.9780, 72.8300)
    const map = window.L.map(mapRef.current).setView([18.9780, 72.8300], 13);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapLoaded(true);
    renderMarkers();
  }

  function renderMarkers() {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof window.L.CircleMarker || layer instanceof window.L.Marker) {
        map.removeLayer(layer);
      }
    });

    const filtered = activeCategory === "ALL"
      ? points
      : points.filter(p => p.category.toUpperCase() === activeCategory.toUpperCase());

    const bounds: [number, number][] = [];

    filtered.forEach((pt) => {
      bounds.push([pt.lat, pt.lng]);
      const circle = window.L.circleMarker([pt.lat, pt.lng], {
        radius: 7,
        fillColor: pt.color || "#3b82f6",
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      });

      const popupContent = `
        <div style="font-family: monospace; font-size: 11px; padding: 2px;">
          <strong style="color: #0f172a; font-size: 12px;">${pt.title}</strong><br/>
          <span style="color: #64748b;">${pt.timestamp}</span><br/>
          <p style="margin-top: 4px; color: #334155; font-family: sans-serif;">${pt.details}</p>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.addTo(map);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  return (
    <Card className="space-y-3 border-slate-300 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            {title} ({points.length} GPS Markers)
          </h3>
          <p className="text-[11px] font-mono text-slate-500">{subtitle}</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {["ALL", "CCTV", "NOCTURNAL", "SURVEILLANCE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Map Div */}
      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className="rounded-xl border border-slate-200 shadow-inner z-0 overflow-hidden"
      />
    </Card>
  );
}
