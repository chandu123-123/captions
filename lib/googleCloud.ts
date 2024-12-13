import { SpeechClient, protos } from '@google-cloud/speech';
import { TranslationServiceClient } from '@google-cloud/translate';
import * as path from 'path';  // Import 'path' module for path joining
import { SRTSegment } from './srtUtils';

let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}');
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Invalid credentials format');
  }
} catch (error) {
  console.error('Error parsing Google Cloud credentials:', error);
  throw new Error('Failed to initialize Google Cloud credentials');
}

if (process.env.NODE_ENV === 'production') {
  console.log('Credentials check:', {
    hasClientEmail: !!credentials.client_email,
    hasPrivateKey: !!credentials.private_key,
    hasProjectId: !!credentials.project_id
  });
}

// Initialize clients using credentials from environment variable
const speechClient = new SpeechClient({
  credentials,
  projectId: credentials.project_id,
});

const translationClient = new TranslationServiceClient({
  credentials,
  projectId: credentials.project_id,
});

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

export async function transcribeAudio(audioBuffer: Buffer, languageCode: string,typelang :string,sampleRate:number,channels:number): Promise<SRTSegment[]> {
  const audio = {
    content: audioBuffer.toString('base64'),
  };

  const config = {
    encoding: getSpeechToTextEncoding(typelang),
    sampleRateHertz: sampleRate, // Match this to the sample rate of your WAV file
    languageCode: languageCode,  // Primary language (Telugu)
    alternativeLanguageCodes: ['en-US','en-IN'],  // English as secondary language
    enableWordTimeOffsets: true,  // To get word-level timestamps
    model: 'default',  // You can experiment with different models
    audioChannelCount: channels, // Set to 1 for mono audio
    useEnhanced: true, // Enable enhanced model for better accuracy if available
    automaticPunctuation: true,  // Adds punctuation marks to transcriptions

  };

  const request = {
    audio,
    config,
  };

  const [response] = await speechClient.recognize(request);
  console.log('API Response:', response);

  const transcription = response.results
    ?.map(result => result.alternatives?.[0])
    .filter(alt => alt !== undefined);

  const segments: SRTSegment[] = [];
  let currentSegment: SRTSegment | null = null;

  // Convert transcription to smaller segments
  transcription?.forEach(result => {
    result?.words?.forEach((word, index) => {
      const startTime =
        Number(word.startTime?.seconds || 0) + Number(word.startTime?.nanos || 0) / 1e9;
      const endTime =
        Number(word.endTime?.seconds || 0) + Number(word.endTime?.nanos || 0) / 1e9;

      // Create a segment for each word
      const segment: SRTSegment = {
        start: startTime,
        end: endTime,
        text: word.word || '',
      };

      segments.push(segment);
    });
  });

  // Now, group exactly two consecutive words for each caption
  const reducedSegments: SRTSegment[] = [];

  for (let i = 0; i < segments.length; i += 2) {
    const firstWord = segments[i];
    const secondWord = segments[i + 1];

    // Combine two words into a single caption
    if (secondWord) {
      reducedSegments.push({
        start: firstWord.start,
        end: secondWord.end,
       
        text: `${firstWord.text} ${secondWord.text}`,
      });
    } else {
      // If it's the last word and no pair exists, add it as its own caption
      reducedSegments.push({
        start: firstWord.start,
        end: firstWord.end,
     
        text: firstWord.text,
      });
    }
  }

  console.log(reducedSegments);

  return reducedSegments;

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