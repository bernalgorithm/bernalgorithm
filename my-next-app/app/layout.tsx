import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alex Bernal | Embedded Systems, IoT & Full-Stack Software Engineer",
  description:
    "Personal site, career story, and hobby engineering sandbox of Alexander Bernal—Senior Embedded Systems, IoT, and Full-Stack Software Engineer based in Memphis, TN.",
  openGraph: {
    title: "Alex Bernal | Embedded Systems, IoT & Full-Stack Software Engineer",
    description:
      "From the chemistry lab bench to architecting global Embedded Linux and IoT control systems across 20+ countries.",
    type: "website",
    locale: "en_US",
    siteName: "Alex Bernal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alex Bernal | Embedded Systems, IoT & Full-Stack Software Engineer",
    description:
      "Personal site, career story, and interactive hobby simulations of Alexander Bernal.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warm-paper text-zinc-900 selection:bg-blue-100 selection:text-blue-950 print:bg-white print:text-black">
        {/* Warm, Clean Personal Navigation Bar */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#faf9f6]/90 border-b border-stone-200/90 print:hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-base font-bold tracking-tight text-zinc-900 hover:text-blue-700 transition shrink-0"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 text-white font-mono text-xs font-bold">
                AB
              </span>
              <span>Alex Bernal</span>
              <span className="text-xs text-zinc-500 font-normal hidden md:inline border-l border-stone-300 pl-2.5">
                Memphis, TN
              </span>
            </Link>

            <nav
              aria-label="Main Navigation"
              className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-zinc-600"
            >
              <Link
                href="/#story"
                className="px-3 py-1.5 rounded-lg hover:text-zinc-900 hover:bg-stone-200/60 transition whitespace-nowrap hidden sm:inline-block"
              >
                My Story
              </Link>
              <Link
                href="/demos"
                className="px-3 py-1.5 rounded-lg hover:text-zinc-900 hover:bg-stone-200/60 transition whitespace-nowrap"
              >
                Hobby Sandbox
              </Link>
              <Link
                href="/blog"
                className="px-3 py-1.5 rounded-lg hover:text-zinc-900 hover:bg-stone-200/60 transition whitespace-nowrap"
              >
                Writing
              </Link>
              <Link
                href="/resume"
                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 font-semibold transition whitespace-nowrap shadow-2xs"
              >
                Resume
              </Link>
            </nav>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        {/* Warm, Grounded Footer */}
        <footer className="bg-white border-t border-stone-200/90 print:hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-semibold text-zinc-900">
                Alexander Bernal &mdash; Memphis, TN
              </div>
              <p className="text-xs text-zinc-500">
                Senior Embedded Systems, IoT &amp; Full-Stack Software Engineer
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-zinc-600 font-medium">
              <Link href="/" className="hover:text-blue-700 transition">
                Home
              </Link>
              <Link href="/resume" className="hover:text-blue-700 transition">
                Resume
              </Link>
              <Link href="/demos" className="hover:text-blue-700 transition">
                Hobby Sandbox
              </Link>
              <Link href="/blog" className="hover:text-blue-700 transition">
                Writing
              </Link>
              <a
                href="mailto:me@alexanderbernal.dev"
                className="hover:text-blue-700 transition"
              >
                me@alexanderbernal.dev
              </a>
              <a
                href="https://www.linkedin.com/in/bernaale/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-700 transition"
              >
                LinkedIn ↗
              </a>
              <a
                href="https://github.com/bernalgorithm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-700 transition"
              >
                GitHub ↗
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
