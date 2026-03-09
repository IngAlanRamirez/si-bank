import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { PWARegister } from "@/components/PWARegister";
import { SplashWrapper } from "@/components/SplashWrapper";

export const viewport: Viewport = {
  themeColor: "#39ff14",
};

export const metadata: Metadata = {
  title: "Si! Bank — Banco 100% digital",
  description:
    "Simplifica cómo administras tu dinero. Cuenta digital, transferencias, pagos y estadísticas en tiempo real.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Si! Bank",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <SplashWrapper>
            {children}
          </SplashWrapper>
          <PWARegister />
        </AuthProvider>
      </body>
    </html>
  );
}
