# Development Log
This is a living log of my progress making my personal website.


## [2026-05-30] - Implementation of Markdown Blog Pipeline
- **Problem**: Needed to render Markdown files from `content/` as HTML in the browser.
- **Decision**: Used `gray-matter` for parsing and `next-mdx-remote` for compilation.
- **Hurdle**: Encountered "Invalid hook call" due to trying to run a Client Component (`MDXRemote`) inside an async Server Component.
- **Resolution**: Created an `MDXWrapper` client component and implemented dynamic imports to skip SSR for interactive elements.
- **Takeaway**: Next.js App Router strictly enforces the boundary between Server and Client components. Hooks are strictly reserved for the client side.

## [2026-10-09] - RSC Migration, Static Export & Dynamic Routing
- **Problem**: Production builds (`next build`) failed under Turbopack/webpack due to ESM packaging issues with client-side dynamic imports of `next-mdx-remote`. Furthermore, all markdown content was inlined on the home page and static export was not yet configured for GitHub Pages.
- **Decision**:
  - Migrated to `next-mdx-remote/rsc`, rendering markdown natively in React Server Components without client wrappers or dynamic imports.
  - Enabled `output: 'export'` and `images: { unoptimized: true }` in `next.config.ts` for static hosting.
  - Implemented dynamic route `app/posts/[slug]/page.tsx` backed by `generateStaticParams()` to pre-render individual article HTML pages during build.
- **Takeaway**: With App Router, RSCs streamline markdown rendering at build time, eliminating client-side bundle weight while guaranteeing clean static HTML output suitable for static hosts like GitHub Pages.

