"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '@/lib/api/axios'; //
import { API } from '@/lib/api/endpoints'; //
import { Navigation, MapPin } from 'lucide-react';

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

export default function SpatialGrid() {
    const [picks, setPicks] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Initial coordinates (e.g., center of your target city)
    const [center] = useState<[number, number]>([40.7128, -74.0060]); 

    const fetchNearbySignals = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(API.MAP.NEARBY, { //
                params: { lat, lng, radius: 5000 }
            });
            if (data.success) setPicks(data.data);
        } catch (err) {
            console.error("Spatial fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-white/10 relative z-0">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                />

                <MapScout onMove={fetchNearbySignals} />

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
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            
            {loading && (
                <div className="absolute top-4 right-4 z-[1000] bg-black/80 px-3 py-1 rounded-full border border-[#D4FF33]/50">
                    <span className="text-[10px] font-black text-[#D4FF33] animate-pulse">SCANNING AREA...</span>
                </div>
            )}
        </div>
    );
}