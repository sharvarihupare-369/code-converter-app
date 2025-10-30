import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
 
  try {
    // 1. Get data from the client (the frontend form)
    const data = await request.json();
    const { inputCode, inputLang, outputLang } = data;
    if (!inputCode || !inputLang || !outputLang) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }
    console.log(inputCode);
    // 2. Define the LLM's role and the query
    const systemPrompt =
      "You are an expert code translator. Your task is to accurately and idiomatically convert the provided source code into requested target language. Ensure converted code is functional and follows conventions of the target language. ONLY output the code block. Do not include any extra explanations, markdown fences (like ``` language) or commentary outside main code block.";
    const useQuery = `Convert the following ${inputLang} code into ${outputLang}: \n\n\`\`\`${inputLang}\n${inputCode}\n\`\`\``;

    // 3. Construct the secure payload for the Gemini API
    const payload = {
      contents: [{ role: "user", parts: [{ text: useQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.1,
      },
    };

    const url = `${process.env.NEXT_PUBLIC_GEMINI_API_URL}?key=${process.env.NEXT_PUBLIC_API_KEY}`;
    console.log("Gemini URL:", url);

    // 4. Call the Gemini API securely using the environment variable
    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error("Gemini API Error:", errorBody);
      return NextResponse.json(
        { error: "External API failure." },
        { status: geminiResponse.status }
      );
    }
    const result = await geminiResponse.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanedCode = rawText
    .replace(/```[a-zA-Z]*/g, "")  // remove ``` or ```javascript
    .replace(/```/g, "")           // remove remaining ```
    .trim();

    console.log(result, "result");
    return NextResponse.json({
      success: true,
      output: cleanedCode,
    });
  } catch (error) {
    console.error("API Route execution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
