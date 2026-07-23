/**
 * Embeddings — placeholder module (Groq does not provide an embeddings API).
 *
 * The RAG engine falls back gracefully to the built-in TF-IDF keyword retriever
 * when no embedder is supplied. This file is kept for future extensibility —
 * you can plug in any embeddings provider (e.g. OpenAI, Cohere, HuggingFace)
 * by implementing the Embedder interface and passing it to `index.build()`.
 */

/** Asymmetric embedder interface — implement to enable semantic (dense) retrieval. */
export interface Embedder {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}
