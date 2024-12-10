"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { ArrowRight, Languages, Clock, Sparkles } from "lucide-react";

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

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 p-10">
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight lg:text-6xl">
                Professional Captions for{" "}
                <span className="text-primary">Every Video</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Transform your content with AI-powered captions. Support multiple languages,
                phonetic transcription, and professional translations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => signIn("google")}>
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#demo">Watch Demo</a>
              </Button>
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="space-y-2">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:ml-auto">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1633114127188-99b4dd741180?auto=format&fit=crop&q=80&w=800"
                alt="Video editing workspace"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-lg shadow-lg max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Trusted by creators</p>
                    <p className="text-xs text-muted-foreground">
                      Join thousands of content creators
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}