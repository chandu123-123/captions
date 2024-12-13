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
    automaticPunctuation: true,
    enableAutomaticPunctuation: true,
    maxAlternatives: 1,
    profanityFilter: false,
    enableWordConfidence: true,
    enableSpeakerDiarization: false,
    diarizationSpeakerCount: 1,
    metadata: {
      interactionType: protos.google.cloud.speech.v1.RecognitionMetadata.InteractionType.DISCUSSION,
      microphoneDistance: protos.google.cloud.speech.v1.RecognitionMetadata.MicrophoneDistance.NEARFIELD,
      originalMediaType: protos.google.cloud.speech.v1.RecognitionMetadata.OriginalMediaType.AUDIO,
      recordingDeviceType: protos.google.cloud.speech.v1.RecognitionMetadata.RecordingDeviceType.SMARTPHONE,
    },
  };

  const request = {
    audio,
    config,
  };

  console.log('Audio buffer length:', audioBuffer.length);
  console.log('Audio duration (seconds):', audioBuffer.length / (sampleRate * channels * 2)); // Assuming 16-bit audio

  const [response] = await speechClient.recognize(request);
  console.log('Full API Response:', JSON.stringify(response, null, 2));

  const segments: SRTSegment[] = [];

  // Process each word with error handling
  response.results?.forEach((result, resultIndex) => {
    const words = result.alternatives?.[0]?.words || [];
    
    words.forEach((word) => {
      try {
        const startTime = Number(word.startTime?.seconds || 0) + Number(word.startTime?.nanos || 0) / 1e9;
        const endTime = Number(word.endTime?.seconds || 0) + Number(word.endTime?.nanos || 0) / 1e9;

        if (isNaN(startTime) || isNaN(endTime)) {
          console.warn('Invalid timestamp for word:', word.word);
          return; // Skip this word
        }

        segments.push({
          start: startTime,
          end: endTime,
          text: word.word || '',
          confidence: word.confidence || 0
        });
      } catch (error) {
        console.error('Error processing word:', word, error);
        // Continue with next word
      }
    });
  });

  // Sort segments by start time to ensure correct ordering
  segments.sort((a, b) => a.start - b.start);

  // Group into pairs with error handling
  const reducedSegments: SRTSegment[] = [];
  
  for (let i = 0; i < segments.length; i += 2) {
    const firstWord = segments[i];
    const secondWord = segments[i + 1];

    try {
      if (secondWord) {
        // Check if words are too far apart (more than 2 seconds)
        const timeDiff = secondWord.start - firstWord.end;
        if (timeDiff > 2) {
          // Add first word as its own segment
          reducedSegments.push({
            start: firstWord.start,
            end: firstWord.end,
            text: firstWord.text,
          });
          // Process second word in next iteration
          i -= 1; // Adjust index to process second word as first of next pair
        } else {
          // Normal pair processing
          reducedSegments.push({
            start: firstWord.start,
            end: secondWord.end,
            text: `${firstWord.text} ${secondWord.text}`,
          });
        }
      } else {
        // Handle last single word
        reducedSegments.push({
          start: firstWord.start,
          end: firstWord.end,
          text: firstWord.text,
        });
      }
    } catch (error) {
      console.error('Error grouping words:', { firstWord, secondWord }, error);
      // If error occurs, try to salvage at least the first word
      if (firstWord) {
        reducedSegments.push({
          start: firstWord.start,
          end: firstWord.end,
          text: firstWord.text,
        });
      }
    }
  }

  console.log('Final segments:', reducedSegments);
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