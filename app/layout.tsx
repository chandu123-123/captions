import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/Navbar';
import AuthProvider from '@/components/AuthProvider';
import StoreProvider from "@/app/StoreProvider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Caption Generator | Professional Video Captions & Subtitles',
  description: 'Generate professional captions and subtitles for your videos. Support for multiple languages, timestamp editing, and SRT file export.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <StoreProvider>
          {children}
          </StoreProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}