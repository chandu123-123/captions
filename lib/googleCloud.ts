import { SpeechClient, protos } from '@google-cloud/speech';
import { TranslationServiceClient } from '@google-cloud/translate';
import * as path from 'path';  // Import 'path' module for path joining
import { SRTSegment } from './srtUtils';

// Initialize clients using credentials from environment variable
let speechClient: SpeechClient;
let translationClient: TranslationServiceClient;

try {
  const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
  
  if (!credentials) {
    throw new Error('GOOGLE_CLOUD_CREDENTIALS environment variable is not set');
  }

  const parsedCredentials = JSON.parse(credentials);
  
  if (!parsedCredentials.client_email || !parsedCredentials.private_key) {
    console.error('Credentials content:', JSON.stringify({
      hasClientEmail: !!parsedCredentials.client_email,
      hasPrivateKey: !!parsedCredentials.private_key,
      keys: Object.keys(parsedCredentials)
    }));
    throw new Error('Missing required credential fields');
  }

  speechClient = new SpeechClient({
    credentials: parsedCredentials,
    projectId: parsedCredentials.project_id,
  });

  translationClient = new TranslationServiceClient({
    credentials: parsedCredentials,
    projectId: parsedCredentials.project_id,
  });

} catch (error) {
  console.error('Error initializing Google Cloud clients:', error);
  throw new Error('Failed to initialize Google Cloud services. Check your credentials.');
}

function getSpeechToTextEncoding(mimeType: string): protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding {
  // Normalize the MIME type to lowercase
  const normalizedMime = mimeType.toLowerCase();
  
  const encodingMap: Record<string, protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding> = {
    'audio/wav': protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
    'audio/mpeg': protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
    'audio/mp3': protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,  // Added this
    'mp3': protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,        // Added this
    'audio/aac': protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.AMR,
    'audio/ogg': protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.OGG_OPUS,
    'audio/flac': protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.FLAC,
    'audio/mp4': protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
    'audio/aiff': protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
    'audio/opus': protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.OGG_OPUS
  };
  
  const encoding = encodingMap[normalizedMime];
  if (!encoding) {
    console.error(`Unsupported MIME type: ${mimeType}, normalized: ${normalizedMime}`);
    // Default to MP3 if type not found
    return protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3;
  }
  return encoding;
}

export async function transcribeAudio(audioBuffer: Buffer, languageCode: string, typelang: string, sampleRate: number, channels: number): Promise<SRTSegment[]> {
  const audio = {
    content: audioBuffer.toString('base64'),
  };

  const config = {
    encoding: getSpeechToTextEncoding(typelang),
    sampleRateHertz: sampleRate,
    languageCode: languageCode,
    alternativeLanguageCodes: ['en-US','en-IN'],
    enableWordTimeOffsets: true,
    model: 'default',
    audioChannelCount: channels,
    useEnhanced: true,
    enableAutomaticPunctuation: true,
    enableWordConfidence: true,
  };

  const request = {
    audio,
    config,
  };

  const [response] = await speechClient.recognize(request);
  const segments: SRTSegment[] = [];
  const MIN_SEGMENT_DURATION = 0.3; // Reduced minimum duration
  const MAX_SEGMENT_DURATION = 2.5; // Increased maximum duration
  const MIN_CONFIDENCE = 0.5; // Minimum confidence threshold

  // Filter out unwanted words/phrases
  const unwantedPhrases = ['ecet.in', 'code', 'http', 'www'];

  response.results?.forEach((result) => {
    const words = result.alternatives?.[0]?.words || [];
    let currentSegment: SRTSegment | null = null;

    words.forEach((word, index) => {
      const startTime = Number(word.startTime?.seconds || 0) + Number(word.startTime?.nanos || 0) / 1e9;
      const endTime = Number(word.endTime?.seconds || 0) + Number(word.endTime?.nanos || 0) / 1e9;
      const confidence = word.confidence || 0;
      const wordText = word.word || '';

      // Skip unwanted phrases and low confidence words
      if (confidence < MIN_CONFIDENCE || 
          unwantedPhrases.some(phrase => wordText.toLowerCase().includes(phrase.toLowerCase()))) {
        return;
      }

      if (!currentSegment) {
        currentSegment = {
          start: startTime,
          end: endTime,
          text: wordText
        };
      } else {
        const segmentDuration = endTime - currentSegment.start;
        const timeSinceLastWord = startTime - currentSegment.end;

        if (segmentDuration >= MAX_SEGMENT_DURATION || 
            timeSinceLastWord > 0.3 || 
            wordText.match(/[.!?]$/)) {
          
          if (currentSegment.end - currentSegment.start >= MIN_SEGMENT_DURATION) {
            segments.push(currentSegment);
          }
          currentSegment = {
            start: startTime,
            end: endTime,
            text: wordText
          };
        } else {
          currentSegment.end = endTime;
          currentSegment.text += ' ' + wordText;
        }
      }

      if (index === words.length - 1 && currentSegment) {
        segments.push(currentSegment);
      }
    });
  });

  // Calculate total audio duration
  const audioDuration = audioBuffer.length / (sampleRate * channels * 2);

  // Sort segments and ensure full coverage
  segments.sort((a, b) => a.start - b.start);

  // Fill gaps and extend segments
  for (let i = 0; i < segments.length; i++) {
    // Fill gap from previous segment
    if (i > 0) {
      const gap = segments[i].start - segments[i-1].end;
      if (gap > 0.1) {
        segments[i-1].end = segments[i].start;
      }
    }

    // Extend last segment to audio end
    if (i === segments.length - 1 && audioDuration - segments[i].end > 0.1) {
      segments[i].end = audioDuration;
    }
  }

  // Add silence segment if there's a gap at the end
  if (segments.length > 0 && audioDuration - segments[segments.length-1].end > 1.0) {
    segments.push({
      start: segments[segments.length-1].end,
      end: audioDuration,
      text: ''
    });
  }

  return segments.filter(segment => segment.text.trim().length > 0);
}

// export async function translateText(text: string, targetLanguage: string): Promise<string> {
//   const projectId = process.env.GOOGLE_CLOUD_PROJECT;
//   const location = 'global';

//   const request = {
//     parent: `projects/${projectId}/locations/${location}`,
//     contents: [text],
//     mimeType: 'text/plain',
//     targetLanguageCode: targetLanguage,
//   };

//   const [response] = await translationClient.translateText(request);
//   return response.translations?.[0]?.translatedText || text;
// }