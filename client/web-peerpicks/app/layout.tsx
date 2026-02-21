import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "PeerPicks",
  description: "Community-powered ratings and reviews",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#09090B]" suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          
          {/* Global Toast Manager - Moved to Top */}
          <Toaster 
            position="top-center" // OR "top-right"
            toastOptions={{
              style: {
                background: "#09090B",
                border: "1px solid rgba(212, 255, 51, 0.2)", // Subtle brand-green glow
                color: "#fff",
                borderRadius: "1rem",
                padding: "1rem 1.5rem",
                marginTop: "1.5rem", // Adds clearance from top of screen
              },
              className: "font-black text-[10px] tracking-[0.3em] uppercase",
            }}
          />
        </AuthProvider> 
      </body>
    </html>
  );
}
