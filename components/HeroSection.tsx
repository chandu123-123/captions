"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { 
  ArrowRight, 
  Languages, 
  Clock, 
  Sparkles, 
  FileAudio, 
  FileText, 
  Globe2, 
  Upload,
  Headphones,
  Type
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Languages className="h-6 w-6" />,
    title: "Multiple Languages",
    description: "Support for 20+ languages with accurate translations",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Time-Saving",
    description: "Generate captions in minutes, not hours",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Phonetic Support",
    description: "Unique phonetic transcription for better accessibility",
  },
];

const steps = [
  {
    icon: <Upload className="h-8 w-8 text-primary" />,
    title: "Upload Audio",
    description: "Upload your audio file in any MP3, WAV",
  },
  {
    icon: <Headphones className="h-8 w-8 text-primary" />,
    title: "Process Audio",
    description: "Our AI analyzes and transcribes your content",
  },
  {
    icon: <Type className="h-8 w-8 text-primary" />,
    title: "Get Captions",
    description: "Download perfectly timed captions in your language",
  },
];

export default function HeroSection() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (session?.user) {
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      signIn("google");
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-10 p-10">
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl font-bold tracking-tight lg:text-6xl"
              >
                Transform Audio into{" "}
                <span className="text-primary">Readable Captions</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground"
              >
                Upload your audio, get instant captions in any language. Perfect for content creators, educators, and professionals.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" onClick={handleClick} className="group">
                {session?.user ? "Start Captioning" : "Get Started Free"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#demo">See How It Works</a>
              </Button>
            </motion.div>

            {/* Steps Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 bg-card rounded-xl p-6"
            >
              {steps.map((step, index) => (
                <div key={step.title} className="flex flex-col items-center text-center space-y-3">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden sm:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-primary/40" />
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative lg:ml-auto hidden lg:block"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1633114127188-99b4dd741180?auto=format&fit=crop&q=80&w=800"
                alt="Video editing workspace"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-lg shadow-lg max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Globe2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">20+ Languages</p>
                    <p className="text-xs text-muted-foreground">
                      Translate to any language
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}