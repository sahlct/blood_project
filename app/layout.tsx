import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "BloodLife Network | Kerala Voluntary Blood Donation Portal",
  description:
    "Every Drop Can Save a Life. Connect with verified voluntary blood donors, locate upcoming donation camps, and post emergency blood requests across Kerala.",
  keywords: [
    "blood donation",
    "kerala blood donors",
    "blood bank kerala",
    "emergency blood request",
    "voluntary blood donor",
    "O negative donor",
    "blood donation camp",
  ],
  authors: [{ name: "BloodLife Network" }],
  openGraph: {
    title: "BloodLife Network | Kerala Voluntary Blood Donation Portal",
    description: "Every Drop Can Save a Life. Find voluntary blood donors and donation camps.",
    siteName: "BloodLife",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
