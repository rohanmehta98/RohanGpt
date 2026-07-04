/**
 * Document Loader — reads .txt/.md files from src/content/docs/ and builds the RAG index.
 *
 * Server-side only (uses Node `fs`). Docs live OUTSIDE public/ so they are never
 * served as downloadable URLs. The index is built once per server process and
 * cached in memory. Embeddings are attempted via Gemini; on failure the index
 * falls back to TF-IDF automatically (see ragEngine.ts).
 *
 * To add knowledge: drop a new .txt/.md file into src/content/docs/ — auto-discovered.
 */

import fs from "fs";
import path from "path";
import { RAGIndex } from "./ragEngine";
import { createGeminiEmbedder } from "./embeddings";

const SOURCE_LABELS: Record<string, string> = {
  "resume.txt": "Resume",
  "linkedin.txt": "LinkedIn",
  "github.txt": "GitHub",
};

export async function buildRAGIndex(): Promise<RAGIndex> {
  // Kept OUT of public/ so the source documents (which contain personal contact
  // info) are never served as downloadable URLs. Still bundled into the server
  // at build time via outputFileTracingIncludes in next.config.ts.
  const docsDir = path.join(process.cwd(), "src", "content", "docs");
  const index = new RAGIndex();
  let filesLoaded = 0;

  try {
    for (const entry of fs.readdirSync(docsDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (![".txt", ".md"].includes(ext)) continue;

      const content = fs.readFileSync(path.join(docsDir, entry.name), "utf-8");
      if (!content.trim()) continue;

      const label = SOURCE_LABELS[entry.name] ?? entry.name.replace(/\.[^.]+$/, "");
      index.addDocument(content, entry.name, label);
      filesLoaded++;
    }
  } catch (err) {
    console.error("[RAG] Error loading documents:", err);
  }

  if (filesLoaded === 0) {
    console.warn("[RAG] No documents found in src/content/docs/.");
  }

  const embedder = createGeminiEmbedder(process.env.GEMINI_API_KEY);
  await index.build(embedder);

  console.log(
    `[RAG] Index built: ${index.size} chunks from ${filesLoaded} documents ` +
    `(mode: ${index.mode}).`
  );

  return index;
}

/**
 * Module-level singleton — built once per server process lifecycle.
 * We memoize the in-flight PROMISE (not just the resolved value) so that
 * concurrent requests arriving during a cold start share a single build
 * instead of each triggering their own (cache-stampede). On failure the slot
 * is cleared so the next request can retry.
 */
let indexPromise: Promise<RAGIndex> | null = null;

export function getRAGIndex(): Promise<RAGIndex> {
  if (!indexPromise) {
    indexPromise = buildRAGIndex().catch((err) => {
      indexPromise = null;
      throw err;
    });
  }
  return indexPromise;
}

export function invalidateRAGIndex() {
  indexPromise = null;
}
