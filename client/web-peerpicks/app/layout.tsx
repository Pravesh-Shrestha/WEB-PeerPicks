import type { Metadata } from "next";
import "./globals.css";

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
        suppressHydrationWarning={true} // Add this here
      > 
        {children}
      </body>
    </html>
  );
}
