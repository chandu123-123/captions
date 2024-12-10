"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useState } from 'react';

export default function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="aspect-video relative bg-black/5 rounded-lg overflow-hidden">
          <video
            className="w-full h-full object-cover"
            src="https://storage.googleapis.com/caption-generator-demo/demo.mp4"
            poster="https://storage.googleapis.com/caption-generator-demo/poster.jpg"
            controls={isPlaying}
            onClick={() => setIsPlaying(true)}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                className="rounded-full w-16 h-16"
                onClick={() => setIsPlaying(true)}
              >
                <Play className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
        <div className="text-center text-muted-foreground">
          <p>Learn how to generate professional captions for your videos in minutes</p>
        </div>
      </div>
    </Card>
  );
}