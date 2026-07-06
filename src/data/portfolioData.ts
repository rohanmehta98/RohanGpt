/**
 * Portfolio Data — Rohan Mehta
 *
 * SINGLE SOURCE OF TRUTH for structured facts about Rohan.
 * Every field here is grounded in his real resume / LinkedIn / GitHub.
 * Do NOT invent employers, metrics, or star counts — recruiters cross-check.
 *
 * Live GitHub repositories are fetched separately at runtime (see lib/github.ts)
 * and merged in, so this file only holds the curated, hand-written profile.
 */

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  location?: string;
  description: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  year?: string;
}

export const portfolioData = {
  name: "Rohan",
  fullName: "Rohan Mehta",
  title: "AI Engineer",
  tagline: "I build production LLM systems — RAG pipelines, multi-agent workflows, and MCP integrations.",
  location: "Chandigarh / Delhi, India",
  openToWork: true,

  summary:
    "GenAI / AI Engineer building and shipping production LLM systems. I specialise in RAG pipelines, " +
    "multi-agent orchestration with LangGraph, Model Context Protocol (MCP) integrations, and LLMOps " +
    "(evaluation + monitoring). Currently an AI Engineer at Bonn Nutrients Pvt Ltd, where I've built " +
    "multi-agent RAG systems and MCP servers that connect LLM agents to internal APIs and databases. " +
    "I've also taught advanced GenAI to industry professionals and done RLHF-style model evaluation at Outlier.",

  // ── Skills, grouped the way the resume presents them ──────────────────────
  aiStack: [
    "LangChain",
    "LangGraph",
    "LlamaIndex",
    "Model Context Protocol (MCP)",
    "OpenAI API",
    "Anthropic Claude API",
    "Google Gemini",
    "Hugging Face Transformers",
    "PEFT / LoRA / QLoRA (fine-tuning)",
    "RAG & Vector Search (Pinecone, Qdrant, ChromaDB, FAISS)",
    "RAGAS (LLM evaluation)",
    "Prompt Engineering",
    "Agentic & Multi-Agent Systems",
    "Embeddings",
    "LLMOps",
  ],

  engineeringStack: [
    "Python",
    "SQL",
    "Bash",
    "FastAPI",
    "Docker",
    "Streamlit",
    "Next.js / TypeScript",
    "LangSmith",
    "Helicone",
    "REST APIs",
    "AWS (Bedrock, S3, Lambda)",
    "Google Cloud (Vertex AI)",
    "Hugging Face Spaces",
    "Git / GitHub",
  ],

  topSkills: ["Model Context Protocol (MCP)", "AI Engineering", "Large Language Models (LLM)"],

  // ── Professional experience (most recent first) ──────────────────────────
  experience: [
    {
      id: "exp-bnpl",
      company: "Bonn Nutrients Pvt Ltd (BNPL)",
      role: "AI Engineer",
      duration: "Jan 2026 – Present",
      location: "Chandigarh, India",
      description: [
        "Architected a multi-agent RAG pipeline with LangGraph + Qdrant over internal product and supplier docs, cutting manual query-resolution time by ~40% for the operations team.",
        "Designed and deployed MCP server integrations that let LLM agents call internal REST APIs and business databases — reducing average agent response latency by 30% via structured tool routing.",
        "Built a GenAI reporting assistant (OpenAI API + FastAPI) that automates weekly business summaries, eliminating 5+ hours/week of manual reporting.",
        "Implemented RAGAS evaluation pipelines (faithfulness, answer relevancy, context recall) to monitor RAG quality in production, holding precision above 87%.",
      ],
    },
    {
      id: "exp-genai-sme",
      company: "Physics Wallah · Newton School · MBCIE (Gen AI SME)",
      role: "Generative AI Subject Matter Expert",
      duration: "Sep 2025 – Dec 2025",
      location: "India",
      description: [
        "Designed and delivered advanced Generative AI curricula for top ed-tech platforms and corporate partners.",
        "Ran hands-on bootcamps for industry professionals on practical LLMs, RAG architectures, and AI-native workflows.",
        "Authored end-to-end technical documentation and lecture series bridging cutting-edge AI research and real-world use.",
      ],
    },
    {
      id: "exp-10x",
      company: "10x.in",
      role: "AI / Data Science Research Analyst (SME)",
      duration: "Oct 2024 – Nov 2025",
      location: "Noida, India",
      description: [
        "Led data science content strategy and project design for international cohorts — correlated with a 35% increase in student enrollment.",
        "Built a Python + Streamlit at-risk-student detection dashboard using behavioral analytics, reducing cohort dropouts by 25%.",
        "Delivered 10+ data science training modules across time zones, sustaining a 95% satisfaction rate across 300+ students.",
      ],
    },
    {
      id: "exp-outlier",
      company: "Outlier",
      role: "Prompt Engineer / AI Language Trainer",
      duration: "Apr 2024 – Aug 2024",
      location: "United States (Remote)",
      description: [
        "Evaluated and ranked chatbot responses for accuracy, relevance, and helpfulness — core RLHF-style feedback work.",
        "Compared multiple model responses to the same prompt and wrote detailed preference justifications used to align model behavior.",
      ],
    },
    {
      id: "exp-xenonstack",
      company: "XenonStack",
      role: "Associate Software Engineer",
      duration: "Jan 2024 – Feb 2024",
      location: "Mohali, Punjab, India",
      description: [
        "Early software engineering role at a technology consulting firm, working across the development workflow.",
      ],
    },
  ] as Experience[],

  // ── Curated flagship projects (live GitHub repos are merged in at runtime) ──
  projects: [
    {
      id: "proj-mcp-assistant",
      title: "MCP-Powered Multi-Agent Business Assistant",
      description:
        "Production multi-agent system using Model Context Protocol to connect LLM agents to Gmail, Google Calendar, and Notion — autonomously drafting emails, scheduling meetings, and generating action-item summaries. Implements tool-routing, human-in-the-loop approval gates, and structured error handling. Cut simulated scheduling overhead by 60%.",
      techStack: ["LangGraph", "MCP", "FastAPI", "Docker", "OpenAI API"],
      year: "2026",
    },
    {
      id: "proj-rag-eval",
      title: "Production RAG System with Evaluation Pipeline",
      description:
        "Full-stack RAG pipeline over 500+ documents with adaptive chunking, semantic re-ranking (Cohere), and hybrid dense–sparse retrieval. Achieved 91% faithfulness on RAGAS benchmarks and ships a Streamlit evaluation dashboard tracking precision, recall, and answer relevancy across iterations.",
      techStack: ["LlamaIndex", "Qdrant", "RAGAS", "Streamlit", "Python"],
      year: "2025",
    },
    {
      id: "proj-qlora",
      title: "Domain-Specific LLM Fine-Tuning: QLoRA on Llama 3",
      description:
        "Fine-tuned Llama 3 8B on a custom domain Q&A dataset using QLoRA (4-bit quantization) via Hugging Face PEFT. Achieved a 23% accuracy improvement over the base model and published the adapter to the Hugging Face Hub.",
      techStack: ["PEFT", "QLoRA", "Hugging Face", "bitsandbytes", "Python"],
      year: "2025",
    },
    {
      id: "proj-rohangpt",
      title: "RohanGPT — This AI Portfolio",
      description:
        "This app. A ChatGPT-style portfolio with a hybrid RAG engine (Gemini embeddings + TF-IDF fallback) over Rohan's resume, LinkedIn, and GitHub, plus live GitHub project sync. Built with Next.js + Gemini.",
      techStack: ["Next.js", "TypeScript", "Gemini", "RAG", "GitHub API"],
      link: "https://github.com/rohanmehta98/RohanGpt",
      year: "2026",
    },
  ] as Project[],

  education: [
    {
      degree: "B.E. in Mathematics & Computer Science",
      institution: "Chandigarh University",
      duration: "2020 – 2024",
    },
    {
      degree: "M.A. in Economics (in progress)",
      institution: "IGNOU, Delhi",
      duration: "2024 – 2026",
    },
  ],

  certifications: [
    "Data Engineering & Machine Learning using Spark — Databricks",
    "Machine Learning for Computer Vision — Coursera",
    "AI Engineering Bootcamp — Udemy",
    "Introduction to Computer Vision",
    "Algorithmic Toolbox",
  ],

  keyMetrics: [
    "~40% reduction in manual query-resolution time (multi-agent RAG)",
    "30% lower agent response latency via MCP tool routing",
    "87%+ RAG precision maintained in production (RAGAS)",
    "91% RAGAS faithfulness on a 500+ document RAG pipeline",
    "23% accuracy gain from QLoRA fine-tuning on Llama 3",
    "35% enrollment increase and 25% dropout reduction (data science)",
  ],

  links: {
    github: "https://github.com/rohanmehta98",
    linkedin: "https://www.linkedin.com/in/rohanmehtaa",
    email: "mailto:mehtarohan173@gmail.com",
    portfolio: "https://rohangpt.vercel.app",
  },
};
