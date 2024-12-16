import { Volume2, X, Languages, Mic } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function CaptionGuidelines() {
  const guidelines = [
    {
      icon: <Volume2 className="h-5 w-5 text-primary" />,
      title: "Clear Audio Quality",
      description: "Ensure your audio is clear and well-recorded without background noise or echo"
    },
    {
      icon: <X className="h-5 w-5 text-primary" />,
      title: "Avoid Mixed Languages",
      description: "Try to stick to one language throughout the audio for better accuracy"
    },
    {
      icon: <Mic className="h-5 w-5 text-primary" />,
      title: "Minimize Background Noise",
      description: "Record in a quiet environment away from ambient sounds"
    },
    {
      icon: <Languages className="h-5 w-5 text-primary" />,
      title: "Clear Pronunciation",
      description: "Speak clearly and maintain consistent pace for better results"
    }
  ];

  return (
    <Card className="p-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">Guidelines for Better Captions</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {guidelines.map((item, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
            {item.icon}
            <div>
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 