# Development Log
This is a living log of my progress making my personal website.


## [2026-05-30] - Implementation of Markdown Blog Pipeline
- **Problem**: Needed to render Markdown files from `content/` as HTML in the browser.
- **Decision**: Used `gray-matter` for parsing and `next-mdx-remote` for compilation.
- **Hurdle**: Encountered "Invalid hook call" due to trying to run a Client Component (`MDXRemote`) inside an async Server Component.
- **Resolution**: Created an `MDXWrapper` client component and implemented dynamic imports to skip SSR for interactive elements.
- **Takeaway**: Next.js App Router strictly enforces the boundary between Server and Client components. Hooks are strictly reserved for the client side.
