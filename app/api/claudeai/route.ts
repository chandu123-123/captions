// pages/api/claude.ts
// pages/api/claude.ts
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { isEmail } from 'validator';
import { dbConnection } from '@/app/lib/database';
import { UserLogin } from '@/app/lib/model';

// Define the expected request body type
interface RequestData {
  filecont: string;
  target: string;
  email: string;
  source: string;
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
    // Connect to the database
    await dbConnection();

    // Parse the request body
    const data: RequestData = await req.json();
    const { filecont, target, email, source } = data;

    // Email validation
    if (!isEmail(email)) {
      return NextResponse.json({ msg: "Invalid email format" }, { status: 400 });
    }

    // Find the user in the database
    const usercred = await UserLogin.findOne({ email });
    if (!usercred) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 403 });
    }

    // Check if user has enough credits
    if (usercred.credits < 2) {
      return NextResponse.json({ msg: "Please purchase Credits" }, { status: 400 });
    }

    // Create an Anthropic client using the API key
    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_CLAUDE,
    });

    // Send the message to Claude
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Generate only a subtitle file that transliterates this ${source} content into ${target} phonetics. Do not add any explanations or additional text: ${filecont}`,
        },
      ],
    });

    // Check if content[0] exists and has a 'text' property
    const contentBlock = msg?.content?.[0] as MsgContent;

    if (contentBlock && 'text' in contentBlock) {
      // Return the generated message as JSON response
      return NextResponse.json({ msg: contentBlock.text }, { status: 200 });
    } else {
      // Return an error message if 'text' is missing
      return NextResponse.json({ msg: "Text not found in the response" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}




















