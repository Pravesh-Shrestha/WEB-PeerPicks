import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google"; // Professional Font Pairing
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext"; 
import { NotificationProvider } from "./context/NotificationContext";
import { Toaster } from 'sonner';

// Load Inter for clean, professional body text
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

// Load Archivo for high-impact, technical headers
const archivo = Archivo({ 
  subsets: ["latin"], 
  variable: "--font-archivo",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PeerPicks",
  description: "Community-powered ratings and reviews",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${archivo.variable}`}>
      <body className="antialiased bg-[#09090B] font-sans text-zinc-300" suppressHydrationWarning={true}>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
            
            {/* Optimized Global Toast Manager with Professional Typography */}
            <Toaster 
              position="top-center" 
              theme="dark"
              expand={false}
              duration={4000}
              toastOptions={{
                unstyled: true,
                classNames: {
                  // Using font-display (Archivo) for that technical system feel
                  toast: 'font-display w-full md:min-w-[400px] flex items-center gap-4 p-5 rounded-[1.5rem] border shadow-2xl backdrop-blur-md transition-all duration-300 mt-6',
                  title: 'text-[11px] font-black uppercase tracking-[0.2em] italic',
                  description: 'font-sans text-[10px] font-medium leading-relaxed opacity-90 tracking-normal normal-case',
                  success: 'bg-green-500/10 border-green-500/50 text-green-400',
                  error: 'bg-red-500/10 border-red-500/50 text-red-500',
                  info: 'bg-[#D4FF33]/10 border-[#D4FF33]/50 text-[#D4FF33]',
                  warning: 'bg-orange-500/10 border-orange-500/50 text-orange-400',
                },
              }}
            />
          </AuthProvider>
        </LanguageProvider> 
      </body>
    </html>
  );
}