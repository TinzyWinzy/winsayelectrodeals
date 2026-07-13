import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://winsayelectrodeals.co.zw"),
  title: {
    default: "Winsay Electrodeals - Solar Instant Quotes Zimbabwe",
    template: "%s | Winsay Electrodeals",
  },
  description:
    "Get an instant solar quote for your home in under 3 minutes. No site visit needed. Pay after installation options available. Trusted solar installer in Zimbabwe.",
  keywords: [
    "solar",
    "solar panels",
    "solar installation",
    "Zimbabwe",
    "Harare",
    "solar quote",
    "solar energy",
    "pay after install",
    "EcoCash",
    "PayNow",
    "battery",
    "inverter",
  ],
  authors: [{ name: "Winsay Electrodeals" }],
  creator: "Winsay Electrodeals",
  openGraph: {
    type: "website",
    locale: "en_ZW",
    url: "https://winsayelectrodeals.co.zw",
    siteName: "Winsay Electrodeals",
    title: "Winsay Electrodeals - Solar Instant Quotes",
    description:
      "Get an instant solar quote for your home in under 3 minutes. Pay after installation available.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Winsay Electrodeals - Solar Power for Every Home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Winsay Electrodeals - Solar Instant Quotes",
    description:
      "Get an instant solar quote for your home in under 3 minutes.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Winsay",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#07091a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="canonical" href="https://winsayelectrodeals.co.zw" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-primary" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
