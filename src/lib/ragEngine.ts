/**
 * RAG Engine — Semantic retrieval with a keyword fallback
 *
 * Primary retriever:  Gemini `gemini-embedding-001` dense vectors + cosine similarity.
 * Fallback retriever: in-memory TF-IDF + cosine similarity (zero external calls).
 *
 * If embeddings are available (an Embedder is supplied at build time) the index
 * retrieves semantically. If the embedding API is unavailable or fails, it
 * transparently degrades to TF-IDF so the chat never breaks.
 */

import type { Embedder } from "./embeddings";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentChunk {
  id: string;
  source: string; // e.g. "resume.txt"
  sourceLabel: string; // e.g. "Resume"
  text: string;
  tfidf: Map<string, number>;
  embedding?: number[]; // dense vector, present only when embeddings succeed
}

export interface RetrievedChunk {
  chunk: DocumentChunk;
  score: number;
}

export type RetrievalMode = "semantic" | "keyword";

// ─── Tokenizer ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "this", "that", "these", "those", "i", "you",
  "he", "she", "it", "we", "they", "my", "your", "his", "her", "its",
  "our", "their", "as", "not", "no", "so", "if", "then", "than", "up",
  "out", "about", "into", "through", "during", "before", "after", "each",
  "more", "also", "very", "just", "can", "me", "him", "them", "what",
  "which", "who", "when", "where", "how", "all", "any", "both", "few",
  "most", "other", "some", "such", "only", "own", "same", "too",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\+\#]/g, " ") // keep + and # for C++, C#, etc.
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

// ─── Query Expansion ──────────────────────────────────────────────────────────

/**
 * Recruiters ask questions in different words than a resume uses: "where did he
 * study?" tokenizes to just ["study"], while the education chunk only ever says
 * "Education", "Degree", "University". A pure TF-IDF retriever scores that pair
 * at zero and returns nothing, so the answer silently loses its grounding.
 *
 * Expanding a small set of common question words into the vocabulary the
 * documents actually use closes that gap without an embedding provider. Extra
 * terms that appear in no chunk are harmless — they only add a little to the
 * query vector's norm, which shifts every score equally and leaves the ranking
 * untouched.
 */
const QUERY_SYNONYMS: Record<string, string[]> = {
  // Education
  study: ["education", "degree", "university"],
  studied: ["education", "degree", "university"],
  studies: ["education", "degree", "university"],
  school: ["education", "university", "college"],
  college: ["education", "university", "degree"],
  university: ["education", "degree"],
  academic: ["education", "degree"],
  graduate: ["education", "degree", "university"],
  graduated: ["education", "degree", "university"],
  // Career / employment
  job: ["experience", "role", "company"],
  jobs: ["experience", "role", "company"],
  work: ["experience", "role", "company"],
  worked: ["experience", "role", "company"],
  career: ["experience", "role", "company"],
  employer: ["experience", "company", "role"],
  background: ["experience", "education", "summary"],
  history: ["experience", "role"],
  journey: ["experience", "role"],
  timeline: ["experience", "duration"],
  // Skills / stack
  stack: ["skills", "technologies", "framework"],
  tech: ["skills", "technologies", "framework"],
  tools: ["skills", "technologies", "framework"],
  strength: ["skills", "expertise"],
  strengths: ["skills", "expertise"],
  expertise: ["skills"],
  // Projects
  built: ["project", "built", "developed"],
  build: ["project", "developed"],
  portfolio: ["project", "github"],
  // Contact / hiring
  contact: ["email", "linkedin", "github"],
  reach: ["email", "linkedin", "contact"],
  connect: ["email", "linkedin", "contact"],
  hire: ["experience", "skills", "available"],
  hiring: ["experience", "skills", "available"],
  // Teaching
  teach: ["teaching", "curriculum", "instructor", "mentor"],
  teaches: ["teaching", "curriculum", "instructor"],
  taught: ["teaching", "curriculum", "instructor"],
  // Location
  located: ["location", "based"],
  live: ["location", "based"],
  lives: ["location", "based"],
};

