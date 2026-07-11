import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat Dynamics Analyzer — WhatsApp Friendship Reports",
  description:
    "Upload a WhatsApp chat export and get a comprehensive, MBTI-style friendship analysis report. Powered by your own LLM API key. Nothing is stored on our servers.",
  keywords: [
    "WhatsApp",
    "chat analysis",
    "friendship report",
    "MBTI",
    "personality analysis",
    "LLM",
  ],
  authors: [{ name: "Chat Dynamics Analyzer" }],
  openGraph: {
    title: "Chat Dynamics Analyzer",
    description:
      "Comprehensive WhatsApp friendship analysis reports, powered by your own API key.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chat Dynamics Analyzer",
    description: "Comprehensive WhatsApp friendship analysis reports.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
