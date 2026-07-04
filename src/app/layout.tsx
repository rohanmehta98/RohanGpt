import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://rohangpt.vercel.app'),
  title: 'RohanGPT — AI Engineer Portfolio | Rohan Mehta',
  description:
    "Chat with RohanGPT — an AI-powered portfolio for Rohan Mehta, an AI Engineer. Grounded in real documents (RAG) and live GitHub activity. Ask about his LLM systems, RAG pipelines, MCP integrations, and experience.",
  keywords: [
    'AI Engineer', 'GenAI', 'LLM', 'RAG', 'Model Context Protocol', 'MCP',
    'LangGraph', 'LangChain', 'Next.js', 'Gemini', 'Rohan Mehta',
  ],
  authors: [{ name: 'Rohan Mehta' }],
  openGraph: {
    title: 'RohanGPT — AI Engineer Portfolio',
    description: 'An interactive, RAG-grounded AI portfolio. Ask it anything about Rohan Mehta.',
    type: 'website',
    url: 'https://rohangpt.vercel.app',
    siteName: 'RohanGPT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RohanGPT — AI Engineer Portfolio',
    description: 'Chat with an AI grounded in Rohan Mehta\'s real résumé, LinkedIn & live GitHub.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-ai-bg text-ai-text antialiased">
        {children}
      </body>
    </html>
  );
}
