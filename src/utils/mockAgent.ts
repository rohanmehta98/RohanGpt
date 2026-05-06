import { portfolioData } from "../data/portfolioData";
import type { QueryHandler } from "../types/agent";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const processQuery: QueryHandler = async (query) => {
  const lowerQuery = query.toLowerCase();

  // Simulate network delay for realism
  await delay(800 + Math.random() * 500);

  if (lowerQuery.includes("hi") || lowerQuery.includes("hello") || lowerQuery.includes("hey")) {
    return `Hello! I'm an interactive summary of ${portfolioData.name}'s portfolio. I can tell you about his **skills**, **experience**, **projects**, or provide **contact** links. What would you like to know?`;
  }

  if (lowerQuery.includes("skill") || lowerQuery.includes("tech")) {
    const skillList = portfolioData.skills.map((s) => `- ${s}`).join("\n");
    return `Here are some of the technologies I work with:\n\n${skillList}\n\nI'm always learning new things and adapting to the best tools for the job.`;
  }

  if (lowerQuery.includes("experience") || lowerQuery.includes("work") || lowerQuery.includes("job")) {
    const expStrings = portfolioData.experience.map((e) => {
      return `**${e.role}** at **${e.company}** (${e.duration})\n${e.description.map((d) => `- ${d}`).join("\n")}`;
    });
    return `Here is a summary of my professional experience:\n\n${expStrings.join("\n\n")}`;
  }

  if (lowerQuery.includes("project") || lowerQuery.includes("portfolio")) {
    const projStrings = portfolioData.projects.map((p) => {
      return `**${p.title}**\n${p.description}\n*Tech Stack: ${p.techStack.join(", ")}*`;
    });
    return `I've worked on some exciting projects recently. Here are a couple of highlights:\n\n${projStrings.join("\n\n")}`;
  }

  if (lowerQuery.includes("contact") || lowerQuery.includes("hire") || lowerQuery.includes("reach") || lowerQuery.includes("github") || lowerQuery.includes("linkedin")) {
    return `I'd love to connect! You can find my repositories on [GitHub](${portfolioData.links.github}) or message me. For email inquiries, use [${portfolioData.links.email}](${portfolioData.links.email}).`;
  }

  if (lowerQuery.includes("tell me about") || lowerQuery.includes("summary") || lowerQuery.includes("resume") || lowerQuery.includes("cv") || lowerQuery.includes("who are you")) {
    return `**Overview**\n${portfolioData.summary}\n\nYou can ask me specific questions like "What are your skills?" or "Show me your projects."`;
  }

  // Fallback response
  return `I'm not quite sure how to answer that specific question based on my current resume data. Try asking about my **experience**, **projects**, or **tech stack**!`;
}
