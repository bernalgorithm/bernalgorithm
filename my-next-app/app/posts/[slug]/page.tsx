import { getPostBySlug, getSortedPostsData } from '@/lib/posts';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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
    title: `${post.title} | Bernal Gorithm`,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          &larr; Back to home
        </Link>
      </div>

      <header className="mb-8 border-b border-gray-200 pb-4 dark:border-gray-800">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{post.title}</h1>
        {post.date && (
          <time className="text-sm text-gray-500 dark:text-gray-400">
            {post.date}
          </time>
        )}
      </header>

      <div className="prose dark:prose-invert max-w-none leading-relaxed space-y-4">
        <MDXRemote source={post.content} />
      </div>
    </article>
  );
}
