"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Menu, Code, Wrench, BookOpen, Briefcase, MessageSquare, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { processQuery } from "../utils/mockAgent";
import type { AgentResponse } from "../types/agent";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

const SUGGESTED_PROMPTS = [
  "Tell me about your experience",
  "What are your key skills?",
  "Show me your projects",
  "How can I contact you?",
];

const CHAT_TOPICS = [
  { icon: Briefcase, label: "Work Experience", prompt: "Tell me about your experience" },
  { icon: Code, label: "Recent Projects", prompt: "Show me your projects" },
  { icon: Wrench, label: "Core Skills", prompt: "What are your key skills?" },
  { icon: BookOpen, label: "Blog & Articles", prompt: "What have you written recently?" },
];

function GreetingAnimation() {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const words = "I’m RohanGPT, ask me why Rohan should be your next AI engineer.".split(" ");

  return (
    <div className="flex flex-col items-center justify-center h-full pt-4 md:pt-10 pb-32 lg:pb-40">
      {/* 1. Profile Picture On Top */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-ai-primary/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,163,127,0.25)] relative overflow-hidden bg-ai-panel"
      >
        <img
          src="pic.jpeg?v=1"
          alt=""
          className="w-full h-full object-cover object-[center_10%] relative z-10"
        />
        {/* Placeholder gradient if image is missing */}
        <div className="absolute inset-0 bg-gradient-to-tr from-ai-primary/20 to-cyan-500/10 z-0" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-bl from-transparent via-ai-primary/20 to-transparent z-0"
        />
      </motion.div>

      {/* 2. Animated Text Below */}
      <div className="h-24 md:h-32 flex items-start justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey}
            className="text-2xl md:text-4xl font-bold text-center max-w-2xl px-4 tracking-tight leading-relaxed"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12 }
              },
              exit: {
                opacity: 0,
                transition: { duration: 0.4 }
              }
            }}
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-3 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-lg"
                variants={{
                  hidden: { opacity: 0, y: 15, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness: 120, damping: 10 }
                  },
                  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    setRecentSearches((prev) =>
      prev.includes(text.trim()) ? prev : [text.trim(), ...prev]
    );

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // Simulated Streaming for "AI Portfolio" impact
      const aiResponse = data.text;
      const aiMessageId = (Date.now() + 1).toString();

      // Initialize empty AI message
      setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", content: "" }]);

      let currentText = "";
      const words = aiResponse.split(" ");

      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + " ";
        setMessages((prev) =>
          prev.map(msg => msg.id === aiMessageId ? { ...msg, content: currentText } : msg)
        );
        await new Promise(r => setTimeout(r, 30 + Math.random() * 20)); // "Human-like" typing
      }

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I encountered a minor glitch in my neural network. Please check your API key in `.env.local` or try again later!",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-ai-bg text-ai-text overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-ai-bg border-r border-ai-border flex flex-col hidden md:flex"
          >
            <div className="p-4 flex flex-col gap-2 h-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMessages([])}
                className="flex items-center gap-2 p-3 w-full bg-ai-panel hover:bg-ai-panel-hover border border-ai-border rounded-xl text-sm font-medium transition-colors shadow-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ai-text/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="text-xl text-ai-primary">+</span> New Chat
              </motion.button>

              <div className="mt-8 flex-1 overflow-y-auto pr-1">
                <p className="text-xs font-semibold text-ai-muted mb-3 px-2 uppercase tracking-wider">Knowledge Topics</p>
                {CHAT_TOPICS.map((topic, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    onClick={() => handleSend(topic.prompt)}
                    className="flex items-center gap-3 p-2 w-full hover:bg-ai-panel rounded-lg text-sm text-left transition-colors mb-2 truncate text-ai-text group"
                  >
                    <topic.icon size={16} className="text-ai-muted group-hover:text-ai-primary transition-colors flex-shrink-0" />
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
                      onClick={() => handleSend(prompt)}
                      className="flex items-center gap-2 p-2 w-full hover:bg-ai-panel rounded-lg text-sm text-left transition-colors mb-1 truncate text-ai-text group"
                    >
                      <MessageSquare size={14} className="text-ai-muted group-hover:text-ai-primary flex-shrink-0 transition-colors" />
                      <span className="truncate">{prompt}</span>
                    </motion.button>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-ai-border mt-auto">
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-ai-panel transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
                    RM
                  </div>
                  <div className="text-sm font-medium">Rohan Mehta</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-full relative">
        {/* Mobile Header / Sidebar Toggle */}
        <div className="md:hidden flex items-center p-3 border-b border-ai-border bg-ai-bg">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
            <Menu size={24} />
          </button>
          <span className="font-medium ml-2">Rohan GPT</span>
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

            <div className="flex items-center gap-2.5 font-semibold text-lg cursor-pointer hover:bg-ai-panel/50 px-2 py-1.5 rounded-xl transition-all group">
              <motion.div
                animate={{
                  boxShadow: ["0px 0px 0px rgba(16,163,127,0)", "0px 0px 15px rgba(16,163,127,0.5)", "0px 0px 0px rgba(16,163,127,0)"],
                }}
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
              <span className="text-ai-text transition-colors tracking-wide font-bold">
                RohanGPT
              </span>
            </div>

            {/* Theme Toggle (Moved to Left) */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-ai-border bg-ai-panel hover:bg-ai-panel-hover transition-all"
            >
              {isDark ? (
                <Moon size={16} className="text-ai-muted" />
              ) : (
                <Sun size={16} className="text-amber-500" />
              )}
              <span className="text-xs font-medium text-ai-text">{isDark ? "Dark" : "Light"}</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pb-32 pt-4">
          <div className="max-w-3xl mx-auto w-full px-4 flex flex-col gap-6">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 p-4 rounded-lg ${m.role === "user" ? "bg-ai-panel-hover ml-auto max-w-[85%] border border-ai-border" : "bg-transparent mr-auto max-w-full"
                  }`}
              >
                {m.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-ai-panel border border-ai-primary/30 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden shadow-sm shadow-ai-primary/20">
                    <img
                      src="pic.jpeg?v=1"
                      alt=""
                      className="w-full h-full object-cover object-[center_10%]"
                    />
                  </div>
                )}

                <div className="prose prose-invert dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-ai-panel prose-pre:border prose-pre:border-ai-border prose-strong:text-ai-primary prose-p:text-ai-text">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                  {m.role === "ai" && m.content.length > 0 && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 flex gap-2"
                    >
                      <button className="text-[10px] uppercase tracking-widest text-ai-muted hover:text-ai-text px-2 py-1 border border-ai-border rounded-md transition-all">Copy</button>
                      <button className="text-[10px] uppercase tracking-widest text-ai-muted hover:text-ai-text px-2 py-1 border border-ai-border rounded-md transition-all">Source</button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-4 p-4 rounded-lg bg-transparent mr-auto max-w-full">
                <div className="w-8 h-8 rounded-full bg-ai-panel border border-ai-primary/30 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden shadow-sm shadow-ai-primary/20">
                  <img
                    src="pic.jpeg?v=1"
                    alt=""
                    className="w-full h-full object-cover object-[center_10%]"
                  />
                </div>
                <div className="flex items-center gap-1 h-6">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-ai-muted"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-ai-muted"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-ai-muted"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            )}
            {messages.length === 0 && <GreetingAnimation />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ai-bg via-ai-bg to-transparent pt-10 pb-6 px-4">
          <div className="max-w-3xl mx-auto w-full relative">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-6">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(prompt)}
                    className="bg-ai-panel/80 backdrop-blur hover:bg-ai-panel-hover border border-ai-border text-sm text-ai-text py-2.5 px-5 rounded-full transition-colors drop-shadow-sm"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            )}

            <div className="relative group shadow-[0_4px_20px_rgba(16,163,127,0.08)] rounded-2xl transition-all duration-300 focus-within:shadow-[0_8px_30px_rgba(16,163,127,0.2)] focus-within:-translate-y-1 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-transparent dark:to-transparent">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Message Rohan GPT..."
                className="w-full bg-white/60 dark:bg-ai-panel border-2 border-emerald-200/80 dark:border-ai-primary/30 text-ai-text rounded-2xl pl-5 pr-14 py-4 md:py-5 focus:outline-none focus:border-emerald-400 dark:focus:border-ai-primary focus:bg-white dark:focus:bg-ai-bg transition-colors resize-none min-h-[60px] max-h-[200px] text-base placeholder-ai-muted/70 backdrop-blur-sm"
                rows={1}
                style={{ overflowY: "hidden" }}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 md:bottom-4 p-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/40 disabled:opacity-60 hover:scale-110 hover:shadow-teal-500/60 active:scale-95 transition-all"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
