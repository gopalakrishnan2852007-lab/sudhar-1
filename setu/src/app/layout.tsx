import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SETU",
  description: "Your Voice, Your Rights, Your Language. Sovereign Electronic Terminal for the Underprivileged.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0A192F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-textMain min-h-screen flex flex-col overscroll-none`}>
        <main className="flex-1 overflow-y-auto pb-24 px-4 pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}
