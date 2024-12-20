import { NextResponse } from 'next/server';

const GLADIA_API_KEY = "743d7b13-66d7-4280-9513-9bb1ab0dafdc";

// Store results with timestamps
const transcriptionResults = new Map();

export async function POST(request: Request) {
  try {
    const webhookData = await request.json();
    console.log('Webhook received:', webhookData);

    if (webhookData.event === 'transcription.success') {
      const transcriptionId = webhookData.payload.id;
      
      const response = await fetch(`https://api.gladia.io/v2/pre-recorded/${transcriptionId}`, {
        method: 'GET',
        headers: {
          'x-gladia-key': GLADIA_API_KEY
        }
      });

      const result = await response.json();
      console.log(result)
      const srtContent = result.result?.transcription?.subtitles?.[0]?.subtitles;
      console.log(result.result?.transcription?.languages[0])
      if (srtContent) {
        // Store with timestamp
        transcriptionResults.set(transcriptionId, {
          status: 'completed',
          srtContent,
          source:  result.result?.transcription?.languages[0],
          timestamp: Date.now()
        });
        
        return NextResponse.json({ 
          success: true, 
          status: 'completed',
          transcriptionId 
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const transcriptionId = searchParams.get('id');

  if (!transcriptionId) {
    return NextResponse.json({ error: 'Missing transcription ID' }, { status: 400 });
  }

  const result = transcriptionResults.get(transcriptionId);
  if (result) {
    // Remove after sending
    transcriptionResults.delete(transcriptionId);
    return NextResponse.json(result);
  }

  return NextResponse.json({ status: 'processing' });
} 