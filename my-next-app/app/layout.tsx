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
  title: "Bernalgorithm | Embedded Firmware & Full-Stack Engineering Lab",
  description:
    "Personal engineering portfolio and lab notebook bridging bare-metal IoT/embedded firmware discipline with modern web architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Sticky Top Hardware Telemetry Bar */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-mono text-sm font-black tracking-wider text-white hover:text-emerald-400 transition"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>BERNALGORITHM</span>
              <span className="text-slate-600 font-normal hidden sm:inline">{'//'}</span>
              <span className="text-xs font-normal text-emerald-400/90 hidden sm:inline">
                FW_WEB_LAB
              </span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-5 font-mono text-xs text-slate-300">
              <Link
                href="/#workbench"
                className="px-2.5 py-1.5 rounded-lg hover:bg-slate-900 hover:text-emerald-400 transition"
              >
                01.Workbench
              </Link>
              <Link
                href="/#architecture"
                className="px-2.5 py-1.5 rounded-lg hover:bg-slate-900 hover:text-cyan-400 transition"
              >
                02.Domains
              </Link>
              <Link
                href="/#notebook"
                className="px-2.5 py-1.5 rounded-lg hover:bg-slate-900 hover:text-amber-400 transition"
              >
                03.Notebook
              </Link>
              <a
                href="https://github.com/bernalgorithm"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:text-emerald-300 transition"
              >
                GitHub &nearr;
              </a>
            </nav>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        {/* Technical Telemetry Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/90 mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
              <span>BERNALGORITHM // EMBEDDED &amp; WEB SYSTEMS LAB</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span>TARGET: STATIC_EXPORT</span>
              <span>&bull;</span>
              <span>PIPELINE: NEXT_RSC + MDX</span>
              <span>&bull;</span>
              <span>NODE: v20.12.0</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
