# RohanGPT — AI-Powered Interactive Portfolio

A ChatGPT-style portfolio for **Rohan Mehta** (AI Engineer). Instead of a static résumé, recruiters *chat* with an AI that answers questions about Rohan's experience, projects, and skills — grounded in his real documents and **live GitHub activity**.

> Built to demonstrate applied AI-engineering: retrieval-augmented generation, prompt guardrails, streaming, evaluation, and clean, secure production architecture.

## ✨ Features

- **TF-IDF RAG** — In-memory keyword retrieval with structure-aware chunking and cosine similarity. Fast, dependency-free, and works on Vercel without any external embedding API.
- **Structure-aware chunking** — documents are chunked on their own authored semantic units, with frontmatter stripped and tags harvested as retrieval keywords.
- **Live GitHub sync** — public repos are fetched from the GitHub REST API at runtime and injected into the prompt + RAG context. **Push a new repo and it appears automatically** — no redeploy.
- **Real token streaming** — responses stream from Groq token-by-token (llama-3.3-70b-versatile).
- **Grounded, honest & guarded** — a guardrail-first system prompt forbids fabrication and refuses off-topic / jailbreak / prompt-extraction attempts, then redirects. Answers cite the exact sources they used.
- **Production hardening** — server-only secrets, per-IP rate limiting, input caps, security headers, generic error responses, and structured logging.
- **Evaluated** — `npm run eval` runs a retrieval + guardrail test suite against the live endpoint.
- **Polished, accessible UX** — ChatGPT-style layout, dark/light theme, Framer Motion, a live RAG status badge, a visual About/résumé panel, a live Projects gallery, focus-trapped modals, and a full mobile drawer.

## 🏗️ Architecture

```
Browser (ChatInterface.tsx)  ──POST /api/chat──►  Next.js Route Handler (Node runtime)
   ▲   streamed tokens + X-RAG headers                    │
   │                                                      ├─ getRAGIndex()      → TF-IDF keyword retrieval
   │                                                      ├─ getGitHubRepos()   → live GitHub REST API (cached ~1h)
   │                                                      ├─ build system prompt → guardrails + profile + chunks + live repos
   └──────────────────────────────────────────────────── └─ Groq (llama-3.3-70b-versatile) → streaming chat completions
```

| Layer | File | Responsibility |
|-------|------|----------------|
| UI | [src/components/ChatInterface.tsx](src/components/ChatInterface.tsx) | Chat UI, stream consumer, source tags, mobile drawer |
| About / Projects | [src/components/ProfilePanel.tsx](src/components/ProfilePanel.tsx) · [src/components/ProjectsGallery.tsx](src/components/ProjectsGallery.tsx) | Visual résumé + live GitHub gallery (focus-trapped modals) |
| Chat API | [src/app/api/chat/route.ts](src/app/api/chat/route.ts) | Retrieval + guardrails + rate limit + Groq streaming |
| GitHub API | [src/app/api/github/route.ts](src/app/api/github/route.ts) | Live repos as JSON for the gallery |
| RAG engine | [src/lib/ragEngine.ts](src/lib/ragEngine.ts) | Structure-aware chunking, TF-IDF, cosine retrieval |
| Embeddings | [src/lib/embeddings.ts](src/lib/embeddings.ts) | Embedder interface (extensible for future providers) |
| Loader | [src/lib/documentLoader.ts](src/lib/documentLoader.ts) | Reads `src/content/docs/`, builds & memoizes the index |
| GitHub | [src/lib/github.ts](src/lib/github.ts) | Cached live repo fetch + prompt formatting |
| Data | [src/data/portfolioData.ts](src/data/portfolioData.ts) | Structured, curated profile facts |
| Eval | [scripts/eval.mjs](scripts/eval.mjs) | Retrieval + guardrail test suite (`npm run eval`) |

## 🧠 RAG design notes

- **Right-sized on purpose.** For a small single-user corpus (~40 authored chunks) an in-memory TF-IDF index with cosine similarity is the correct tool — no external vector DB, embeddings API, or reranker needed, which would be over-engineering here.
- **Grounded generation.** `temperature: 0.4` and a strict "never fabricate" instruction keep answers factual.
- **Observability.** Every request logs `{ mode, chunks, topScore }` for quality visibility.

## 🔒 Security & guardrails

- Secrets are **server-only** (`GROQ_API_KEY`, never `NEXT_PUBLIC_`); source documents live outside `public/` so they can't be downloaded as raw URLs.
- The chat is scope-locked: it only discusses Rohan and **refuses** general-assistant, jailbreak, prompt-extraction, and unsafe requests (covered by `npm run eval`).
- Per-IP rate limiting, input length caps, security headers (`X-Frame-Options`, CSP `frame-ancestors`, `nosniff`, HSTS, …), and generic (non-leaking) error responses.

## 🚀 Getting Started

```bash
npm install
cp .env.example .env.local     # then set GROQ_API_KEY + GITHUB_USERNAME
npm run dev                     # http://localhost:3000
npm run eval                    # (optional) run the RAG + guardrail suite against the dev server
```

## 🔧 Configuration

| Variable | Required | Purpose |
|----------|----------|---------| 
| `GROQ_API_KEY` | ✅ | Groq LLM (llama-3.3-70b-versatile). **Server-only** — never prefix with `NEXT_PUBLIC_`. Get one free at https://console.groq.com/keys |
| `GITHUB_USERNAME` | ✅ | Whose public repos to display live. |
| `GITHUB_TOKEN` | optional | Read-only PAT to raise the GitHub rate limit (60 → 5000 req/hr). |

## 📚 Updating the Knowledge Base

The RAG index reads every `.txt` / `.md` file in [src/content/docs/](src/content/docs/) — edit or add files there (`resume.txt`, `linkedin.txt`, `github.txt`, …) and they're auto-discovered on the next server start. They live **outside** `public/` on purpose, so the raw source documents are never downloadable as public URLs. Structured facts (name, stack, metrics) live in [src/data/portfolioData.ts](src/data/portfolioData.ts).

## ☁️ Deploy to Vercel

No config needed — Next.js is auto-detected and the API routes run as standard Node functions.

1. Push to GitHub → **Import** the repo on [vercel.com](https://vercel.com/new).
2. Add Environment Variables: **`GROQ_API_KEY`**, `GITHUB_USERNAME` (+ optional `GITHUB_TOKEN`).
3. **Deploy.** Every push redeploys automatically.

**Notes:** `.env.local` is git-ignored and never deployed (set secrets in Vercel's dashboard). Env is read at request time, so the build needs no key.

## 🧱 Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Groq (`llama-3.3-70b-versatile`) · GitHub REST API
