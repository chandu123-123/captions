import './globals.css';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/Navbar';
import AuthProvider from '@/components/AuthProvider';
import Footer from '@/components/Footer';


const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: 'IndieCaptions',
  description: 'Generate professional captions and subtitles for your videos. Support for multiple languages, timestamp editing, and SRT file export. Perfect for content creators and video editors.',
  keywords: 'caption generator, subtitle generator, video captions, SRT file generator, video editing tools, professional subtitles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${outfit.variable} min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}