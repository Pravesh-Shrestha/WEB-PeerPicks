import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "PeerPicks",
  description: "Community-powered ratings and reviews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className="antialiased" 
        suppressHydrationWarning={true}>
          <AuthProvider>
             {children}
            </AuthProvider> 
      </body>
    </html>
  );
}
