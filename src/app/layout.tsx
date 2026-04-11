import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rohan GPT | Personal AI Portfolio',
  description: 'Interactive AI-powered portfolio for Rohan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-ai-bg text-ai-text antialiased`}>
        {children}
      </body>
    </html>
  );
}
