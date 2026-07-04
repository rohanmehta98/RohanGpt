/**
 * GitHub Live Sync
 *
 * Fetches Rohan's public repositories directly from the GitHub REST API at
 * request time, so any repo he pushes shows up automatically — no redeploy,
 * no editing a static file.
 *
 * - Server-side only (never expose a token to the client).
 * - Cached in memory with a TTL so we don't hammer the API (public limit: 60 req/hr).
 * - Degrades gracefully: on any error we return an empty list and the app keeps working.
 */

export interface GitHubRepo {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  updatedAt: string;
  isFork: boolean;
  isArchived: boolean;
}

const USERNAME = process.env.GITHUB_USERNAME || "rohanmehta98";
const TOKEN = process.env.GITHUB_TOKEN; // optional — raises rate limit to 5000/hr
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface Cache {
  repos: GitHubRepo[];
  fetchedAt: number;
}
let cache: Cache | null = null;

/** Raw shape of the fields we read from the GitHub API response. */
interface RawRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
  archived: boolean;
}

function normalize(raw: RawRepo): GitHubRepo {
  return {
    name: raw.name,
    fullName: raw.full_name,
    description: raw.description,
    url: raw.html_url,
    homepage: raw.homepage || null,
    language: raw.language,
    topics: raw.topics ?? [],
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    updatedAt: raw.updated_at,
    isFork: raw.fork,
    isArchived: raw.archived,
  };
}

/**
 * Return Rohan's public repos, newest-activity first, forks excluded.
 * Uses a 1-hour in-memory cache. Never throws — returns [] on failure.
 */
export async function getGitHubRepos(): Promise<GitHubRepo[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.repos;
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "RohanGPT-Portfolio",
    };
    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

    const res = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`,
      { headers, next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.warn(`[GitHub] API returned ${res.status}. Using cached/empty data.`);
      return cache?.repos ?? [];
    }

    const raw = (await res.json()) as RawRepo[];
    const repos = raw
      .map(normalize)
      .filter((r) => !r.isFork && !r.isArchived)
      .sort((a, b) => {
        // Featured order: stars first, then most recently updated.
        if (b.stars !== a.stars) return b.stars - a.stars;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

    cache = { repos, fetchedAt: Date.now() };
    console.log(`[GitHub] Synced ${repos.length} public repos for ${USERNAME}.`);
    return repos;
  } catch (err) {
    console.error("[GitHub] Fetch failed:", err);
    return cache?.repos ?? [];
  }
}

/**
 * Render the live repos as a compact markdown block for injection into the
 * LLM system prompt and the RAG index. Keeps the model grounded in what's
 * actually on GitHub right now.
 */
export function formatReposForContext(repos: GitHubRepo[]): string {
  if (repos.length === 0) return "";

  // Strip newlines and cap length on free-text fields before they enter the
  // prompt (defense-in-depth against oversized/crafted repo metadata).
  const clean = (s: string, max: number) => s.replace(/\s+/g, " ").trim().slice(0, max);

  const lines = repos.slice(0, 30).map((r) => {
    const meta: string[] = [];
    if (r.language) meta.push(r.language);
    if (r.stars) meta.push(`★${r.stars}`);
    if (r.topics.length) meta.push(r.topics.slice(0, 5).join("/"));
    const metaStr = meta.length ? ` — ${meta.join(", ")}` : "";
    const desc = r.description ? `: ${clean(r.description, 200)}` : "";
    return `- **${clean(r.name, 80)}**${metaStr}${desc} (${r.url})`;
  });

  return `## Live GitHub Repositories (fetched in real time from github.com/${USERNAME})\n\n${lines.join("\n")}`;
}
