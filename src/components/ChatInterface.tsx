"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Menu, Code, Briefcase, MessageSquare, Sun, Moon,
  Brain, Zap, Cpu, FolderGit2, User, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";

// Modals are only needed on demand — code-split them out of the initial bundle.
const ProjectsGallery = dynamic(() => import("./ProjectsGallery"), { ssr: false });
const ProfilePanel = dynamic(() => import("./ProfilePanel"), { ssr: false });

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  ragSources?: string[];
};

const SUGGESTED_PROMPTS = [
  "What LLM systems have you built in production?",
  "How do you use Model Context Protocol (MCP)?",
  "How does your RAG architecture work?",
  "Why should I hire you as an AI Engineer?",
];

const CHAT_TOPICS = [
  { icon: Brain, label: "Projects", prompt: "What LLM systems, RAG pipelines, and multi-agent workflows have you built in production?" },
  { icon: Cpu, label: "MCP & Agents", prompt: "How do you use Model Context Protocol (MCP) and multi-agent orchestration in your work?" },
  { icon: Code, label: "Tech Stack", prompt: "What is your full AI and engineering tech stack?" },
  { icon: Briefcase, label: "Experience", prompt: "Walk me through your professional experience — from Outlier and 10x.in to teaching GenAI and your current role at Bonn Nutrients." },
  { icon: Zap, label: "Why Hire Rohan?", prompt: "Give me your best pitch — why should I hire Rohan as my AI Engineer?" },
];

// Pool of follow-up questions offered after each answer to keep the chat flowing.
const FOLLOW_UPS = [
  "What are his strongest technical skills?",
  "Tell me about his MCP and multi-agent work",
  "What did he build at Bonn Nutrients?",
  "Show me his live GitHub projects",
  "How does he evaluate LLM quality (RAGAS)?",
  "What's his LLM fine-tuning experience?",
  "Walk me through his experience timeline",
  "Why should I hire him?",
  "How can I reach him?",
];

