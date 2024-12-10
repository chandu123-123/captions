import { SpeechClient } from '@google-cloud/speech';
import { TranslationServiceClient } from '@google-cloud/translate';
import * as path from 'path';

// Types for Google Cloud Speech-to-Text responses
interface WordInfo {
  startTime: {
    seconds?: number | string;
    nanos?: number;
  };
  endTime: {
    seconds?: number | string;
    nanos?: number;
  };
  word: string;
}

interface TranscriptionAlternative {
  transcript?: string;
  confidence?: number;
  words?: WordInfo[];
}

interface TranscriptionResult {
  alternatives?: TranscriptionAlternative[];
  languageCode?: string;
}

// SRT segment interface
export interface SRTSegment {
  start: number;
  end: number;
  text: string;
}

// Configuration interface
interface TranscriptionConfig {
  encoding: string;
  sampleRateHertz: number;
  languageCode: string;
  alternativeLanguageCodes: string[];
  enableWordTimeOffsets: boolean;
  model: string;
  audioChannelCount: number;
  useEnhanced: boolean;
  automaticPunctuation: boolean;
}

// Initialize clients
const credentialsPath = path.join('C:', 'Users', 'Chand', 'Downloads', 'credentials.json');

const speechClient = new SpeechClient({
  keyFilename: credentialsPath,
});

const translationClient = new TranslationServiceClient({
  keyFilename: credentialsPath,
});

/**
 * Convert time objects to seconds
 */
function timeToSeconds(time: { seconds?: number | string; nanos?: number }): number {
  const seconds = Number(time.seconds || 0);
  const nanos = Number(time.nanos || 0);
  return seconds + nanos / 1e9;
}

/**
 * Transcribe audio buffer to text with timestamps
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  languageCode: string,
  typeLang: string,
  sampleRate: number,
  channels: number
): Promise<SRTSegment[]> {
  try {
    // Prepare audio configuration
    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config: TranscriptionConfig = {
      encoding: typeLang,
      sampleRateHertz: sampleRate,
      languageCode: languageCode,
      alternativeLanguageCodes: ['en-US'],
      enableWordTimeOffsets: true,
      model: 'default',
      audioChannelCount: channels,
      useEnhanced: true,
      automaticPunctuation: true,
    };

    const request:any = {
      audio,
      config,
    };

    // Make API call
    const [response]: any = await speechClient.recognize(request);

    if (!response.results || response.results.length === 0) {
      throw new Error('No transcription results received');
    }

    // Process results
    const transcription = response.results
      .map((result: TranscriptionResult) => result.alternatives?.[0])
      .filter((alt): alt is TranscriptionAlternative => alt !== undefined);

    // Convert to word segments
    const segments: SRTSegment[] = [];

    transcription.forEach((result: TranscriptionAlternative) => {
      if (!result.words) return;

      result.words.forEach((word: WordInfo) => {
        const startTime = timeToSeconds(word.startTime);
        const endTime = timeToSeconds(word.endTime);

        segments.push({
          start: startTime,
          end: endTime,
          text: word.word,
        });
      });
    });

    // Group words into pairs
    const reducedSegments: SRTSegment[] = [];

    for (let i = 0; i < segments.length; i += 2) {
      const firstWord = segments[i];
      const secondWord = segments[i + 1];

      if (secondWord) {
        reducedSegments.push({
          start: firstWord.start,
          end: secondWord.end,
          text: `${firstWord.text} ${secondWord.text}`,
        });
      } else {
        reducedSegments.push({
          start: firstWord.start,
          end: firstWord.end,
          text: firstWord.text,
        });
      }
    }

    return reducedSegments;

  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Translate text to target language
 */
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;

    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set');
    }

    const request = {
      parent: `projects/${projectId}/locations/global`,
      contents: [text],
      mimeType: 'text/plain',
      targetLanguageCode: targetLanguage,
    };

    const [response] = await translationClient.translateText(request);

    if (!response.translations || response.translations.length === 0) {
      throw new Error('No translation results received');
    }

    return response.translations[0].translatedText || text;

  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Failed to translate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
