import type { Metadata } from 'next';
import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { LabNotebookList } from '@/components/LabNotebookList';

export const metadata: Metadata = {
  title: 'Writing & Personal Notes | Alex Bernal',
  description:
    'Independent articles, personal project notes, and conceptual explorations by Alex Bernal covering control theory, 3D kinematics math, state machines, and full-stack web development.',
};

export default function BlogPage() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      {/* Warm Editorial Publication Header */}
      <header className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-9 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-zinc-700">
          <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 text-zinc-800 border border-stone-200">
            Personal Notebook &bull; Independent Hobby Notes
          </span>
          <Link href="/" className="text-zinc-600 hover:text-zinc-900 transition">
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
          Writing &amp; Hobby Project Notes
        </h1>

        <p className="text-base text-zinc-700 max-w-3xl leading-relaxed">
          Personal notes and conceptual explorations covering{' '}
          <strong className="text-zinc-900 font-semibold">
            offline-first household web apps, closed-loop control theory, 3D kinematics math, state machines, and AI-assisted development
          </strong>
          . Everything here is written from an independent hobbyist perspective unrelated to my employer.
        </p>
      </header>

      {/* Filterable List of All Articles */}
      <section aria-label="All Blog Posts">
        <LabNotebookList posts={allPostsData} />
      </section>
    </main>
  );
}
