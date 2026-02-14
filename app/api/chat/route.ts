import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";

function chunkText(text: string, chunkSize = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

function simpleSimilarity(query: string, chunk: string) {
  const queryWords = query.toLowerCase().split(" ");
  let score = 0;

  for (const word of queryWords) {
    if (chunk.toLowerCase().includes(word)) {
      score++;
    }
  }

  return score;
}

export async function POST(req: Request) {
  try {
    const { document, question } = await req.json();

    if (!document || !question) {
      return NextResponse.json(
        { error: "Document and question are required." },
        { status: 400 },
      );
    }

    // 1️⃣ Split into chunks
    const chunks = chunkText(document);

    // 2️⃣ Score chunks
    const scoredChunks = chunks
      .map((chunk) => ({
        chunk,
        score: simpleSimilarity(question, chunk),
      }))
      .sort((a, b) => b.score - a.score);

    // 3️⃣ Take top 3 relevant chunks
    const topChunks = scoredChunks.slice(0, 3).map((c) => c.chunk);

    const context = topChunks.join("\n\n");

    // 4️⃣ Send only relevant context to Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are a medical AI assistant.

Use ONLY the context below to answer.

Context:
${context}

Question:
${question}

If answer is not in context, say: "Not found in provided report."
              `,
            },
          ],
        },
      ],
    });

    const response = result.response.text();

    return NextResponse.json({ reply: response });
  } catch (error: any) {
    console.error("RAG ERROR:", error);
    return NextResponse.json({ error: error.message });
  }
}
