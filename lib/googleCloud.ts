import { SpeechClient } from '@google-cloud/speech';
import { TranslationServiceClient } from '@google-cloud/translate';
import * as path from 'path';  // Import 'path' module for path joining
import { SRTSegment } from './srtUtils';

// Define the path to the credentials file
const credentialsPath = path.join('C:', 'Users', 'Chand', 'Downloads', 'credentials.json');

// Initialize the SpeechClient and TranslationServiceClient with the credentials
const speechClient = new SpeechClient({
  keyFilename: credentialsPath,  // Pass the credentials file path here
});

const translationClient = new TranslationServiceClient({
  keyFilename: credentialsPath,  // Same for the translation client
});

export async function transcribeAudio(audioBuffer: Buffer, languageCode: string,typelang :string,sampleRate:number,channels:number): Promise<SRTSegment[]> {
  const audio = {
    content: audioBuffer.toString('base64'),
  };

  const config = {
    encoding: typelang,
    sampleRateHertz: sampleRate, // Match this to the sample rate of your WAV file
    languageCode: languageCode,  // Primary language (Telugu)
    alternativeLanguageCodes: ['en-US'],  // English as secondary language
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
