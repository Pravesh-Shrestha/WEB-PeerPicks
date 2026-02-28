"use client";

import React, { useMemo, useState } from "react";
import SpatialGrid from "../components/SpatialGrid";
import { MapPin, Navigation, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMediaUrl } from "@/lib/utils";

export default function NearbyPage() {
  const router = useRouter();
  const [nearbyPicks, setNearbyPicks] = useState<any[]>([]);

  const hasResults = useMemo(() => nearbyPicks.length > 0, [nearbyPicks.length]);

  return (
    <div className="min-h-screen py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">Nearby Picks</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Move the map or use <span className="text-[#D4FF33] font-semibold">My location</span> to find picks around you.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02]">
          <Navigation size={14} className="text-[#D4FF33]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">OSM Live Map</span>
        </div>
      </div>

      <SpatialGrid radius={7000} onDataLoaded={setNearbyPicks} />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#D4FF33]" />
          <h2 className="text-lg font-bold text-white">Picks in this area</h2>
        </div>

        {!hasResults ? (
          <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/[0.01]">
            <Sparkles size={20} className="mx-auto mb-2 text-zinc-500" />
            <p className="text-zinc-400 text-sm">No nearby picks found here yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyPicks.map((pick: any) => {
              const mediaUrl = getMediaUrl(pick?.mediaUrls?.[0], "pick");
              return (
                <button
                  key={pick._id}
                  type="button"
                  onClick={() => router.push(`/dashboard/picks/${pick._id}`)}
                  className="text-left p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#D4FF33]/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-zinc-900 overflow-hidden border border-white/10">
                      {mediaUrl ? (
                        <img src={mediaUrl} alt={pick.alias || "Nearby pick"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{pick.alias || "Nearby pick"}</p>
                      <p className="text-zinc-500 text-xs truncate">{pick.category || "General"}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
