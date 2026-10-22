import type { Metadata } from 'next';
import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { LabNotebookList } from '@/components/LabNotebookList';

export const metadata: Metadata = {
  title: 'Engineering Blog & Hobby Lab Notes | Alexander Bernal',
  description:
    'Independent technical articles, personal project notes, and conceptual explorations by Alexander Bernal covering control theory, 3D kinematics math, state machines, and full-stack web development.',
};

export default function BlogPage() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      {/* Editorial Publication Header (Section 03 Identity) */}
      <header className="rounded-3xl border border-amber-200/90 bg-amber-50/55 p-6 sm:p-9 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-amber-900">
          <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-900 text-amber-50 font-mono uppercase tracking-wider">
            Section 03 // Engineering Blog &amp; Personal Lab Notes
          </span>
          <Link href="/" className="text-slate-700 hover:text-amber-900 transition">
            &larr; Back to Overview
          </Link>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Engineering Blog &amp; Hobby Lab Notes
        </h1>

        <p className="text-base sm:text-lg text-slate-700 max-w-3xl leading-relaxed">
          Independent technical articles, personal hobby project write-ups, and conceptual explorations across{' '}
          <strong className="text-slate-900 font-semibold">
            closed-loop control theory, 3D kinematics math, fault-tolerant state machines, offline-first web apps, and AI-assisted development
          </strong>
          . All articles and demos are written from an independent perspective and are unrelated to my employer.
        </p>
      </header>

      {/* Filterable List of All Articles */}
      <section aria-label="All Blog Posts">
        <LabNotebookList posts={allPostsData} />
      </section>
    </main>
  );
}
