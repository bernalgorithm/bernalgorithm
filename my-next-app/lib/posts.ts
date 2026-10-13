import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content');

export interface PostData {
  fileName: string;
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  content: string;
  [key: string]: unknown;
}

export function getSortedPostsData(): PostData[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData: PostData[] = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      return {
        fileName,
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date || '',
        content: matterResult.content,
        ...matterResult.data,
      };
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  return {
    fileName: `${slug}.md`,
    slug,
    title: matterResult.data.title || slug,
    date: matterResult.data.date || '',
    content: matterResult.content,
    ...matterResult.data,
  };
}
