import { Counter } from '@/components/Counter';
import { getSortedPostsData } from '@/lib/posts.js';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXWrapper } from '@/components/MDXWrapper';

// 1. Mark the component as async to allow 'await' inside
export default async function Home() {
  const allPostsData = getSortedPostsData();

  // 2. Prepare the MDX source for the posts you want to display
  // Note: Since allPostsData is an array, we map over it. 
  // However, MDXRemote needs to be serialized individually.
  const postsWithContent = await Promise.all(
    allPostsData.map(async (post) => {
      const source = await serialize(post.content || ""); 
      return { ...post, source };
    })
  );


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">My First Next.js App</h1>
      <h2 className="text-2xl mb-4">How fast does it update?</h2>
      <Counter />
      
      <h1>My Projects</h1>
      <ul>
        {postsWithContent.map((post) => (
	  <li key={post.fileName}>
	      <h3>{post.title}</h3>
	      <p>{post.date}</p>
	    <MDXWrapper source={post.source} /> {/* This turns the text into HTML */}
	  </li>
	))}
      </ul>
    </main>
  );
}
