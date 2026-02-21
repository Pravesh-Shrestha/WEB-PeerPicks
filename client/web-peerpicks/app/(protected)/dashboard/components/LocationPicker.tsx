"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Search, Navigation, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

// Sub-component for instant map positioning (No flying/sliding)
function MapController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      // setView with animate: false provides an instant jump
      map.setView(target, 17, { animate: false });
    }
  }, [target, map]);
  return null;
}

// Click handler with built-in protection
function ClickHandler({ onLocationSelect, setTarget }: any) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setTarget([lat, lng]);

      try {
        // Reverse geocode
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { "User-Agent": "PeerPicks/1.0" } },
        );
        const data = await res.json();
        const name = data.display_name?.split(",")[0] || "Pinned Location";
        onLocationSelect(lat, lng, name);
      } catch (err) {
        onLocationSelect(lat, lng, "Custom Marker");
      }
    },
  });
  return null;
}

export default function LocationPicker({
  onLocationSelect,
}: LocationPickerProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [target, setTarget] = useState<[number, number] | null>(null);

  // Ref to store the timeout ID for debouncing
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const executeSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`,
          {
            headers: { "User-Agent": "PeerPicks/1.0 (contact@yourdomain.com)" },
          },
        );

        if (res.status === 429) {
          toast.error("SYSTEM RATE LIMITED", {
            description: "Please wait a moment.",
          });
          return;
        }

        const data = await res.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const name = data[0].display_name.split(",")[0];

          setTarget([lat, lon]);
          onLocationSelect(lat, lon, name);
        } else {
          toast.error("LOCATION NOT FOUND");
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [onLocationSelect],
  );

  // Handle input changes with 800ms debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Only auto-search if query is long enough
    if (value.length > 2) {
      debounceTimer.current = setTimeout(() => {
        executeSearch(value);
      }, 800); // 800ms delay to respect Nominatim's 1 req/sec policy
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setTarget([latitude, longitude]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "User-Agent": "PeerPicks/1.0" } },
          );
          const data = await res.json();
          onLocationSelect(
            latitude,
            longitude,
            data.display_name?.split(",")[0] || "Current Location",
          );
        } catch {
          onLocationSelect(latitude, longitude, "My Location");
        }
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className="w-full h-full relative group">
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
                e.preventDefault();
                executeSearch(query);
              }
            }}
            placeholder="Search venue to rate..."
            className="w-full bg-[#121214]/95 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-[#D4FF33]/50 transition-all shadow-2xl"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4FF33]"
            size={16}
          />
          {loading && (
            <Loader2
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 animate-spin"
              size={16}
            />
          )}
        </div>
        <button
          type="button"
          onClick={handleGeolocation}
          className="bg-[#D4FF33] text-black p-4 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center min-w-[56px]"
        >
          {geoLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Navigation size={18} fill="black" />
          )}
        </button>
      </div>

      <MapContainer
        // 1. USE A STABLE KEY: This prevents the "Map container being reused" error
        // during Fast Refresh by ensuring a fresh start if the component remounts.
        key="peer-picks-map"
        center={[27.7172, 85.324]}
        zoom={13}
        zoomControl={false}
        className="h-full w-full"
        // 2. STYLES: Ensure the container has explicit height
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController target={target} />
        <ClickHandler
          onLocationSelect={onLocationSelect}
          setTarget={setTarget}
        />
        {target && <Marker position={target} />}
      </MapContainer>
    </div>
  );
}
