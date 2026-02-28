"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '@/lib/api/axios'; //
import { API } from '@/lib/api/endpoints'; //
import { Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Setup custom marker icon
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

/**
 * Listener to fetch new data when the user moves the map
 */
function MapScout({ onMove }: { onMove: (lat: number, lng: number) => void }) {
    useMapEvents({
        moveend: (e) => {
            const center = e.target.getCenter();
            onMove(center.lat, center.lng);
        },
    });
    return null;
}

function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);

    return null;
}

interface SpatialGridProps {
    radius?: number;
    onDataLoaded?: (picks: any[]) => void;
}

export default function SpatialGrid({ radius = 5000, onDataLoaded }: SpatialGridProps) {
    const router = useRouter();
    const [picks, setPicks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tileError, setTileError] = useState(false);
    const [locationInfo, setLocationInfo] = useState<string | null>(null);
    const requestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastRequestKeyRef = useRef<string>("");
    
    // Initial coordinates (e.g., center of your target city)
    const [center, setCenter] = useState<[number, number]>([40.7128, -74.0060]); 

    const fetchNearbySignals = useCallback(async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const response: any = await axiosInstance.get(API.MAP.NEARBY, { //
                params: { lat, lng, radius }
            });
            const nextPicks = response?.success ? (response.data || []) : [];
            setPicks(nextPicks);
            onDataLoaded?.(nextPicks);
        } catch (err) {
            console.error("Spatial fetch failed:", err);
            setPicks([]);
            onDataLoaded?.([]);
        } finally {
            setLoading(false);
        }
    }, [onDataLoaded, radius]);

    const requestNearbySignals = useCallback((lat: number, lng: number) => {
        const roundedLat = Number(lat.toFixed(4));
        const roundedLng = Number(lng.toFixed(4));
        const requestKey = `${roundedLat}:${roundedLng}:${radius}`;

        if (requestKey === lastRequestKeyRef.current) {
            return;
        }

        if (requestTimerRef.current) {
            clearTimeout(requestTimerRef.current);
        }

        requestTimerRef.current = setTimeout(() => {
            lastRequestKeyRef.current = requestKey;
            fetchNearbySignals(roundedLat, roundedLng);
        }, 500);
    }, [fetchNearbySignals, radius]);

    useEffect(() => {
        requestNearbySignals(center[0], center[1]);

        return () => {
            if (requestTimerRef.current) {
                clearTimeout(requestTimerRef.current);
            }
        };
    }, [center, requestNearbySignals]);

    const locateMe = () => {
        if (!navigator.geolocation) {
            setLocationInfo("Location is not supported in this browser.");
            return;
        }

        setLocationInfo("Allow location access to show picks around you.");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const nextCenter: [number, number] = [position.coords.latitude, position.coords.longitude];
                setCenter(nextCenter);
                setLocationInfo("Showing picks near your current location.");
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationInfo("Location permission denied. Enable it to see nearby picks.");
                    return;
                }
                setLocationInfo("Could not get your location right now.");
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    return (
        <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-white/10 relative z-0">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <RecenterMap center={center} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                    eventHandlers={{
                        tileerror: () => setTileError(true),
                    }}
                />

                <MapScout onMove={requestNearbySignals} />

                {picks.map((pick: any) => (
                    <Marker 
                        key={pick._id} 
                        // MongoDB stores [lng, lat], Leaflet needs [lat, lng]
                        position={[pick.location.coordinates[1], pick.location.coordinates[0]]} 
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="p-2 text-black">
                                <h3 className="font-bold text-xs uppercase">{pick.alias}</h3>
                                <p className="text-[10px] text-gray-600">{pick.category}</p>
                                <button
                                    type="button"
                                    className="mt-2 text-[10px] font-bold text-blue-700 underline"
                                    onClick={() => router.push(`/dashboard/picks/${pick._id}`)}
                                >
                                    Open pick
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <button
                type="button"
                onClick={locateMe}
                title="Use my current location"
                aria-label="Use my current location"
                className="absolute bottom-4 right-4 z-[1000] bg-black/85 px-3 py-2 rounded-full border border-white/20 text-white text-[10px] font-bold flex items-center gap-2"
            >
                <Navigation size={12} />
                My location
            </button>
            
            {loading && (
                <div className="absolute top-4 right-4 z-[1000] bg-black/80 px-3 py-1 rounded-full border border-[#D4FF33]/50">
                    <span className="text-[10px] font-black text-[#D4FF33] animate-pulse">SCANNING AREA...</span>
                </div>
            )}

            {tileError && (
                <div className="absolute top-4 left-4 z-[1000] bg-red-500/20 px-3 py-1 rounded-full border border-red-500/40">
                    <span className="text-[10px] font-bold text-red-300">Map tiles failed to load.</span>
                </div>
            )}

            {locationInfo && (
                <div className="absolute bottom-16 right-4 z-[1000] bg-black/80 px-3 py-2 rounded-xl border border-white/20 max-w-[260px]">
                    <span className="text-[10px] font-semibold text-zinc-200">{locationInfo}</span>
                </div>
            )}
        </div>
    );
}