import { generateSRTContent } from './srtUtils';

export const languages = [

  { code: 'te-IN', name: 'Telugu (India)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'ta-IN', name: 'Tamil (India)' },
  { code: 'bn-IN', name: 'Bengali (India)' },
  //{ code: 'mr-IN', name: 'Marathi (India)' },
  { code: 'gu-IN', name: 'Gujarati (India)' },
  { code: 'ml-IN', name: 'Malayalam (India)' },
  { code: 'kn-IN', name: 'Kannada (India)' },
  //{ code: 'pa-IN', name: 'Punjabi (India)' },
  //{ code: 'or-IN', name: 'Odia (India)' },
  //{ code: 'as-IN', name: 'Assamese (India)' },
  //{ code: 'ur-IN', name: 'Urdu (India)' },

  { code: 'en-US', name: 'English (United States)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
  { code: 'en-GB', name: 'English (United Kingdom)' },
  { code: 'fr-CA', name: 'French (Canada)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  //{ code: 'vi-VN', name: 'Vietnamese' },
 // { code: 'pl-PL', name: 'Polish' },
  //{ code: 'tr-TR', name: 'Turkish' },
  //{ code: 'he-IL', name: 'Hebrew' },
  //{ code: 'th-TH', name: 'Thai' },
  //{ code: 'id-ID', name: 'Indonesian' },
  //{ code: 'sv-SE', name: 'Swedish' },
  //{ code: 'da-DK', name: 'Danish' },
  //{ code: 'fi-FI', name: 'Finnish' },
  //{ code: 'no-NO', name: 'Norwegian' },
 // { code: 'cs-CZ', name: 'Czech' },
  //{ code: 'sk-SK', name: 'Slovak' },
  //{ code: 'ro-RO', name: 'Romanian' },
 // { code: 'nl-NL', name: 'Dutch' },
 // { code: 'ms-MY', name: 'Malay' },
  //{ code: 'sr-RS', name: 'Serbian' }
];

export const outputFormats = [
  //{ id: 'translated', name: 'Translated Text' },
  { id: 'phonetic', name: 'Phonetic (Romanized)' },
  //{ id: 'both', name: 'Both Translation & Phonetic' }
];

export function generateMockSRT() {
  const mockSegments = [
    {
      start: 1,
      end: 4,
      text: 'Welcome to our video presentation'
    },
    {
      start: 4.5,
      end: 8,
      text: 'Today we\'ll be discussing important topics'
    },
    {
      start: 8.5,
      end: 12,
      text: 'Let\'s begin with the first point'
    }
  ];

  return generateSRTContent(mockSegments);
}