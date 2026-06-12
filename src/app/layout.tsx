import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ToastNotificationHandler } from "@/components/ToastNotificationHandler";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chimney Doctors | Professional Chimney Services",
  description: "Top-rated chimney installation, cleaning, and repair services at your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <ToastNotificationHandler />
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            style: { fontFamily: 'var(--font-inter)', borderRadius: '14px' },
          }}
        />
      </body>
    </html>
  );
}
