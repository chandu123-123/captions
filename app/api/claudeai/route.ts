// pages/api/claude.ts
// pages/api/claude.ts
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { isEmail } from 'validator';
import { dbConnection } from '@/app/lib/database';
import { UserLogin } from '@/app/lib/model';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/authOptions';

// Increase timeout
export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

const MAX_CHUNK_SIZE = 4000;

// Function to chunk the input text
function chunkText(text: string): string[] {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > MAX_CHUNK_SIZE) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Define the expected request body type
interface RequestData {
  filecont: string;
  target: string;
  email: string;
  source: string;
  format: string;
}

// Define the possible structure of the response content
interface ContentBlock {
  text: string;
  // other properties if necessary
}

interface ToolUseBlock {
  // properties specific to ToolUseBlock, no `text` field
}

type MsgContent = ContentBlock | ToolUseBlock;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnection();
    const user = await UserLogin.findOne({ email: session.user.email });
    if (!user || user.credits < 5) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 403 }
      );
    }

    const data: RequestData = await req.json();
    const { filecont, target, email, source, format } = data;

    if (!isEmail(email)) {
      return NextResponse.json({ msg: "Invalid email format" }, { status: 400 });
    }

    const usercred = await UserLogin.findOne({ email });
    if (!usercred) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 403 });
    }

    if (usercred.credits < 2) {
      return NextResponse.json({ msg: "Please purchase Credits" }, { status: 400 });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_CLAUDE,
      maxRetries: 3,
      timeout: 45000, // 45 second timeout
    });

    // Split content into chunks
    const chunks = chunkText(filecont);
    let fullResponse = '';

    // Process each chunk
    for (const chunk of chunks) {
      try {
        const msg = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1000,
          temperature: 0.3, // Lower temperature for more consistent output
          messages: [
            {
              role: "user",
              content: format === "phonetic" 
                ? `Generate only a subtitle file that transliterates this ${source} content into ${target} phonetics. Do not add any explanations or additional text: ${chunk}`
                : `Translate this ${source} content to ${target}. Keep the same format and timing. Only provide the translation without any additional text: ${chunk}`,
            },
          ],
        });

        const contentBlock = msg?.content?.[0] as ContentBlock;
        if (contentBlock && 'text' in contentBlock) {
          fullResponse += contentBlock.text + '\n';
        }
      } catch (chunkError) {
        console.error('Error processing chunk:', chunkError);
        continue; // Continue with next chunk if one fails
      }
    }

    if (!fullResponse) {
      return NextResponse.json({ msg: "Failed to generate response" }, { status: 400 });
    }

    return NextResponse.json({ msg: fullResponse.trim() }, { status: 200 });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ 
      error: error.message,
      details: 'Server processing error'
    }, { status: 500 });
  }
}




















