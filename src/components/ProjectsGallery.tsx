"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink, X, FolderGit2, Loader2 } from "lucide-react";
import type { GitHubRepo } from "@/lib/github";
import { useFocusTrap } from "@/lib/useFocusTrap";

// Small colour map so language dots feel familiar (GitHub-style).
const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  "Jupyter Notebook": "#DA5B0B",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Go: "#00ADD8",
  Liquid: "#67b8de",
  Shell: "#89e051",
};

function RepoCard({ repo, index }: { repo: GitHubRepo; index: number }) {
  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -4 }}
      className="group flex flex-col p-5 rounded-2xl border border-ai-border bg-ai-panel hover:border-ai-primary/40 hover:bg-ai-panel-hover transition-colors shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FolderGit2 size={16} className="text-ai-primary flex-shrink-0" />
          <h3 className="font-semibold text-ai-text truncate group-hover:text-ai-primary transition-colors">
            {repo.name}
          </h3>
        </div>
        <ExternalLink size={14} className="text-ai-muted group-hover:text-ai-primary transition-colors flex-shrink-0 mt-0.5" />
      </div>

      <p className="text-sm text-ai-muted mt-2 line-clamp-3 flex-1">
        {repo.description || "No description provided."}
      </p>

      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {repo.topics.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full border border-ai-primary/25 text-ai-primary bg-ai-primary/5"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-ai-border text-xs text-ai-muted">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: LANG_COLOR[repo.language] ?? "#8b8b8b" }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star size={13} /> <span className="tabular">{repo.stars}</span>
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={13} /> <span className="tabular">{repo.forks}</span>
        </span>
      </div>
    </motion.a>
  );
}

export default function ProjectsGallery({ onClose }: { onClose: () => void }) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/github");
        if (!res.ok) throw new Error(`Failed to load repos (${res.status})`);
        const data = await res.json();
        if (!cancelled) setRepos(data.repos ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load repositories.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Live GitHub projects"
    >
      <motion.div
        ref={trapRef}
        tabIndex={-1}
        initial={{ scale: 0.96, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[85vh] flex flex-col rounded-3xl border border-ai-border bg-ai-bg card-ring overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ai-border">
          <div className="flex items-center gap-2.5">
            <FolderGit2 size={20} className="text-ai-primary" />
            <h2 className="text-lg font-bold text-ai-text">Live Projects</h2>
            <span className="flex items-center gap-1.5 text-xs text-ai-muted border border-ai-border rounded-full px-2.5 py-1 ml-1">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              />
              Synced from GitHub
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ai-muted hover:text-ai-text hover:bg-ai-panel transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-ai-muted gap-3">
              <Loader2 size={28} className="animate-spin text-ai-primary" />
              <span className="text-sm">Fetching latest repositories…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-ai-muted gap-2 text-center">
              <p className="text-sm">⚠️ {error}</p>
              <p className="text-xs">GitHub may be rate-limited — try again shortly.</p>
            </div>
          )}

          {!loading && !error && repos.length === 0 && (
            <p className="text-center text-ai-muted py-20 text-sm">No public repositories found.</p>
          )}

          {!loading && !error && repos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {repos.map((repo, i) => (
                <RepoCard key={repo.fullName} repo={repo} index={i} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
