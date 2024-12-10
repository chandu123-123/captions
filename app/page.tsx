import { Metadata } from 'next';
import CaptionGenerator from '@/components/CaptionGenerator';
import HeroSection from '@/components/HeroSection';

export const metadata: Metadata = {
  title: 'Caption Generator | Professional Video Captions & Subtitles',
  description: 'Generate professional captions and subtitles for your videos. Support for multiple languages, timestamp editing, and SRT file export. Perfect for content creators and video editors.',
  keywords: 'caption generator, subtitle generator, video captions, SRT file generator, video editing tools, professional subtitles',
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className="container py-16 flex-col justify-center items-center">
        <CaptionGenerator />
      </div>
    </main>
  );
}