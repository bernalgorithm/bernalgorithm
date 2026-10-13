---
title: 'Lab Notebook: Exploring Agentic Workflows with Google Antigravity'
date: '2026-10-09'
description: 'Reflections on pair programming with Antigravity (agy)—bridging firmware engineering discipline, compiler-driven feedback loops, and modern React Server Components.'
tags: ['Agentic AI', 'Next.js', 'React Server Components', 'Antigravity', 'Web Development']
---

As an embedded and firmware engineer stepping into modern web development, my mental model is heavily rooted in deterministic execution, compiler diagnostics, and explicit interface boundaries. Whether debugging an SPI bus transaction with a logic analyzer or resolving memory alignment on an ARM Cortex microcontroller, engineering progress relies on tight, verifiable feedback loops.

Today, I explored pair programming using **Google Antigravity (`agy`)**, a terminal-native agentic development tool, to modernize the markdown pipeline and build system for this portfolio site. Here are architectural notes and observations on how agentic workflows integrate into a technical project.

---

## 1. Setting Explicit Boundaries: `AGENTS.md` as System Constraints

In embedded development, memory maps and datasheets define hard boundaries that software cannot violate. In agentic development, declarative rule files like `AGENTS.md` serve an analogous purpose.

By establishing technical constraints up front:
* **Target Architecture**: Static site export (`output: 'export'`) for GitHub Pages without server-side Node.js runtimes.
* **Stack**: Next.js App Router (v16), React 19, and Tailwind CSS.
* **Content Layer**: Static Markdown parsing with `gray-matter` and `next-mdx-remote`.

The agent maintains operational awareness of *why* choices are made rather than hallucinating generic solutions that break deployment targets (e.g. attempting to rely on dynamic edge server runtimes).

---

## 2. Navigating the Server/Client Boundary in Next.js 16

One of the central challenges when building this site's blog was rendering Markdown into HTML. 

Earlier iterations attempted to wrap `MDXRemote` inside a Client Component using `dynamic(..., { ssr: false })` to work around React hook issues in Server Components. However, under Turbopack in Next.js 16, this caused ESM chunk resolution failures during production builds:

```
Module not found: ESM packages (next-mdx-remote) need to be imported. Use 'import' to reference the package instead.
```

### The Architectural Pivot: React Server Components (`RSC`)
Working with Antigravity, we refactored the pipeline to use `next-mdx-remote/rsc` directly inside Server Components:

```tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPostBySlug } from '@/lib/posts';

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return (
    <article className="prose">
      <MDXRemote source={post.content} />
    </article>
  );
}
```

This eliminated client-side JavaScript hydration overhead for static text, simplified the component tree, and allowed Next.js's static page generator to bake markdown directly into pure HTML at build time.

---

## 3. The Compiler-Driven Agent Loop

The most powerful aspect of pairing with an agentic CLI is closing the loop between code generation and compiler diagnostics:

1. **Autonomous Verification**: Rather than assuming generated code works, the agent immediately ran `npm run build` and `npm run lint`.
2. **Type Error Resolution**: When TypeScript flagged a missing property in the post reader, the agent converted `lib/posts.js` into typed `lib/posts.ts`, explicitly typing `PostData` interfaces and resolving ESLint strictness rules.
3. **SSG Generation**: Adding dynamic routing (`app/posts/[slug]/page.tsx`) required `generateStaticParams()` to allow Next.js to precompute static HTML for every article:

```ts
export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

---

## Key Takeaways

1. **Agents shine with strict type systems**: TypeScript and compiler outputs give the agent an objective source of truth to iterate against until zero warnings remain.
2. **Context architecture matters**: Keeping living documentation like `DEVELOPMENT_LOG.md` and `AGENTS.md` creates a persistent memory layer across sessions.
3. **Zero-runtime static simplicity**: Combining React Server Components with static export yields the best of both worlds: modern component composition with lightweight, self-hosted static HTML.
