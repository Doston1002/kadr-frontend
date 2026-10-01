import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kadr — Davomat tizimi",
  description: "Telegram Bot orqali xodimlar davomatini boshqarish",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full font-sans antialiased text-[var(--ink)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
