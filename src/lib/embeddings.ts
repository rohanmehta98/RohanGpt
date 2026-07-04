/**
 * Embeddings — Google Gemini `gemini-embedding-001`
 *
 * Turns text into semantic vectors for the RAG retriever, following the
 * industry-standard asymmetric retrieval pattern: documents are embedded with
 * task type RETRIEVAL_DOCUMENT and queries with RETRIEVAL_QUERY, which the
 * model optimizes to sit in the same space for accurate query→doc matching.
 *
 * Uses per-item `embedContent` with bounded concurrency — this keeps the
 * asymmetric task typing (doc vs query) simple and is plenty fast for a small
 * corpus. Defensive: any failure propagates so the RAG engine falls back to
 * TF-IDF.
 */

import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const CONCURRENCY = 10; // parallel embed calls per round (kind to rate limits)

/** Asymmetric embedder: distinct task types for documents vs queries. */
export interface Embedder {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

/**
 * Build a Gemini-backed embedder, or null if no API key is configured.
 */
export function createGeminiEmbedder(apiKey: string | undefined): Embedder | null {
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

  const embedOne = async (text: string, taskType: TaskType): Promise<number[]> => {
    const res = await model.embedContent({
      content: { role: "user", parts: [{ text }] },
      taskType,
    });
    return res.embedding.values;
  };

  return {
    async embedDocuments(texts: string[]): Promise<number[][]> {
      if (texts.length === 0) return [];
      const vectors: number[][] = [];
      for (let i = 0; i < texts.length; i += CONCURRENCY) {
        const batch = texts.slice(i, i + CONCURRENCY);
        const res = await Promise.all(
          batch.map((t) => embedOne(t, TaskType.RETRIEVAL_DOCUMENT))
        );
        vectors.push(...res);
      }
      return vectors;
    },

    embedQuery(text: string): Promise<number[]> {
      return embedOne(text, TaskType.RETRIEVAL_QUERY);
    },
  };
}
