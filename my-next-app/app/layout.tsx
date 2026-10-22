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
  title: "Alexander Bernal | Cyber-Physical Systems, IoT, Automation & Full-Stack Engineer",
  description:
    "Engineering portfolio, interactive technical demos, and architecture blog of Alexander Bernal—specializing in Embedded Linux fleets, IoT, closed-loop automation, data center telemetry, and full-stack software.",
  openGraph: {
    title: "Alexander Bernal | Cyber-Physical Systems, IoT, Automation & Full-Stack Engineer",
    description:
      "Portfolio, interactive 60 FPS simulators, and systems architecture case studies across IoT, automation, distributed Linux fleets, and full-stack web.",
    type: "website",
    locale: "en_US",
    siteName: "Alexander Bernal — Engineering Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alexander Bernal | Systems, IoT, Automation & Full-Stack Portfolio",
    description:
      "Interactive 60 FPS simulators, fault-tolerant state machines, and systems engineering case studies.",
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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 print:bg-white print:text-slate-900">
        {/* Clean, High-Contrast Top Navigation Bar */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200 shadow-xs print:hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 hover:text-blue-600 transition shrink-0"
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Alexander Bernal</span>
              <span className="text-xs text-slate-500 font-normal hidden md:inline border-l border-slate-200 pl-2.5">
                Systems, IoT &amp; Automation Engineer
              </span>
            </Link>

            <nav
              aria-label="Main Navigation"
              className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-slate-600"
            >
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
              >
                About
              </Link>
              <Link
                href="/demos"
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
              >
                Interactive Demos
              </Link>
              <Link
                href="/blog"
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
              >
                Blog
              </Link>
              <Link
                href="/resume"
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
              >
                Resume
              </Link>
              <a
                href="https://github.com/bernalgorithm"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex ml-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition whitespace-nowrap"
              >
                GitHub ↗
              </a>
            </nav>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        {/* Clean Light Footer */}
        <footer className="bg-white border-t border-slate-200 print:hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Alexander Bernal &mdash; Embedded Systems, IoT, Control Systems &amp; Full-Stack</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-slate-600">
              <Link href="/" className="hover:text-blue-600 transition">
                About
              </Link>
              <Link href="/demos" className="hover:text-blue-600 transition">
                Interactive Demos
              </Link>
              <Link href="/blog" className="hover:text-blue-600 transition">
                Blog
              </Link>
              <Link href="/resume" className="hover:text-blue-600 transition">
                Resume
              </Link>
              <a
                href="mailto:me@alexanderbernal.dev"
                className="hover:text-blue-600 transition"
              >
                me@alexanderbernal.dev
              </a>
              <a
                href="https://www.linkedin.com/in/bernaale/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
