import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({ label, value, trend, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl group hover:border-[#D4FF33]/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-black border border-white/5 text-zinc-400 group-hover:text-[#D4FF33] transition-colors">
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-bold text-[#D4FF33] bg-[#D4FF33]/10 px-2 py-1 rounded-md font-mono">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-white italic">{value}</h3>
      </div>
    </div>
  );
}