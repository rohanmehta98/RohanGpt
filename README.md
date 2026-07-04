# RohanGPT — AI-Powered Interactive Portfolio

A ChatGPT-style portfolio for **Rohan Mehta** (AI Engineer). Instead of a static résumé, recruiters *chat* with an AI that answers questions about Rohan's experience, projects, and skills — grounded in his real documents and **live GitHub activity**.

> Built to demonstrate applied AI-engineering: retrieval-augmented generation, embeddings, prompt guardrails, streaming, evaluation, and clean, secure production architecture.

## ✨ Features

- **Semantic RAG** — Google Gemini `gemini-embedding-001` with the industry-standard **asymmetric retrieval** pattern (documents embedded as `RETRIEVAL_DOCUMENT`, queries as `RETRIEVAL_QUERY`) + cosine similarity, with an automatic **from-scratch TF-IDF keyword fallback** if the embedding API is ever unavailable.
- **Structure-aware chunking** — documents are chunked on their own authored semantic units, with frontmatter stripped and tags harvested as retrieval keywords.
- **Live GitHub sync** — public repos are fetched from the GitHub REST API at runtime and injected into the prompt + RAG context. **Push a new repo and it appears automatically** — no redeploy.
- **Real token streaming** — responses stream from Gemini token-by-token.
- **Grounded, honest & guarded** — a guardrail-first system prompt forbids fabrication and refuses off-topic / jailbreak / prompt-extraction attempts, then redirects. Answers cite the exact sources they used.
- **Production hardening** — server-only secrets, per-IP rate limiting, input caps, security headers, generic error responses, and structured token/latency logging.
- **Evaluated** — `npm run eval` runs a retrieval + guardrail test suite against the live endpoint.
- **Polished, accessible UX** — ChatGPT-style layout, dark/light theme, Framer Motion, a live "Semantic RAG" status badge, a visual About/résumé panel, a live Projects gallery, focus-trapped modals, and a full mobile drawer.

## 🏗️ Architecture

```
Browser (ChatInterface.tsx)  ──POST /api/chat──►  Next.js Route Handler (Node runtime)
   ▲   streamed tokens + X-RAG headers                    │
   │                                                      ├─ getRAGIndex()      → semantic (embeddings) → TF-IDF fallback
   │                                                      ├─ getGitHubRepos()   → live GitHub REST API (cached ~1h)
   │                                                      ├─ build system prompt → guardrails + profile + chunks + live repos
   └──────────────────────────────────────────────────── └─ Gemini 2.5 Flash  → startChat(history).sendMessageStream()
```

| Layer | File | Responsibility |
|-------|------|----------------|
| UI | [src/components/ChatInterface.tsx](src/components/ChatInterface.tsx) | Chat UI, stream consumer, source tags, mobile drawer |
| About / Projects | [src/components/ProfilePanel.tsx](src/components/ProfilePanel.tsx) · [src/components/ProjectsGallery.tsx](src/components/ProjectsGallery.tsx) | Visual résumé + live GitHub gallery (focus-trapped modals) |
| Chat API | [src/app/api/chat/route.ts](src/app/api/chat/route.ts) | Retrieval + guardrails + rate limit + Gemini streaming |
| GitHub API | [src/app/api/github/route.ts](src/app/api/github/route.ts) | Live repos as JSON for the gallery |
| RAG engine | [src/lib/ragEngine.ts](src/lib/ragEngine.ts) | Structure-aware chunking, embeddings + TF-IDF, cosine retrieval |
| Embeddings | [src/lib/embeddings.ts](src/lib/embeddings.ts) | Gemini task-typed embedder (doc vs query) |
| Loader | [src/lib/documentLoader.ts](src/lib/documentLoader.ts) | Reads `src/content/docs/`, builds & memoizes the index |
| GitHub | [src/lib/github.ts](src/lib/github.ts) | Cached live repo fetch + prompt formatting |
| Data | [src/data/portfolioData.ts](src/data/portfolioData.ts) | Structured, curated profile facts |
| Eval | [scripts/eval.mjs](scripts/eval.mjs) | Retrieval + guardrail test suite (`npm run eval`) |

## 🧠 RAG design notes

- **Right-sized on purpose.** For a small single-user corpus (~40 authored chunks) an in-memory index with cosine similarity is the correct tool — no external vector DB, reranker, or RAGAS-in-the-loop, which would be over-engineering here. The retriever cleanly degrades from semantic → keyword so the chat never hard-fails.
- **Grounded generation.** `temperature: 0.4` and a strict "never fabricate" instruction keep answers factual; a mode-aware relevance floor drops weak matches so the assistant can honestly say "I don't have that."
- **Observability.** Every request logs `{ mode, chunks, topScore, tokens }` for cost/quality visibility.

## 🔒 Security & guardrails

- Secrets are **server-only** (`GEMINI_API_KEY`, never `NEXT_PUBLIC_`); source documents live outside `public/` so they can't be downloaded as raw URLs.
- The chat is scope-locked: it only discusses Rohan and **refuses** general-assistant, jailbreak, prompt-extraction, and unsafe requests (covered by `npm run eval`).
- Per-IP rate limiting, input length caps, security headers (`X-Frame-Options`, CSP `frame-ancestors`, `nosniff`, HSTS, …), and generic (non-leaking) error responses.

## 🚀 Getting Started

```bash
npm install
cp .env.example .env.local     # then set GEMINI_API_KEY + GITHUB_USERNAME
npm run dev                     # http://localhost:3000
npm run eval                    # (optional) run the RAG + guardrail suite against the dev server
```

## 🔧 Configuration

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | ✅ | Gemini chat + embeddings. **Server-only** — never prefix with `NEXT_PUBLIC_`. |
| `GITHUB_USERNAME` | ✅ | Whose public repos to display live. |
| `GITHUB_TOKEN` | optional | Read-only PAT to raise the GitHub rate limit (60 → 5000 req/hr). |

## 📚 Updating the Knowledge Base

The RAG index reads every `.txt` / `.md` file in [src/content/docs/](src/content/docs/) — edit or add files there (`resume.txt`, `linkedin.txt`, `github.txt`, …) and they're auto-discovered on the next server start. They live **outside** `public/` on purpose, so the raw source documents are never downloadable as public URLs. Structured facts (name, stack, metrics) live in [src/data/portfolioData.ts](src/data/portfolioData.ts).

## ☁️ Deploy to Vercel

No config needed — Next.js is auto-detected and the API routes run as standard Node functions.

1. Push to GitHub → **Import** the repo on [vercel.com](https://vercel.com/new).
2. Add Environment Variables: `GEMINI_API_KEY`, `GITHUB_USERNAME` (+ optional `GITHUB_TOKEN`).
3. **Deploy.** Every push redeploys automatically.

**Notes:** `.env.local` is git-ignored and never deployed (set secrets in Vercel). Env is read at request time, so the build needs no key. On a cold instance the index embeds ~40 chunks once (small first-request delay), then serves from memory; retrieval degrades to TF-IDF if embeddings ever fail.

## 🧱 Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Google Gemini (`gemini-2.5-flash` + `gemini-embedding-001`) · GitHub REST API
