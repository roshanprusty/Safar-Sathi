import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

/* -------------------- Pinecone Setup -------------------- */

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

/* -------------------- Gemini Setup -------------------- */

/* -------------------- Gemini Setup -------------------- */
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// UPDATE: Changed to a currently supported model. 
// If 'text-embedding-004' fails, verify with genAI.listModels()
const embeddingModel = genAI.getGenerativeModel({
  model: "models/gemini-embedding-001",
});

const chatModel = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash",
});

/* -------------------- RAG Function -------------------- */

export async function generateRagResponse(userQuery) {
  try {
    /* 1️⃣ Generate Query Embedding */
    // UPDATE: Added 'taskType' which is crucial for high-quality retrieval
    const embeddingResponse = await embeddingModel.embedContent({
  content: {
    parts: [{ text: userQuery }],
  },
  taskType: "RETRIEVAL_QUERY",
  outputDimensionality: 768, // ✅ Add this
});

    const queryVector = embeddingResponse.embedding.values;

    /* 2️⃣ Query Pinecone */
    const searchResponse = await index.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    const matches = searchResponse.matches || [];

    if (!matches.length) {
      return {
        answer: "I do not have enough information to answer that.",
        sources: [],
      };
    }

    /* 3️⃣ Build Context */

    const context = matches
      .map(
        (match, i) =>
          `Source ${i + 1} (${match.metadata.title}):\n${match.metadata.text}`
      )
      .join("\n\n");

    /* 4️⃣ Build Prompt */

    const prompt = `
You are a Safar Sathi travel policy assistant.

Use ONLY the context below to answer the user's question.

If the answer is not present in the context, reply:
"I do not have enough information to answer that."

----------------------
Context:
${context}
----------------------

User Question:
${userQuery}

Answer clearly and concisely.
`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      console.warn(`Rate limited. Retrying in ${delay}ms...`);
      await wait(delay);
      return fetchWithRetry(fn, retries - 1, delay * 2); // Double the delay
    }
    throw error;
  }
}

// Usage in your RAG function:
    /* 5️⃣ Generate Response */

   const result = await fetchWithRetry(() => chatModel.generateContent(prompt));


    const answer = result.response.text();

    /* 6️⃣ Return Answer + Sources */

    return {
      answer,
      sources: matches.map((m) => ({
        title: m.metadata.title,
        category: m.metadata.category,
      })),
    };
  } catch (error) {
    console.error("RAG Error:", error);

    return {
      answer: "Something went wrong while processing your request.",
      sources: [],
    };
  }
}