"use client";

import { motion } from "framer-motion";
import { useFocusTrap } from "@/lib/useFocusTrap";
import {
  X, MapPin, Mail, Sparkles, Briefcase,
  GraduationCap, Award, Rocket, TrendingUp, Cpu, Wrench,
} from "lucide-react";
import { portfolioData as P } from "@/data/portfolioData";

// lucide-react v1 dropped brand glyphs — use inline SVGs (matches the sidebar).
function GithubIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="fill-current" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
function LinkedinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="fill-current" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

/** Split "~40% reduction in ..." into a big value + descriptive label. */
function splitMetric(metric: string): { value: string; label: string } {
  const m = metric.match(/^(~?\d+[%x+]?)\s+(.+)$/);
  if (m) return { value: m[1], label: m[2].replace(/\s*\([^)]*\)\s*$/, "") };
  return { value: "", label: metric };
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-ai-muted mb-4">
      <Icon size={14} className="text-ai-primary" />
      {children}
    </h3>
  );
}

function Chips({ items, subtle = false }: { items: string[]; subtle?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span
          key={s}
          className={
            subtle
              ? "text-xs px-2.5 py-1 rounded-lg border border-ai-border bg-ai-bg/40 text-ai-text/90"
              : "text-xs px-2.5 py-1 rounded-lg border border-ai-primary/25 bg-ai-primary/8 text-ai-primary font-medium"
          }
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export default function ProfilePanel({ onClose }: { onClose: () => void }) {
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);
  const email = P.links.email.replace("mailto:", "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Rohan Mehta — full profile"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/55 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        ref={trapRef}
        tabIndex={-1}
        initial={{ scale: 0.97, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl my-4 rounded-3xl border border-ai-border bg-ai-panel card-ring overflow-hidden focus:outline-none"
      >
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="relative px-6 sm:px-10 pt-10 pb-8 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ai-primary/12 via-transparent to-cyan-500/10" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-ai-muted hover:text-ai-text hover:bg-ai-panel-hover transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              className="relative w-28 h-28 rounded-2xl overflow-hidden border border-ai-primary/40 shadow-[0_0_40px_-8px_rgba(16,163,127,0.5)] flex-shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="pic.jpeg?v=1" alt="Rohan Mehta" className="w-full h-full object-cover object-[center_12%]" />
            </motion.div>

            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ai-primary border border-ai-primary/30 bg-ai-primary/8 rounded-full px-2.5 py-1 mb-3">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                Open to AI Engineer roles
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight gradient-text">{P.fullName}</h2>
              <p className="text-ai-text font-medium mt-1">{P.title}</p>
              <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-ai-muted mt-1.5">
                <MapPin size={14} /> {P.location}
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-ai-muted mt-6 max-w-3xl">{P.summary}</p>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2 mt-5">
            <a href={P.links.github} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border border-ai-border bg-ai-bg/40 hover:border-ai-primary/40 hover:text-ai-primary transition-colors">
              <GithubIcon /> GitHub
            </a>
            <a href={P.links.linkedin} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border border-ai-border bg-ai-bg/40 hover:border-ai-primary/40 hover:text-ai-primary transition-colors">
              <LinkedinIcon /> LinkedIn
            </a>
            <a href={P.links.email}
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border border-ai-border bg-ai-bg/40 hover:border-ai-primary/40 hover:text-ai-primary transition-colors">
              <Mail size={15} /> {email}
            </a>
          </div>
        </div>

        <div className="px-6 sm:px-10 pb-10 space-y-10">
          {/* ── Impact metrics ─────────────────────────────────────────── */}
          <section>
            <SectionTitle icon={TrendingUp}>Impact by the numbers</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {P.keyMetrics.map((metric, i) => {
                const { value, label } = splitMetric(metric);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl border border-ai-border bg-ai-bg/40"
                  >
                    {value && <div className="tabular text-2xl font-bold gradient-text">{value}</div>}
                    <div className="text-xs text-ai-muted mt-1 leading-snug">{label}</div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── Skills ─────────────────────────────────────────────────── */}
          <section>
            <SectionTitle icon={Sparkles}>Top skills</SectionTitle>
            <div className="flex flex-wrap gap-2 mb-6">
              {P.topSkills.map((s) => (
                <span key={s} className="text-sm px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-ai-primary/15 to-cyan-500/10 border border-ai-primary/30 text-ai-text font-semibold">
                  {s}
                </span>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-ai-border bg-ai-bg/40">
                <p className="flex items-center gap-2 text-sm font-semibold text-ai-text mb-3"><Cpu size={15} className="text-ai-primary" /> AI / GenAI</p>
                <Chips items={P.aiStack} />
              </div>
              <div className="p-5 rounded-2xl border border-ai-border bg-ai-bg/40">
                <p className="flex items-center gap-2 text-sm font-semibold text-ai-text mb-3"><Wrench size={15} className="text-ai-primary" /> Engineering</p>
                <Chips items={P.engineeringStack} subtle />
              </div>
            </div>
          </section>

          {/* ── Experience timeline ────────────────────────────────────── */}
          <section>
            <SectionTitle icon={Briefcase}>Experience</SectionTitle>
            <div className="relative pl-6 space-y-6 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-ai-border">
              {P.experience.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="relative"
                >
                  <span className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-ai-primary bg-ai-panel" />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h4 className="font-semibold text-ai-text">
                      {exp.role} <span className="text-ai-primary">· {exp.company}</span>
                    </h4>
                    <span className="tabular text-xs text-ai-muted">{exp.duration}</span>
                  </div>
                  {exp.location && <p className="text-xs text-ai-muted mt-0.5">{exp.location}</p>}
                  <ul className="mt-2 space-y-1.5">
                    {exp.description.map((d, j) => (
                      <li key={j} className="flex gap-2 text-sm text-ai-muted leading-relaxed">
                        <span className="text-ai-primary mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-ai-primary" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Flagship projects ──────────────────────────────────────── */}
          <section>
            <SectionTitle icon={Rocket}>Flagship projects</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-3">
              {P.projects.map((pr) => (
                <div key={pr.id} className="p-4 rounded-2xl border border-ai-border bg-ai-bg/40">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-ai-text text-sm">{pr.title}</h4>
                    {pr.year && <span className="tabular text-[11px] text-ai-muted">{pr.year}</span>}
                  </div>
                  <p className="text-xs text-ai-muted mt-1.5 leading-relaxed line-clamp-3">{pr.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {pr.techStack.slice(0, 5).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-ai-panel-hover text-ai-muted">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Education & certifications ─────────────────────────────── */}
          <section className="grid md:grid-cols-2 gap-8">
            <div>
              <SectionTitle icon={GraduationCap}>Education</SectionTitle>
              <div className="space-y-3">
                {P.education.map((e, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-ai-border bg-ai-bg/40">
                    <p className="font-medium text-ai-text text-sm">{e.degree}</p>
                    <p className="text-xs text-ai-muted mt-0.5">{e.institution}</p>
                    <p className="tabular text-xs text-ai-muted mt-0.5">{e.duration}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle icon={Award}>Certifications</SectionTitle>
              <ul className="space-y-2">
                {P.certifications.map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ai-muted leading-relaxed">
                    <Award size={14} className="text-ai-primary mt-0.5 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
