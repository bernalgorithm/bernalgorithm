'use client';
import dynamic from 'next/dynamic';

// Dynamically import MDXRemote, disabling SSR
const MDXRemote = dynamic(
  () => import('next-mdx-remote').then((mod) => mod.MDXRemote),
  { ssr: false }
);

// This component is explicitly marked 'use client'
export function MDXWrapper({ source }) {
  return <MDXRemote {...source} />;
}
