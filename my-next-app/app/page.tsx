import Link from 'next/link';
import { Counter } from '@/components/Counter';
import { getSortedPostsData } from '@/lib/posts';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Bernalgorithm</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          IoT, Embedded & Firmware engineering meets modern web development.
        </p>
      </header>

      {/* Interactive component test */}
      <section className="mb-12 p-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-semibold mb-2">Interactive Counter Demo</h2>
        <Counter />
      </section>

      {/* Projects / Blog posts section */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Articles & Projects</h2>
        <div className="space-y-4">
          {allPostsData.map((post) => (
            <article
              key={post.slug}
              className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-400 dark:hover:border-gray-600 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
                <h3 className="text-xl font-semibold">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    {post.title}
                  </Link>
                </h3>
                {post.date && (
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {post.date}
                  </time>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                {post.content.slice(0, 150)}...
              </p>
              <Link
                href={`/posts/${post.slug}`}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Read article &rarr;
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
