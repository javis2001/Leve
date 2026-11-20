import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/500-italic.css";
import "./globals.css";
import { Toaster } from "sonner";
import { ConsentBanner } from "@/components/tracking/consent-banner";
import { TrackingScripts } from "@/components/tracking/tracking-scripts";
import { SITE_URL } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Vida Leve — Sua jornada de bem-estar", template: "%s · Vida Leve" },
  description:
    "Uma jornada de 30 dias com receitas práticas, exercícios para fazer em casa e ferramentas para cuidar melhor de você. 100% digital e para iniciantes.",
  applicationName: "Vida Leve",
  openGraph: {
    title: "Vida Leve — Uma vida mais leve começa com pequenos passos",
    description: "Jornada de 30 dias, 50 receitas, exercícios em casa, planner de hábitos e diário de bem-estar.",
    locale: "pt_BR",
    type: "website",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0B6249",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster position="top-center" toastOptions={{ classNames: { toast: "!rounded-2xl !border-line !font-sans", title: "!font-bold" } }} />
        <ConsentBanner />
        <TrackingScripts />
      </body>
    </html>
  );
}
