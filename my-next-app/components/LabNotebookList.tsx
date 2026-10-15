'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { PostData } from '@/lib/posts';

interface LabNotebookListProps {
  posts: PostData[];
}

const INTERACTIVE_SLUGS = new Set([
  'robotic-arm-inverse-kinematics',
  'closed-loop-pid-control-lab',
  'silicon-breakthrough',
  'pcb-bird-runner',
]);

export function LabNotebookList({ posts }: LabNotebookListProps) {
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      if (Array.isArray(post.tags)) {
        for (const t of post.tags) {
          counts.set(t, (counts.get(t) || 0) + 1);
        }
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedTag === 'ALL') return posts;
    return posts.filter(
      (post) => Array.isArray(post.tags) && post.tags.includes(selectedTag)
    );
  }, [posts, selectedTag]);

  return (
    <div className="space-y-6">
      {/* Clean Topic Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setSelectedTag('ALL')}
          className={`px-3 py-1.5 rounded-full font-medium transition cursor-pointer ${
            selectedTag === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          All Articles ({posts.length})
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag(tag === selectedTag ? 'ALL' : tag)}
            className={`px-3 py-1.5 rounded-full font-medium transition cursor-pointer ${
              selectedTag === tag
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* High-Contrast Light Article Cards */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const tags = Array.isArray(post.tags) ? post.tags : [];
          const isInteractive = INTERACTIVE_SLUGS.has(post.slug);

          return (
            <article
              key={post.slug}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-2">
                  {post.date && <time className="font-medium text-slate-600">{post.date}</time>}
                  <span>&bull;</span>
                  <span>{post.readingTimeMinutes} min read</span>
                </div>
                {isInteractive && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                    Includes Live Interactive Simulator
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">
                <Link href={`/posts/${post.slug}`} className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {post.title}
                </Link>
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {post.description || `${post.content.slice(0, 160)}...`}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 relative z-10">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag === selectedTag ? 'ALL' : tag)}
                      className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
