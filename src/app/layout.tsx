import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Okoa Malebo - Beat Cravings in Real Time",
  description: "Zero-stigma digital recovery platform for chemical dependency in Kenya. Anonymous, offline-first, harm reduction focused.",
  keywords: ["recovery", "addiction", "sobriety", "Kenya", "harm reduction", "cravings", "mental health"],
  authors: [{ name: "Okoa Malebo Team" }],
  openGraph: {
    title: "Okoa Malebo - Ponda Raha, Sio Malebo",
    description: "Beat cravings in real time with SOS support, recovery tracking, and community.",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1c2b25",
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" className="h-full bg-[#e9e7e3] antialiased" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1c2b25" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full bg-[#e9e7e3] text-[var(--foreground)] antialiased">
        <div className="mx-auto flex min-h-[100dvh] w-full flex-col bg-[var(--background)] app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
