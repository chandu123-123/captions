import { NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/googleCloud';
import { generateSRTContent } from '@/lib/srtUtils';
import * as mm from 'music-metadata';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Types
interface AudioSegment {
  startTime: number;
  endTime: number;
  text: string;
}

interface AudioProperties {
  sampleRate: number;
  channels: number;
}

interface SRTSegment {
  startTime: number;
  endTime: number;
  text: string;
}

// Constants
const SILENCE_THRESHOLD = 0.01;
const MIN_SILENCE_DURATION = 0.2;

// Function to detect silence in audio buffer
const detectSilence = async (
  buffer: Buffer, 
  sampleRate: number, 
  channels: number
): Promise<AudioSegment[]> => {
  try {
    const samplesPerChannel = Math.floor(buffer.length / (channels * 2)); // Ensure integer
    const silenceSegments: AudioSegment[] = [];
    let silenceStart: number | null = null;
    
    for (let i = 0; i < samplesPerChannel; i++) {
      let sum = 0;
      
      for (let channel = 0; channel < channels; channel++) {
        const sampleIndex = i * channels * 2 + channel * 2;
        
        // Ensure we don't read beyond buffer bounds
        if (sampleIndex + 1 < buffer.length) {
          const sample = buffer.readInt16LE(sampleIndex) / 32768.0;
          sum += sample * sample;
        }
      }
      
      const rms = Math.sqrt(sum / channels);
      
      if (rms < SILENCE_THRESHOLD) {
        if (silenceStart === null) {
          silenceStart = i / sampleRate;
        }
      } else if (silenceStart !== null) {
        const silenceEnd = i / sampleRate;
        const duration = silenceEnd - silenceStart;
        
        if (duration >= MIN_SILENCE_DURATION) {
          silenceSegments.push({
            startTime: silenceStart,
            endTime: silenceEnd,
            text: '[Silence]'
          });
        }
        silenceStart = null;
      }
    }
    
    return silenceSegments;
  } catch (error) {
    console.error('Error in silence detection:', error);
    return [];
  }
};

// Function to get audio properties
const getAudioProperties = async (audioFile: File): Promise<AudioProperties> => {
  try {
    const arrayBuffer = await audioFile.arrayBuffer();
    // Convert arrayBuffer to Uint8Array first
    const uint8Array = new Uint8Array(arrayBuffer);
    const metadata = await mm.parseBuffer(uint8Array);
    
    if (!metadata?.format?.sampleRate || !metadata?.format?.numberOfChannels) {
      throw new Error('Invalid audio format or missing properties');
    }
    
    return {
      sampleRate: metadata.format.sampleRate,
      channels: metadata.format.numberOfChannels
    };
  } catch (error) {
    console.error('Error extracting audio properties:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to extract audio properties');
  }
};

// Function to get speech-to-text encoding
const getSpeechToTextEncoding = (mimeType: string): string => {
  const encodingMap: Record<string, string> = {
    'audio/wav': 'LINEAR16',
    'audio/mpeg': 'MP3',
    'audio/aac': 'AAC',
    'audio/ogg': 'OGG_OPUS',
    'audio/flac': 'FLAC',
    'audio/mp4': 'MP4',
    'audio/aiff': 'LINEAR16',
    'audio/opus': 'OPUS'
  };
  
  const encoding = encodingMap[mimeType];
  if (!encoding) {
    throw new Error(`Unsupported audio format: ${mimeType}`);
  }
  
  return encoding;
};

// Type guard to check if a segment has startTime
const hasStartTime = (segment: any): segment is AudioSegment | SRTSegment => {
  return typeof segment.startTime === 'number';
};

// Main POST handler
export async function POST(request: Request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const sourceLanguage = formData.get('sourceLanguage') as string | null;
    const targetLanguage = formData.get('targetLanguage') as string | null;
    const outputFormat = formData.get('outputFormat') as string | null;

    // Validate required fields
    if (!audioFile || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: audio, sourceLanguage, or targetLanguage' },
        { status: 400 }
      );
    }

    // Validate audio file type
    if (!audioFile.type) {
      return NextResponse.json(
        { error: 'Invalid audio file format' },
        { status: 400 }
      );
    }

    try {
      // Get audio properties and encoding
      const encoding = getSpeechToTextEncoding(audioFile.type);
      const { sampleRate, channels } = await getAudioProperties(audioFile);
      const buffer = Buffer.from(await audioFile.arrayBuffer());

      // Process audio
      const [silenceSegments, speechSegments] = await Promise.all([ 
        detectSilence(buffer, sampleRate, channels),
        transcribeAudio(buffer, sourceLanguage, encoding, sampleRate, channels)
      ]);

      // Merge and sort segments
      const allSegments :  SRTSegment[] = [
        ...speechSegments,
        ...silenceSegments
      ].filter(hasStartTime) // Type narrowing to ensure `startTime` exists
        .sort((a, b) => a.startTime - b.startTime);

      // Generate SRT content
      // const srtContent = generateSRTContent(allSegments);
      
      // return NextResponse.json({ 
      //   success: true,
      //   srtContent,
      //   segments: allSegments
      // });

    } catch (error) {
      console.error('Audio processing error:', error);
      return NextResponse.json(
        { error: 'Failed to process audio file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Request handling error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
