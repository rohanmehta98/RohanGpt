import { GoogleGenerativeAI } from "@google/generative-ai";
import { portfolioData } from "@/data/portfolioData";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: NextRequest) {
  if (!apiKey || apiKey === "your_api_key_here") {
    return NextResponse.json({ error: "API Key not configured in .env.local" }, { status: 500 });
  }

  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // Updated to Gemini 2.0 Flash for maximum performance
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
        You are "RohanGPT", a highly sophisticated AI representative for Rohan Mehta. 
        CONTEXT:
        ${JSON.stringify(portfolioData, null, 2)}

        GUIDELINES:
        1. Maintain a professional, innovative, and helpful tone.
        2. Use Markdown for formatting.
        3. Be a career advocate for Rohan.
      `,
    });

    const result = await model.generateContent(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI Error Details:", error.message || error);
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
  }
}
