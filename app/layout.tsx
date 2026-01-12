import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextAuthProvider } from "@/components/session-provider";
import { getBranding, getBrandingCssVars } from "@/lib/branding";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Dynamic metadata based on branding configuration
export async function generateMetadata(): Promise<Metadata> {
  const branding = getBranding();
  const targetDomain = process.env.TARGET_DOMAIN || 'your site';

  return {
    title: `${branding.name} - ${targetDomain}`,
    description: `Performance monitoring dashboard for ${targetDomain}`,
    icons: {
      icon: branding.faviconPath,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandCssVars = getBrandingCssVars();

  return (
    <html lang="en" style={brandCssVars as React.CSSProperties}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
