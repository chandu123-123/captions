import './globals.css';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/Navbar';
import AuthProvider from '@/components/AuthProvider';


const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "IndieCaptions",
  description: 'Generate professional captions and subtitles for your videos. Support for multiple languages, timestamp editing, and SRT file export.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${outfit.variable}`}>
        <AuthProvider>
          <Navbar />
        
          {children}
         
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}