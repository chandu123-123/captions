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
  email:string;
  source:string;
}

// POST handler;
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Connect to the database
    await dbConnection();

    // Parse the request body
    const data: RequestData = await req.json();
    const { filecont,target,email,source } = data;
    console.log(filecont)
    // Email validation
    if (!isEmail(email)) {
      return NextResponse.json({ msg: "Invalid email format" }, { status: 400 });
    }

    // Find the user in the database
    const usercred = await UserLogin.findOne({ email });
    if (!usercred) {
      console.log("Not authorized");
      return NextResponse.json({ msg: "Not authorized" }, { status: 403 });
    }

    // Check if user has enough credits
    if (usercred.credits < 2) {
      console.log("Insufficient credits");
      return NextResponse.json({ msg: "Please purchase Credits" }, { status: 400 });
    }

    // Determine language for the request


    console.log("Language: ", target,source);

    // Create an Anthropic client using the API key
    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_CLAUDE,
    });

    // Create the Claude 3.5 message
  
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Generate only a subtitle file that transliterates this ${source} content into ${target} phonetics. Do not add any explanations or additional text:   ${filecont}`,
        },
      ],
    });

    console.log(msg.content[0].text);

    // Return the generated message as JSON response
    return NextResponse.json({ msg:msg.content[0].text },{status:200});

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
