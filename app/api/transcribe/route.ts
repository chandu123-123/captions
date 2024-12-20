import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/lib/authOptions";
import { UserLogin } from '@/app/lib/model';
import { dbConnection } from '@/app/lib/database';

const GLADIA_API_KEY = "743d7b13-66d7-4280-9513-9bb1ab0dafdc";

export async function POST(request: Request) {
  try {
    // 1. User Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check credits
    await dbConnection();
    const user = await UserLogin.findOne({ email: session.user.email });
    if (!user || user.credits < 5) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 403 }
      );
    }

    // 3. Get file from request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const sourceLanguage = formData.get('sourceLanguage') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // 4. Upload file to Gladia
    const uploadFormData = new FormData();
    uploadFormData.append('audio', audioFile);

    const uploadResponse = await fetch('https://api.gladia.io/v2/upload', {
      method: 'POST',
      headers: {
        'x-gladia-key': GLADIA_API_KEY
      },
      body: uploadFormData
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio file');
    }

    const uploadResult = await uploadResponse.json();
    console.log('Upload response:', uploadResult);

    // 5. Request transcription
    const transcriptionResponse = await fetch('https://api.gladia.io/v2/pre-recorded', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gladia-key': GLADIA_API_KEY
      },
      body: JSON.stringify({
        audio_url: uploadResult.audio_url,
        // language_code: sourceLanguage,
        sentences: true,
      
  
        punctuation_enhanced: true,
        accurate_words_timestamps: true,
        diarization: true,
        subtitles: true,
        subtitles_config: {
          formats: ["srt"]
        },
        detect_language: true,
        enable_code_switching: false
      })
    });

    if (!transcriptionResponse.ok) {
      throw new Error('Failed to start transcription');
    }

    const transcriptionResult = await transcriptionResponse.json();
    console.log('Transcription started:', transcriptionResult);

    return NextResponse.json({ 
      message: 'Transcription started',
      transcriptionId: transcriptionResult.id,
      resultUrl: transcriptionResult.result_url
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}