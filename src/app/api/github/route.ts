/**
 * GET /api/github — live public repositories for the Projects gallery.
 *
 * Backed by the same cached fetcher the chat route uses (lib/github.ts),
 * so new repos appear automatically without a redeploy.
 */

import { getGitHubRepos } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  const repos = await getGitHubRepos();
  return NextResponse.json(
    { repos, count: repos.length },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } }
  );
}