function expandQuery(tokens: string[]): string[] {
  const expanded = [...tokens];
  for (const token of tokens) {
    const synonyms = QUERY_SYNONYMS[token];
    if (synonyms) expanded.push(...synonyms);
  }
  return expanded;
}

// ─── TF-IDF Computation ───────────────────────────────────────────────────────

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

function computeIDF(chunks: Array<{ tokens: string[] }>): Map<string, number> {
  const docFreq = new Map<string, number>();
  const N = chunks.length;

  for (const { tokens } of chunks) {
    const seen = new Set(tokens);
    for (const term of seen) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, df] of docFreq) {
    idf.set(term, Math.log((N + 1) / (df + 1)) + 1); // Smoothed IDF
  }
  return idf;
}

function computeTFIDF(tf: Map<string, number>, idf: Map<string, number>): Map<string, number> {
  const tfidf = new Map<string, number>();
  for (const [term, tfScore] of tf) {
    tfidf.set(term, tfScore * (idf.get(term) ?? 1));
  }
  return tfidf;
}

// ─── Similarity ───────────────────────────────────────────────────────────────

function sparseCosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [term, scoreA] of a) {
    dot += scoreA * (b.get(term) ?? 0);
    normA += scoreA * scoreA;
  }
  for (const [, scoreB] of b) normB += scoreB * scoreB;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function denseCosine(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── Chunking Strategy ────────────────────────────────────────────────────────

/**
 * Primary strategy: structure-aware chunking on the documents' own
 * `# CHUNK_NNN | CATEGORY | slug` markers. Each authored block becomes one
 * semantically-coherent chunk. The YAML-ish frontmatter (chunk_id/topic/tags)
 * is stripped from the embedded text, but its `tags` are harvested and appended
 * as a clean "Keywords:" line to boost retrieval — the recommended pattern for
 * pre-structured knowledge documents. Returns null if the doc isn't in this
 * format, so the caller can fall back.
 */
function structureAwareChunks(
  text: string,
  source: string,
  sourceLabel: string
): DocumentChunk[] | null {
  // NB: no \b after CHUNK — the marker is `# CHUNK_001`, and `_` is a word char,
  // so \b would never match between "CHUNK" and "_".
  const markers = [...text.matchAll(/^# CHUNK[^\n]*$/gm)];
  if (markers.length < 2) return null;

  const chunks: DocumentChunk[] = [];
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index ?? 0;
    const end = i + 1 < markers.length ? markers[i + 1].index ?? text.length : text.length;
    const headerLine = markers[i][0];

    let body = text.slice(start + headerLine.length, end);
    const tags: string[] = [];

    // Strip the leading frontmatter block, harvesting its tags.
    body = body.replace(/^\s*---\n([\s\S]*?)\n---\n/, (_m, fm: string) => {
      const tagMatch = fm.match(/tags:\s*\[([^\]]*)\]/);
      if (tagMatch) {
        tags.push(...tagMatch[1].split(",").map((t) => t.trim()).filter(Boolean));
      }
      return "";
    });

    body = body.replace(/\n---\s*$/, "").trim();
    if (body.length < 20) continue;

    const enriched = tags.length ? `${body}\n\nKeywords: ${tags.join(", ")}` : body;
    chunks.push({
      id: `${source}-c${i}`,
      source,
      sourceLabel,
      text: enriched,
      tfidf: termFrequency(tokenize(enriched)),
    });
  }

  return chunks.length > 0 ? chunks : null;
}

/**
 * Fallback: chunk by section separators (═══) / paragraphs with a
 * non-overlapping sliding window, for documents without CHUNK markers.
 */
function paragraphChunks(text: string, source: string, sourceLabel: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const sections = text.split(/[═]{3,}/g).map((s) => s.trim()).filter((s) => s.length > 50);
  const scope = sections.length > 0 ? sections : [text];

  for (let sIdx = 0; sIdx < scope.length; sIdx++) {
    const paragraphs = scope[sIdx]
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 30);

    const WINDOW_SIZE = 2;
    const STEP = 2; // non-overlapping windows — fewer, less-redundant chunks
    for (let i = 0; i < paragraphs.length; i += STEP) {
      const window = paragraphs.slice(i, i + WINDOW_SIZE).join("\n\n");
      if (window.trim().length < 30) continue;
      chunks.push({
        id: `${source}-s${sIdx}-p${i}`,
        source,
        sourceLabel,
        text: window,
        tfidf: termFrequency(tokenize(window)),
      });
    }
  }

  return chunks;
}

