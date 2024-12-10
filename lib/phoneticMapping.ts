import { languages } from './languages';

interface PhoneticMap {
  [key: string]: string;
}

// Example phonetic mappings for Telugu to English
const teluguToEnglishMap: PhoneticMap = {
  'అ': 'a', 'ఆ': 'aa', 'ఇ': 'i', 'ఈ': 'ee', 'ఉ': 'u',
  'ఊ': 'oo', 'ఋ': 'ru', 'ఎ': 'e', 'ఏ': 'ae', 'ఐ': 'ai',
  'ఒ': 'o', 'ఓ': 'oh', 'ఔ': 'au', 'క': 'ka', 'ఖ': 'kha',
  'గ': 'ga', 'ఘ': 'gha', 'చ': 'cha', 'జ': 'ja', 'ట': 'ta',
  'డ': 'da', 'ణ': 'na', 'త': 'tha', 'ద': 'dha', 'న': 'na',
  'ప': 'pa', 'బ': 'ba', 'భ': 'bha', 'మ': 'ma', 'య': 'ya',
  'ర': 'ra', 'ల': 'la', 'వ': 'va', 'శ': 'sha', 'ష': 'sha',
  'స': 'sa', 'హ': 'ha', 'ళ': 'la', '్': '', 'ం': 'm',
  'ః': 'h', 'ృ': 'ru', 'ా': 'a', 'ి': 'i', 'ీ': 'ee',
  'ు': 'u', 'ూ': 'oo', 'ె': 'e', 'ే': 'ae', 'ై': 'ai',
  'ొ': 'o', 'ో': 'oh', 'ౌ': 'au'
};

const phoneticMaps: { [key: string]: PhoneticMap } = {
  'te': teluguToEnglishMap,
  // Add more language maps as needed
};

export function convertToPhonetic(text: string, sourceLanguage: string): string {
  const phoneticMap = phoneticMaps[sourceLanguage];
  if (!phoneticMap) return text;

  let result = '';
  let i = 0;
  
  while (i < text.length) {
    let found = false;
    // Try to match longer characters first
    for (let len = 3; len > 0; len--) {
      const char = text.substr(i, len);
      if (phoneticMap[char]) {
        result += phoneticMap[char];
        i += len;
        found = true;
        break;
      }
    }
    if (!found) {
      result += text[i];
      i++;
    }
  }

  return result;
}

export function isPhoneticSupported(languageCode: string): boolean {
  return languageCode in phoneticMaps;
}