import type { Metadata } from "next";
import { Inter, Instrument_Serif, Bagel_Fat_One } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BottomNav } from "@/components/shared/BottomNav";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-google",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif-google",
  display: "swap",
});

const display = Bagel_Fat_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-google",
  display: "swap",
});

export const metadata: Metadata = {
  title: "blindbite — post a craving, get fed",
  description:
    "post a craving, get hand-picked spots from people who actually go. a map for taste, not for tourists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${display.variable}`}
    >
      <body>
        <Providers>
          <div className="relative min-h-screen bg-background text-foreground">
            {children}
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
