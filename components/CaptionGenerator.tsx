"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileAudio, Languages, FileOutput, Upload, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AudioPlayer from '@/components/AudioPlayer';
import { languages } from '@/lib/languages';
import { convertToUTF8 } from '@/lib/srtUtils';
import { isPhoneticSupported } from '@/lib/phoneticMapping';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { motion } from 'framer-motion';
import { useCreditsStore } from '@/store/useCreditsStore';
import CaptionGuidelines from "./CaptionGuidelines";
import { FeedbackDialog } from "./FeedbackDialog";

interface ClaudeResponse {
  msg: string;
}

export default function CaptionGenerator() {
  const { data: session } = useSession();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');

  const [outputFormat, setOutputFormat] = useState('translated');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const initializeCredits = useCreditsStore((state) => state.initializeCredits);
  const credits = useCreditsStore((state) => state.credits); // Access the current credits
  const deductCredits = useCreditsStore((state) => state.deductCredits);

  const [showFeedback, setShowFeedback] = useState(false);

  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (session) {
      initializeCredits(session.user.email);
    }
  }, [session]);

  const getLanguageName = (languageCode: string): string => {
    // Handle common variations of language codes
    const normalizedCode = languageCode?.split('-')[0]?.toLowerCase(); // e.g., 'en-US' -> 'en'
    const language = languages.find(
      lang => lang.code.toLowerCase().startsWith(normalizedCode)
    );
    return language ? language.name : 'English'; // Default to English if not found
  };

  useEffect(() => {
    if (transcriptionId && isProcessing) {
      console.log("Starting polling for transcription:", transcriptionId);
      
      const checkResult = async () => {
        try {
          const response = await fetch(`/api/webhook/gladia?id=${transcriptionId}`);
          const data = await response.json();
          console.log("Polling result:", data); // This will show the status in console

          if (data.status === 'completed' && data.srtContent) {
            console.log("Transcription completed, processing result");
            console.log(data)
            // Clear polling
            if (pollingInterval.current) {
              clearInterval(pollingInterval.current);
            }

            let finalContent = data.srtContent;
            
            // Get the detected source language name
            const detectedSourceLang = getLanguageName(data.source);
            console.log("Detected source language:",targetLanguage, data.source, "->", detectedSourceLang);

            // Handle translation if needed
            if (detectedSourceLang !== targetLanguage) {
              try {
                console.log("Translating with Claude from", detectedSourceLang, "to", targetLanguage);
                const claude = await fetch('/api/claudeai', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    filecont: data.srtContent,
                    target: targetLanguage,
                    email: session?.user?.email,
                    source: detectedSourceLang, // Pass the language name instead of code
                    format: outputFormat
                  })
                });
                
                if (!claude.ok) {
                  throw new Error('Translation failed');
                }
                
                const translatedData = await claude.json();
                finalContent = translatedData.msg;
                console.log("Translation completed");
              } catch (error) {
                console.error('Translation error:', error);
                toast({
                  title: "Translation Error",
                  description: `Failed to translate from ${detectedSourceLang} to ${targetLanguage}. Please try again.`,
                  variant: "destructive",
                });
                setIsProcessing(false);
                return;
              }
            }

            // Process credits and download
            try {
              const creditResponse = await fetch(`/api/decredits?email=${session?.user?.email}`);
              if (creditResponse.ok) {
                const isSuccess = deductCredits(5);
                
                // Download file
                const utf8Content = convertToUTF8(finalContent);
                const blob = new Blob([utf8Content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'captions.srt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast({
                  title: "Success!",
                  description: "Your captions have been generated successfully.",
                });
                setShowFeedback(true);
              }
            } catch (error) {
              console.error('Credit processing error:', error);
              toast({
                title: "Error",
                description: "Failed to process credits. Please contact support.",
                variant: "destructive",
              });
            }

            setIsProcessing(false);
          } else {
            console.log("Still processing, status:", data.status);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      };

      // Start polling every 5 seconds
      pollingInterval.current = setInterval(checkResult, 20000);
      
      // Run initial check immediately
      checkResult();

      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [transcriptionId, isProcessing, session, targetLanguage, sourceLanguage, outputFormat, deductCredits]);

  const [sourceText] = useTypewriter({
    words: [
      'यह दुनिया बहुत खूबसूरत है', // Hindi: This world is very beautiful
      'नमस्ते दुनिया',              // Hindi: Hello World
      'வணக்கம் உகம்',            // Tamil: Hello World
      'ನಮಸ್ಕಾರ ಜಗತ್ತು',            // Kannada: Hello World               // English
      'నమస్కారం ప్రపంచం',          // Telugu: Hello World
    ],
    loop: true,
    delaySpeed: 3000,
    typeSpeed: 50,
  });

  const [targetText] = useTypewriter({
    words: [
      'This world is very beautiful (Hindi → English)',
      'Namaste Duniya (Hindi → English)',
      'Vanakkam Ulagam (Tamil → English)',
      'Namaskara Jagattu (Kannada → English)',
      'Namaskaram Prapancham (Telugu → English)',
    ],
    loop: true,
    delaySpeed: 3000,
    typeSpeed: 50,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session) return;
    const file = e.target.files?.[0];
    
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload an audio file smaller than 10MB",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Check audio duration
      const audio = new Audio();
      const reader = new FileReader();
      
      reader.onload = function(e) {
        audio.src = e.target?.result as string;
        
        audio.onloadedmetadata = function() {
          if (audio.duration > 120) { // 120 seconds = 2 minutes
            toast({
              title: "Audio too long",
              description: "Please upload an audio file shorter than 2 minutes",
              variant: "destructive",
            });
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            return;
          }
          
          setAudioFile(file);
          setAudioUrl(URL.createObjectURL(file));
        };
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!session || !audioFile || !sourceLanguage || !targetLanguage) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('sourceLanguage', sourceLanguage);
    formData.append('targetLanguage', targetLanguage);
    formData.append('outputFormat', outputFormat);

    try {
      if (!session) return;
    
      if (credits === 0) {
        toast({
          title: "Insufficient Credits",
          description: "Please add credits to generate captions.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }
          
      const data = await response.json();
      console.log("Transcription started with ID:", data.transcriptionId);
      
      // Only set the transcription ID to trigger the polling
      setTranscriptionId(data.transcriptionId);
      
      toast({
        title: "Processing",
        description: "Your audio is being processed. Please wait...",
      });

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to start transcription. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const downloadSRT = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captions.srt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClaudeRequest = async (text: string, retries = 2): Promise<ClaudeResponse> => {
    try {
      const response = await fetch('/api/claudeai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        if (response.status === 504 && retries > 0) {
          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          return handleClaudeRequest(text, retries - 1);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ClaudeResponse = await response.json();
      return data;

    } catch (error) {
      console.error('Error processing with Claude:', error);
      throw new Error('Failed to process text. Please try again with a smaller portion.');
    }
  };

  const chunkText = (text: string, maxChunkSize = 4000) => {
    const chunks = [];
    let currentChunk = '';

    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkSize) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '. ';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  };

  // Usage
  const processLargeText = async (text: string): Promise<string> => {
    const chunks = chunkText(text);
    const results: string[] = [];
    
    for (const chunk of chunks) {
      const result = await handleClaudeRequest(chunk);
      results.push(result.msg);
    }
    
    return results.join(' ');
  };

  const DemoTypingEffect = () => (
    <motion.div 
     
      className="my-4 sm:my-8 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10"
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">
        Multi-Language Support
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-lg bg-card shadow-sm">
          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
            Original Text
          </h4>
          <div className="h-16 sm:h-24 flex items-center justify-center text-base sm:text-lg font-medium">
            <motion.span
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {sourceText}
            </motion.span>
            <Cursor cursorStyle='|' cursorBlinking={false} />
          </div>
        </div>
        <div className="p-3 sm:p-4 rounded-lg bg-card shadow-sm">
          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
           Translation & Phonetic Translation
          </h4>
          <div className="h-16 sm:h-24 flex items-center justify-center text-base sm:text-lg">
            <motion.span
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {targetText}
            </motion.span>
            <Cursor cursorStyle='|' cursorBlinking={false} />
          </div>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3 sm:mt-4">
        Support for multiple languages with accurate phonetic translations
      </p>
    </motion.div>
  );

  return (
    <div className="space-y-4 sm:space-y-8 mx-auto px-4 sm:px-6 w-full max-w-4xl">
       <div id="demo" className="pt-4 sm:pt-8">
        <DemoTypingEffect />
      </div>
      <Card className="p-4 sm:p-8 pt-10" id="upload-section">
        <div className="space-y-4 sm:space-y-6">
          <div 
            className={`relative group rounded-xl border-2 border-dashed p-4 sm:p-8 transition-all ${
              session 
                ? "hover:border-primary/50 hover:bg-muted/50 border-border cursor-pointer" 
                : "border-muted bg-muted/10"
            }`}
            onClick={() => session && fileInputRef.current?.click()}
          >
            {!session && (
              <div className="absolute inset-0 backdrop-blur-[2px] bg-background/60 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-3 px-4 py-6 bg-card rounded-lg shadow-lg">
                  <Lock className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm font-medium">Sign in to upload audio files</p>
                </div>
              </div>
            )}
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileAudio className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">
                  {session ? "Click to upload" : "Audio Upload"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  MP3, WAV (max. 10MB, 2 min)
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={!session}
            />
          </div>

          {audioUrl && (
            <div className="rounded-lg border bg-card p-3 sm:p-4">
              <AudioPlayer audioUrl={audioUrl} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Source Language</label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage} disabled={!session}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.name}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Target Language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={!session}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.name}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Output Format</label>
              <Select value={outputFormat} onValueChange={setOutputFormat} disabled={!session}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="translation">Translation</SelectItem>
                  <SelectItem value="phonetic">Phonetic Translation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full text-sm sm:text-base"
            size="lg"
            onClick={handleSubmit}
            disabled={!session || !audioFile || !sourceLanguage || !targetLanguage || isProcessing}
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                <FileOutput className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Generate Captions
              </>
            )}
          </Button>
        </div>
      </Card>

      <CaptionGuidelines />

      <div className="text-center text-xs sm:text-sm text-muted-foreground pb-4 sm:pb-8">
        <p>Supported formats: MP3, WAV• Max file size: 10MB, max 2 min</p>
      </div>

      <FeedbackDialog 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        userEmail={session?.user?.email || ""}
      />
    </div>
  );
}