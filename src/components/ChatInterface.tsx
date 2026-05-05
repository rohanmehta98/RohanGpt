"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Menu, Code, Wrench, BookOpen, Briefcase, MessageSquare } from "lucide-react";
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

  const words = "Hello recruiters I am RohanGPT let's hire him today".split(" ");

  return (
    <div className="flex flex-col items-center justify-center h-full pt-4 md:pt-10 pb-32 lg:pb-40">
      {/* 1. Logo On Top */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-ai-primary/20 to-cyan-500/10 border border-ai-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,163,127,0.15)] relative overflow-hidden"
      >
        <Bot size={40} className="text-ai-primary drop-shadow-md z-10" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-bl from-transparent via-ai-primary/10 to-transparent"
        />
      </motion.div>

      {/* 2. Animated Text Below */}
      <div className="h-32 flex items-start justify-center">
        <AnimatePresence mode="wait">
          <motion.div 
            key={animationKey}
            className="text-3xl md:text-5xl font-bold text-center max-w-3xl px-4 tracking-tight leading-normal"
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
  const [graphifyMode, setGraphifyMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      let response: string;
      if (graphifyMode) {
        // Query the graphify graph
        const res = await fetch('/api/graphify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text }),
        });
        const data: AgentResponse = await res.json();
        response = data.result || data.error || 'Error querying graph';
      } else {
        response = await processQuery(text);
      }
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, there was an error processing your request.",
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
            className="flex-shrink-0 bg-[#171717] border-r border-ai-border flex flex-col hidden md:flex"
          >
            <div className="p-4 flex flex-col gap-2 h-full">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMessages([])}
                className="flex items-center gap-2 p-3 w-full bg-gradient-to-r from-ai-panel-hover to-[#2a2a2a] border border-[#333] rounded-xl text-sm font-medium transition-colors hover:border-[#555] shadow-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="text-xl text-ai-primary">+</span> New Chat
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGraphifyMode(!graphifyMode)}
                className={`flex items-center gap-2 p-3 w-full border rounded-xl text-sm font-medium transition-colors shadow-sm relative overflow-hidden group ${
                  graphifyMode 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white' 
                    : 'bg-gradient-to-r from-ai-panel-hover to-[#2a2a2a] border-[#333] hover:border-[#555] text-gray-300'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Code size={16} className="flex-shrink-0" />
                Graphify Mode {graphifyMode ? 'ON' : 'OFF'}
              </motion.button>
              
              <div className="mt-8 flex-1 overflow-y-auto pr-1">
                <p className="text-xs font-semibold text-ai-muted mb-3 px-2 uppercase tracking-wider">Knowledge Topics</p>
                {CHAT_TOPICS.map((topic, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    onClick={() => handleSend(topic.prompt)}
                    className="flex items-center gap-3 p-2 w-full hover:bg-ai-panel rounded-lg text-sm text-left transition-colors mb-2 truncate text-gray-300 group"
                  >
                    <topic.icon size={16} className="text-gray-500 group-hover:text-ai-primary transition-colors flex-shrink-0" />
                    <span className="truncate">{topic.label}</span>
                  </motion.button>
                ))}

                <p className="text-xs font-semibold text-ai-muted mt-6 mb-3 px-2 uppercase tracking-wider">Recents</p>
                {recentSearches.length === 0 ? (
                  <p className="text-xs text-[#555] px-2 italic">No recent searches...</p>
                ) : (
                  recentSearches.map((prompt, i) => (
                    <motion.button
                      key={`recent-${i}`}
                      whileHover={{ x: 4 }}
                      onClick={() => handleSend(prompt)}
                      className="flex items-center gap-2 p-2 w-full hover:bg-ai-panel rounded-lg text-sm text-left transition-colors mb-1 truncate text-gray-400 group"
                    >
                      <MessageSquare size={14} className="text-[#555] group-hover:text-ai-muted flex-shrink-0 transition-colors" />
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
        
        {/* Desktop Toggle Button (floating) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex absolute top-4 left-4 z-10 p-2 text-ai-muted hover:text-white transition-colors"
          title="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pb-32 pt-4">
          <div className="max-w-3xl mx-auto w-full px-4 flex flex-col gap-6">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 p-4 rounded-lg ${
                  m.role === "user" ? "bg-[#212121] ml-auto max-w-[85%]" : "bg-transparent mr-auto max-w-full"
                }`}
              >
                {m.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-ai-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={18} className="text-white" />
                  </div>
                )}
                
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-[#333]">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 p-4 rounded-lg bg-transparent mr-auto max-w-full">
                 <div className="w-8 h-8 rounded-full bg-ai-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={18} className="text-white" />
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
                      className="bg-[#212121]/80 backdrop-blur hover:bg-[#2f2f2f] border border-[#333] hover:border-[#555] text-sm text-gray-200 py-2.5 px-5 rounded-full transition-colors drop-shadow-sm"
                    >
                      {prompt}
                    </motion.button>
                 ))}
               </div>
            )}
            
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder={graphifyMode ? "Query the codebase graph..." : "Message Rohan GPT..."}
                className="w-full bg-[#2f2f2f] border border-[#444] text-white rounded-xl pl-4 pr-12 py-3 md:py-4 focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none min-h-[52px] max-h-[200px]"
                rows={1}
                style={{ overflowY: "hidden" }}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 p-1 rounded-lg bg-white text-black disabled:opacity-30 disabled:bg-transparent disabled:text-gray-400 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-center text-xs text-ai-muted mt-3">
              Rohan GPT can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
