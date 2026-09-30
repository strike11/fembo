import type { Metadata } from "next";
import { Geist_Mono, Nunito, Quicksand } from "next/font/google";
import { Providers } from "@/components/providers";
import { SoftRoom } from "@/components/soft-room";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fembo — chat, call, and be remembered",
  description:
    "A cute, gentle 16+ companion room. Chat, create your femboy, place a live voice call, and keep the facts they should not forget.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nunito.variable} ${quicksand.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className={`${nunito.className} relative flex min-h-full flex-col bg-background text-foreground`}>
        <SoftRoom />
        <div className="relative flex min-h-full flex-1 flex-col">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