function GreetingAnimation() {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setAnimationKey((prev) => prev + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const taglines = [
    "I'm RohanGPT — ask me why Rohan should be your next AI Engineer.",
    "Production LLMs. Multi-agent systems. RAG & MCP. Let's talk.",
  ];

  const words = taglines[animationKey % taglines.length].split(" ");

  return (
    <div className="flex flex-col items-center justify-center h-full pt-4 md:pt-10 pb-32 lg:pb-40">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-ai-primary/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,163,127,0.25)] relative overflow-hidden bg-ai-panel"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="pic.jpeg?v=1" alt="Rohan Mehta" className="w-full h-full object-cover object-[center_10%] relative z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ai-primary/20 to-cyan-500/10 z-0" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-bl from-transparent via-ai-primary/20 to-transparent z-0"
        />
      </motion.div>

      <div className="h-24 md:h-32 flex items-start justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey}
            className="text-xl md:text-3xl font-bold text-center max-w-2xl px-4 tracking-tight leading-relaxed"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
              exit: { opacity: 0, transition: { duration: 0.4 } },
            }}
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-3 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 drop-shadow-sm"
                variants={{
                  hidden: { opacity: 0, y: 15, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 10 } },
                  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);      // waiting for the first token
  const [streamingId, setStreamingId] = useState<string | null>(null); // message currently streaming
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);   // desktop collapse
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // mobile drawer
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [ragMode, setRagMode] = useState<"semantic" | "keyword" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isBusy = isLoading || streamingId !== null;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resetTextarea = () => {
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isBusy) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: text.trim() };

    setRecentSearches((prev) => (prev.includes(text.trim()) ? prev : [text.trim(), ...prev].slice(0, 10)));
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    resetTextarea();
    setIsLoading(true);

    const aiMessageId = `ai-${Date.now()}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      // RAG metadata rides in headers so it's available before the stream.
      let ragSources: string[] = [];
      try {
        const raw = res.headers.get("X-RAG-Sources");
        if (raw) ragSources = JSON.parse(decodeURIComponent(raw));
      } catch {
        /* header optional */
      }
      const mode = res.headers.get("X-RAG-Mode");
      if (mode === "semantic" || mode === "keyword") setRagMode(mode);

      // Real token streaming from Gemini.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let currentText = "";
      let started = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        currentText += decoder.decode(value, { stream: true });
        if (!currentText) continue;

        if (!started) {
          // First token arrived — swap the typing dots for the real bubble.
          started = true;
          setIsLoading(false);
          setStreamingId(aiMessageId);
          setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", content: currentText, ragSources }]);
        } else {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: currentText } : msg))
          );
        }
      }

      if (!started) {
        setMessages((prev) => [
          ...prev,
          { id: aiMessageId, role: "ai", content: "I didn't catch that — could you rephrase?", ragSources },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "ai",
          content: "⚠️ Sorry — I couldn't reach my model just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingId(null);
    }
  };

  // Sidebar content, shared by the desktop rail and the mobile drawer.
  const renderSidebar = (onNavigate?: () => void) => {
    const go = (fn: () => void) => {
      fn();
      onNavigate?.();
    };
    return (
      <div className="p-4 flex flex-col gap-2 h-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => go(() => setMessages([]))}
          className="flex items-center gap-2 p-3 w-full bg-ai-panel hover:bg-ai-panel-hover border border-ai-border rounded-xl text-sm font-medium transition-colors shadow-sm relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ai-text/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <span className="text-xl text-ai-primary">+</span> New Chat
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => go(() => setShowProfile(true))}
          className="flex items-center gap-2 p-3 w-full bg-ai-panel hover:bg-ai-panel-hover border border-ai-border rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <User size={16} className="text-ai-primary" /> About Rohan
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => go(() => setShowProjects(true))}
          className="flex items-center gap-2 p-3 w-full bg-ai-panel hover:bg-ai-panel-hover border border-ai-border rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <FolderGit2 size={16} className="text-ai-primary" /> Live Projects
          <span className="ml-auto flex items-center gap-1 text-[10px] text-ai-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> GitHub
          </span>
        </motion.button>

        <div className="mt-6 flex-1 overflow-y-auto pr-1">
          <p className="text-xs font-semibold text-ai-muted mb-3 px-2 uppercase tracking-wider">Ask About</p>
          {CHAT_TOPICS.map((topic, i) => (
            <motion.button
              key={i}
              whileHover={{ x: 4 }}
              onClick={() => go(() => handleSend(topic.prompt))}
              className="flex items-center gap-3 p-2 w-full hover:bg-ai-panel rounded-lg text-sm text-left transition-colors mb-1.5 truncate text-ai-text group"
            >
              <topic.icon size={15} className="text-ai-muted group-hover:text-ai-primary transition-colors flex-shrink-0" />
              <span className="truncate">{topic.label}</span>
            </motion.button>
          ))}

          <p className="text-xs font-semibold text-ai-muted mt-6 mb-3 px-2 uppercase tracking-wider">Recents</p>
          {recentSearches.length === 0 ? (
            <p className="text-xs text-ai-muted px-2 italic">No recent searches...</p>
          ) : (
            recentSearches.map((prompt, i) => (
              <motion.button
                key={`recent-${i}`}
                whileHover={{ x: 4 }}
                onClick={() => go(() => handleSend(prompt))}
                className="flex items-center gap-2 p-2 w-full hover:bg-ai-panel rounded-lg text-sm text-left transition-colors mb-1 truncate text-ai-text group"
              >
                <MessageSquare size={13} className="text-ai-muted group-hover:text-ai-primary flex-shrink-0 transition-colors" />
                <span className="truncate">{prompt}</span>
              </motion.button>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-ai-border mt-auto">
          <a
            href="https://github.com/rohanmehta98"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-ai-panel transition-colors text-ai-muted hover:text-ai-text mb-1"
          >
            <svg className="w-[15px] h-[15px] fill-current text-[#24292e] dark:text-white flex-shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="text-xs font-medium">GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/rohanmehtaa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-ai-panel transition-colors text-ai-muted hover:text-ai-text mb-2"
          >
            <svg className="w-[15px] h-[15px] fill-[#0a66c2] flex-shrink-0" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
            </svg>
            <span className="text-xs font-medium">LinkedIn</span>
          </a>
          <button
            onClick={() => go(() => setShowProfile(true))}
            className="flex items-center gap-3 p-2 w-full rounded-md hover:bg-ai-panel transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shadow-emerald-500/30">
              RM
            </div>
            <div>
              <div className="text-sm font-medium">Rohan Mehta</div>
              <div className="text-xs text-ai-primary">View full profile →</div>
            </div>
          </button>
        </div>
      </div>
    );
  };

  // Offer follow-ups under the latest completed answer (skip already-asked ones).
  const lastMsg = messages[messages.length - 1];
  const followUps =
    !isBusy && lastMsg?.role === "ai" && lastMsg.content.length > 0
      ? FOLLOW_UPS.filter(
          (q) => !recentSearches.some((r) => r.toLowerCase() === q.toLowerCase())
        ).slice(0, 3)
      : [];

  return (
    <div className="flex h-screen w-full bg-ai-bg text-ai-text overflow-hidden font-sans">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 268, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-ai-bg border-r border-ai-border flex-col hidden md:flex overflow-hidden"
          >
            <div className="w-[268px] h-full">{renderSidebar()}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile nav drawer ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="absolute inset-y-0 left-0 w-[280px] max-w-[82%] bg-ai-bg border-r border-ai-border shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="font-bold">RohanGPT</span>
                <button onClick={() => setIsMobileNavOpen(false)} className="p-2 text-ai-muted hover:text-ai-text" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              {renderSidebar(() => setIsMobileNavOpen(false))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ──────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 h-full relative">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-3 border-b border-ai-border bg-ai-bg">
          <button onClick={() => setIsMobileNavOpen(true)} className="p-2" aria-label="Open menu">
            <Menu size={24} />
          </button>
          <span className="font-medium ml-2">RohanGPT</span>
          <span className="ml-2 text-xs text-ai-primary border border-ai-primary/30 rounded-full px-2 py-0.5">AI Engineer</span>
          <button onClick={() => setShowProfile(true)} className="ml-auto p-2 text-ai-muted hover:text-ai-primary transition-colors" aria-label="About Rohan">
            <User size={20} />
          </button>
          <button onClick={() => setShowProjects(true)} className="p-2 text-ai-muted hover:text-ai-primary transition-colors" aria-label="Live Projects">
            <FolderGit2 size={20} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-ai-bg via-ai-bg/90 to-transparent pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-ai-muted hover:text-ai-text transition-colors rounded-lg hover:bg-ai-panel"
              title="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-2.5 font-semibold text-lg px-2 py-1.5 rounded-xl transition-all group">
              <motion.div
                animate={{ boxShadow: ["0px 0px 0px rgba(16,163,127,0)", "0px 0px 15px rgba(16,163,127,0.5)", "0px 0px 0px rgba(16,163,127,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-ai-primary text-white overflow-hidden border border-emerald-400/30"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)]"
                />
                <div className="absolute inset-[2px] bg-ai-primary rounded-lg flex items-center justify-center">
                  <span className="relative z-10 font-black text-base tracking-tight drop-shadow-md text-white">R</span>
                </div>
              </motion.div>
              <span className="text-ai-text tracking-wide font-bold">RohanGPT</span>
              <span className="text-xs font-medium text-ai-primary border border-ai-primary/30 rounded-full px-2 py-0.5 ml-1">AI Engineer</span>
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-ai-border bg-ai-panel hover:bg-ai-panel-hover transition-all"
            >
              {isDark ? <Moon size={16} className="text-ai-muted" /> : <Sun size={16} className="text-amber-500" />}
              <span className="text-xs font-medium text-ai-text">{isDark ? "Dark" : "Light"}</span>
            </button>
          </div>

          {/* RAG Status Badge — reflects the real retrieval mode */}
          <div
            className="pointer-events-auto flex items-center gap-1.5 text-xs text-ai-muted border border-ai-border rounded-full px-3 py-1.5 glass"
            title={
              ragMode === "semantic"
                ? "Semantic retrieval via Gemini embeddings (with TF-IDF fallback)"
                : ragMode === "keyword"
                ? "Keyword retrieval (TF-IDF fallback active)"
                : "Retrieval-augmented — grounded in Rohan's real documents + live GitHub"
            }
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            />
            {ragMode === "semantic" ? "Semantic RAG" : ragMode === "keyword" ? "Keyword RAG" : "RAG Active"}
          </div>
        </div>

        {/* ── Messages ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto pb-32 pt-4 md:pt-16">
          <div className="max-w-3xl mx-auto w-full px-4 flex flex-col gap-6">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 p-4 rounded-lg ${m.role === "user"
                  ? "bg-ai-panel-hover ml-auto max-w-[85%] border border-ai-border"
                  : "bg-transparent mr-auto max-w-full"
                  }`}
              >
                {m.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-ai-panel border border-ai-primary/30 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden shadow-sm shadow-ai-primary/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="pic.jpeg?v=1" alt="RohanGPT" className="w-full h-full object-cover object-[center_10%]" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-ai-panel prose-pre:border prose-pre:border-ai-border prose-strong:text-ai-primary prose-p:text-ai-text">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                    {/* Streaming caret */}
                    {m.id === streamingId && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 -mb-0.5 bg-ai-primary/70 animate-pulse rounded-sm" />
                    )}
                  </div>

                  {/* RAG Source Tags — only once the message is complete */}
                  {m.role === "ai" && m.ragSources && m.ragSources.length > 0 && m.content.length > 0 && m.id !== streamingId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] text-ai-muted uppercase tracking-widest">Grounded in:</span>
                      {m.ragSources.map((src, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border border-ai-primary/25 text-ai-primary bg-ai-primary/5 font-medium">
                          📄 {src}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  {/* Copy — only once complete */}
                  {m.role === "ai" && m.content.length > 0 && m.id !== streamingId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(m.content)}
                        className="text-[10px] uppercase tracking-widest text-ai-muted hover:text-ai-text px-2 py-1 border border-ai-border rounded-md transition-all hover:border-ai-primary/40"
                      >
                        Copy
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator — only while awaiting the first token */}
            {isLoading && (
              <div className="flex gap-4 p-4 rounded-lg bg-transparent mr-auto max-w-full">
                <div className="w-8 h-8 rounded-full bg-ai-panel border border-ai-primary/30 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden shadow-sm shadow-ai-primary/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="pic.jpeg?v=1" alt="" className="w-full h-full object-cover object-[center_10%]" />
                </div>
                <div className="flex items-center gap-1 h-6">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-ai-muted"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested follow-ups under the latest answer */}
            {followUps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 pl-1 md:pl-12 -mt-2"
              >
                <span className="text-[10px] text-ai-muted uppercase tracking-widest">Suggested follow-ups</span>
                <div className="flex flex-wrap gap-2">
                  {followUps.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-xs text-ai-text bg-ai-panel hover:bg-ai-panel-hover border border-ai-border hover:border-ai-primary/40 rounded-full px-3 py-1.5 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.length === 0 && <GreetingAnimation />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Input Area ──────────────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ai-bg via-ai-bg to-transparent pt-10 pb-6 px-4">
          <div className="max-w-3xl mx-auto w-full relative">
            {messages.length === 0 && !isBusy && (
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-6">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(prompt)}
                    className="glass hover:bg-ai-panel-hover border border-ai-border text-sm text-ai-text py-2.5 px-5 rounded-full transition-colors drop-shadow-sm hover:border-ai-primary/40"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            )}

            <div className="relative group p-[1.5px] rounded-[22px] bg-gradient-to-r from-ai-primary/40 via-ai-border to-cyan-500/25 shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus-within:shadow-[0_10px_40px_-4px_rgba(16,163,127,0.25)] transition-all duration-300">
              <div className="flex items-end gap-2 glass rounded-[20px] p-1.5">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    const el = e.target;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(input);
                    }
                  }}
                  placeholder="Ask about Rohan's AI projects, skills, or experience..."
                  className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-ai-text pl-4 pr-2 py-3.5 resize-none min-h-[52px] max-h-[200px] text-sm placeholder-ai-muted/60"
                  rows={1}
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isBusy}
                  aria-label="Send message"
                  className="mb-0.5 mr-0.5 p-2.5 rounded-[14px] bg-ai-primary text-white shadow-lg shadow-ai-primary/20 hover:bg-ai-primary-hover disabled:bg-ai-muted/20 disabled:shadow-none hover:scale-105 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-ai-muted/70 mt-2">
              RohanGPT is AI-generated from Rohan&apos;s real résumé, LinkedIn &amp; live GitHub. It can make mistakes — verify key details.
            </p>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showProjects && <ProjectsGallery onClose={() => setShowProjects(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
      </AnimatePresence>
    </div>
  );
}
