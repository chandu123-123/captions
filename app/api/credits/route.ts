import { dbConnection } from "@/app/lib/database";
import { UserLogin } from "@/app/lib/model";
import { NextResponse } from "next/server";
import { isEmail } from "validator";

export async function GET(req: Request): Promise<NextResponse> {
  try {

    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    console.log(email)
    if (!isEmail(email)) {
      return NextResponse.json({ msg: "Invalid email format" }, { status: 400 });
    }

    await dbConnection();

    const user = await UserLogin.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const credits = user.credits;
  console.log(credits)
    // Return the credits in the response
    return NextResponse.json({ credits });
  } catch (error: any) {
    console.error("Error:", "something went wrong");
    return NextResponse.json(
      { error: "Too many requests, please try again later." },
      { status: 429 }
    );
  }
}
