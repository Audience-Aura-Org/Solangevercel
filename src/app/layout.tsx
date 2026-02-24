import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import { Quicksand } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/ui/LayoutShell";
import ClientWrapper from "@/components/ui/ClientWrapper";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const poppins = Poppins({ weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins", subsets: ["latin"] });
const quicksand = Quicksand({ variable: "--font-quicksand", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solange | Premium Hair Services",
  description: "Experience premium services at Solange. Book your appointment online.",
  keywords: "hair braiding, salon, appointments, braids, styling",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${poppins.variable} ${quicksand.variable}`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className="bg-dark text-light antialiased selection:bg-primary selection:text-dark">
        <ClientWrapper>
          <LayoutShell>{children}</LayoutShell>
        </ClientWrapper>
      </body>
    </html>
  );
}
