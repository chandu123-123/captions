import { NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/googleCloud';
import { generateSRTContent } from '@/lib/srtUtils';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as mm from 'music-metadata';
import { convertToPhonetic } from '@/lib/phoneticMapping';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/lib/authOptions";
import { UserLogin } from '@/app/lib/model';
import { dbConnection } from '@/app/lib/database';
import { isEmail } from 'validator';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Function to detect silence in audio buffer
const detectSilence = async (buffer: Buffer, sampleRate: number, channels: number) => {
  const SILENCE_THRESHOLD = 0.01; // Adjust this value based on your needs
  const MIN_SILENCE_DURATION = 0.2; // Minimum silence duration in seconds
  const samplesPerChannel = buffer.length / (channels * 2); // Assuming 16-bit audio
  const silenceSegments = [];
  let silenceStart = null;
  
  for (let i = 0; i < samplesPerChannel; i++) {
    let sum = 0;
    // Calculate RMS value for all channels at this point
    for (let channel = 0; channel < channels; channel++) {
      const sampleIndex = i * channels * 2 + channel * 2;
      const sample = buffer.readInt16LE(sampleIndex) / 32768.0;
      sum += sample * sample;
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
          start: silenceStart,
          end: silenceEnd,
          text: '[Silence]'
        });
      }
      silenceStart = null;
    }
  }
  
  return silenceSegments;
};

const getAudioProperties = async (audioFile: File): Promise<{ sampleRate: number, channels: number }> => {
  try {
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const metadata = await mm.parseBuffer(buffer);
    
    if (metadata?.format) {
      const sampleRate = metadata.format.sampleRate;
      const channels = metadata.format.numberOfChannels;
      
      if (!sampleRate || !channels) {
        throw new Error('Invalid audio format: missing sample rate or channels');
      }
      
      return { sampleRate, channels };
    } else {
      throw new Error('Failed to extract metadata');
    }
  } catch (err: any) {
    console.error('Error extracting audio properties:', err);
    throw new Error(`Failed to extract audio properties: ${err.message}`);
  }
};

function getSpeechToTextEncoding(mimeType: string): string {
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
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
  return encoding;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log(session,"session");
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check credits
    await dbConnection();
    const user = await UserLogin.findOne({ email: session.user.email });
    if (!user || user.credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 403 }
      );
    }
    if (!isEmail(session?.user?.email)) {
      return NextResponse.json({ msg: "Invalid email format" }, { status: 400 });
    }
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const sourceLanguage = formData.get('sourceLanguage') as string;
    const targetLanguage = formData.get('targetLanguage') as string;
    const outputFormat = formData.get('outputFormat') as string;

    if (!audioFile || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const type = getSpeechToTextEncoding(audioFile.type);
    const { sampleRate, channels } = await getAudioProperties(audioFile);
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Detect silence segments
    const silenceSegments = await detectSilence(buffer, sampleRate, channels);
    
    // Get speech segments
    const speechSegments = await transcribeAudio(buffer, sourceLanguage, type, sampleRate, channels);
    
    // Merge silence and speech segments
    const allSegments = [...speechSegments, ...silenceSegments].sort((a, b) => a.start - b.start);
  

    const srtContent = generateSRTContent(allSegments);
    return NextResponse.json({ srtContent });
    
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    );
  }
}