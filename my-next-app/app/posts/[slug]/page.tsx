import { getPostBySlug, getSortedPostsData } from '@/lib/posts';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PcbBirdGame } from '@/components/PcbBirdGame';
import { SiliconBreakthroughGame } from '@/components/SiliconBreakthroughGame';
import { Counter } from '@/components/Counter';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }
  return {
    title: `${post.title} | Bernalgorithm Lab Notebook`,
    description: post.description || `${post.title} — Technical lab notebook entry`,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <article className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Breadcrumb & Telemetry Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <Link
          href="/#notebook"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 hover:border-emerald-500/50 transition"
        >
          &larr; RETURN TO LAB NOTEBOOK
        </Link>
        <span className="text-slate-500">FILE: /content/{post.fileName}</span>
      </div>

      {/* Lab Entry Header Card */}
      <header className="mb-10 rounded-2xl border border-slate-800 bg-slate-950/90 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-400 mb-3">
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
            LAB_DISPATCH
          </span>
          {post.date && (
            <time className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              DATE: {post.date}
            </time>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
          {post.title}
        </h1>

        {post.description && (
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            {post.description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-900">
            {tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* MDX Content Body */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/75 p-6 sm:p-10 shadow-xl space-y-5 text-slate-200 leading-relaxed">
        <MDXRemote
          source={post.content}
          components={{
            PcbBirdGame,
            SiliconBreakthroughGame,
            Counter,
            h2: (props) => (
              <h2
                className="text-2xl font-extrabold text-white tracking-tight pt-6 pb-2 border-b border-slate-800/80"
                {...props}
              />
            ),
            h3: (props) => (
              <h3 className="text-lg font-bold text-emerald-300 pt-4" {...props} />
            ),
            p: (props) => <p className="text-slate-300 leading-relaxed" {...props} />,
            ul: (props) => (
              <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2" {...props} />
            ),
            ol: (props) => (
              <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2" {...props} />
            ),
            li: (props) => <li className="leading-relaxed" {...props} />,
            hr: () => <hr className="border-slate-800 my-8" />,
            code: (props) => (
              <code
                className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-900 text-emerald-300 border border-slate-800"
                {...props}
              />
            ),
            pre: (props) => (
              <pre
                className="font-mono text-xs p-4 rounded-xl bg-slate-900/95 border border-slate-800 overflow-x-auto text-slate-200 my-4"
                {...props}
              />
            ),
            a: (props) => (
              <a
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                {...props}
              />
            ),
          }}
        />
      </div>
    </article>
  );
}
