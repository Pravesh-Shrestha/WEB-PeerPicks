import { Metadata } from "next";
import { PickProvider } from "@/app/context/PickContext";

export const metadata: Metadata = {
  title: "Registry Terminal | Admin",
};

export default function PicksSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    // We wrap the children here so any pick-related sub-pages 
    // (like /admin/picks/[id]) share the same data state.
    <PickProvider initialPicks={[]}>
      <div className="w-full h-full min-h-screen bg-[#050505]">
        {children}
      </div>
    </PickProvider>
  );
}