function chunkDocument(text: string, source: string, sourceLabel: string): DocumentChunk[] {
  return structureAwareChunks(text, source, sourceLabel) ?? paragraphChunks(text, source, sourceLabel);
}

// ─── RAG Index ────────────────────────────────────────────────────────────────

export class RAGIndex {
  private chunks: DocumentChunk[] = [];
  private idf: Map<string, number> = new Map();
  private embedder: Embedder | null = null;
  private isBuilt = false;
  public mode: RetrievalMode = "keyword";

  /** Add raw document text to the index. */
  addDocument(text: string, source: string, sourceLabel: string) {
    this.chunks.push(...chunkDocument(text, source, sourceLabel));
  }

  /**
   * Finalize the index. Always computes TF-IDF (the fallback). If an embedder
   * is supplied, it also embeds every chunk for semantic retrieval; on failure
   * it silently keeps only the TF-IDF path.
   */
  async build(embedder?: Embedder | null) {
    // 1) TF-IDF — always available.
    const tokenized = this.chunks.map((c) => ({ tokens: tokenize(c.text) }));
    this.idf = computeIDF(tokenized);
    for (const chunk of this.chunks) {
      chunk.tfidf = computeTFIDF(termFrequency(tokenize(chunk.text)), this.idf);
    }

    // 2) Dense embeddings — best effort.
    if (embedder && this.chunks.length > 0) {
      try {
        const vectors = await embedder.embedDocuments(this.chunks.map((c) => c.text));
        if (vectors.length === this.chunks.length) {
          this.chunks.forEach((chunk, i) => (chunk.embedding = vectors[i]));
          this.embedder = embedder;
          this.mode = "semantic";
        }
      } catch (err) {
        console.warn("[RAG] Embedding failed, falling back to TF-IDF:", err);
        this.mode = "keyword";
      }
    }

    this.isBuilt = true;
  }

  /** Retrieve the top-k most relevant chunks for a query. */
  async retrieve(query: string, topK: number = 5): Promise<RetrievedChunk[]> {
    if (!this.isBuilt) throw new Error("RAG index not built. Call build() first.");

    // Semantic path.
    if (this.mode === "semantic" && this.embedder) {
      try {
        const queryVec = await this.embedder.embedQuery(query);
        if (queryVec) {
          const scored = this.chunks
            .filter((c) => c.embedding)
            .map((chunk) => ({ chunk, score: denseCosine(queryVec, chunk.embedding!) }));
          scored.sort((a, b) => b.score - a.score);
          return scored.filter((r) => r.score > 0).slice(0, topK);
        }
      } catch (err) {
        console.warn("[RAG] Query embedding failed, using TF-IDF for this query:", err);
      }
    }

    // Keyword fallback — expanded so recruiter phrasing still reaches the docs.
    const queryTFIDF = computeTFIDF(termFrequency(expandQuery(tokenize(query))), this.idf);
    const scored = this.chunks.map((chunk) => ({
      chunk,
      score: sparseCosine(queryTFIDF, chunk.tfidf),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.filter((r) => r.score > 0).slice(0, topK);
  }

  get size(): number {
    return this.chunks.length;
  }
}
