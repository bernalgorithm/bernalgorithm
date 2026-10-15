import { getPostBySlug, getSortedPostsData } from '@/lib/posts';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RoboticArmIkLab } from '@/components/RoboticArmIkLab';
import { PidControlLab } from '@/components/PidControlLab';
import { PcbBirdGame } from '@/components/PcbBirdGame';
import { SiliconBreakthroughGame } from '@/components/SiliconBreakthroughGame';
import { Counter } from '@/components/Counter';
import { CopyCodeBlock } from '@/components/CopyCodeBlock';

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
  const description = post.description || `${post.title} — Engineering article by Alexander Bernal`;
  return {
    title: `${post.title} | Alexander Bernal`,
    description,
    openGraph: {
      title: `${post.title} | Alexander Bernal`,
      description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const allPosts = getSortedPostsData();
  const postIndex = allPosts.findIndex((p) => p.slug === slug);
  const post = postIndex >= 0 ? allPosts[postIndex] : getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const newerPost = postIndex > 0 ? allPosts[postIndex - 1] : null;
  const olderPost =
    postIndex >= 0 && postIndex < allPosts.length - 1 ? allPosts[postIndex + 1] : null;

  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <article className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Top Breadcrumb Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-2xs transition"
          >
            &larr; All Blog Articles
          </Link>
          <Link
            href="/demos"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-2xs transition"
          >
            Interactive Demos
          </Link>
        </div>
        <span className="text-slate-500">Published {post.date}</span>
      </div>

      {/* Article Header Card */}
      <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
            Engineering Article
          </span>
          {post.date && (
            <time className="font-medium text-slate-600">
              {post.date}
            </time>
          )}
          <span>&bull;</span>
          <span className="font-medium text-slate-600">
            {post.readingTimeMinutes} min read
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
          {post.title}
        </h1>

        {post.description && (
          <p className="text-slate-600 text-base leading-relaxed mb-4">
            {post.description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* MDX Content Body */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-5 text-slate-700 leading-relaxed">
        <MDXRemote
          source={post.content}
          components={{
            RoboticArmIkLab,
            PidControlLab,
            PcbBirdGame,
            SiliconBreakthroughGame,
            Counter,
            h2: (props) => (
              <h2
                className="text-2xl font-bold text-slate-900 tracking-tight pt-6 pb-2 border-b border-slate-200"
                {...props}
              />
            ),
            h3: (props) => (
              <h3 className="text-lg font-bold text-slate-900 pt-4" {...props} />
            ),
            h4: (props) => (
              <h4 className="text-base font-bold text-slate-800 pt-3" {...props} />
            ),
            p: (props) => <p className="text-slate-700 leading-relaxed" {...props} />,
            ul: (props) => (
              <ul className="list-disc list-inside space-y-2 text-slate-700 pl-2" {...props} />
            ),
            ol: (props) => (
              <ol className="list-decimal list-inside space-y-2 text-slate-700 pl-2" {...props} />
            ),
            li: (props) => <li className="leading-relaxed" {...props} />,
            hr: () => <hr className="border-slate-200 my-8" />,
            code: (props) => (
              <code
                className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200"
                {...props}
              />
            ),
            pre: CopyCodeBlock,
            a: (props) => (
              <a
                className="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-4"
                {...props}
              />
            ),
          }}
        />
      </div>

      {/* Previous / Next Article Pagination */}
      {(newerPost || olderPost) && (
        <nav
          aria-label="Article Pagination"
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
        >
          {olderPost ? (
            <Link
              href={`/posts/${olderPost.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition flex flex-col justify-between gap-1.5"
            >
              <span className="font-semibold text-slate-500 group-hover:text-blue-600 transition">
                &larr; Previous Article
              </span>
              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                {olderPost.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {newerPost ? (
            <Link
              href={`/posts/${newerPost.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition flex flex-col justify-between gap-1.5 sm:text-right"
            >
              <span className="font-semibold text-slate-500 group-hover:text-blue-600 transition">
                Next Article &rarr;
              </span>
              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                {newerPost.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      )}
    </article>
  );
}
