import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/shell/TopNav";
import { LeftPalette } from "@/components/shell/LeftPalette";
import { RightInspector } from "@/components/shell/RightInspector";
import { ChatBar } from "@/components/shell/ChatBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Agent Notebook",
  description: "Create AI agents with natural language using a visual notebook interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: '8px', height: '100vh', overflow: 'hidden' }}>
        <div style={{ height: 'calc(100vh - 16px)', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F5F5', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)' }}>
          <TopNav />
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <LeftPalette />
            <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#F5F5F5' }}>
              {children}
            </main>
            <RightInspector />
          </div>
          <ChatBar />
        </div>
      </body>
    </html>
  );
}
