# Visionion Blog

This blog is built with [Eleventy (11ty)](https://www.11ty.dev/), a simple static site generator.

## Setup

```bash
cd blog-src
npm install
```

## Development

```bash
# Watch mode with live reload
npm run serve
```

## Build for Production

```bash
npm run build
```

This builds the blog to the `/blog/` directory in the parent website folder.

## Adding New Posts

1. Create a new `.md` file in `src/posts/`
2. Add frontmatter with required fields:

```yaml
---
title: Your Post Title
description: A brief description for SEO and previews.
date: 2024-12-18
category: focusguard  # or snapp, endurotrack
---
```

3. Write your content in Markdown
4. Run `npm run build` to generate the static files

## Categories

- `focusguard` - Productivity, focus, distraction-blocking
- `snapp` - Screenshots, annotation, visual communication  
- `endurotrack` - Health tracking, HRV, recovery, wellness

## Structure

```
blog-src/
├── .eleventy.js          # 11ty configuration
├── package.json          # Dependencies
├── src/
│   ├── _data/            # Global data
│   │   └── site.json
│   ├── _includes/        # Layouts
│   │   ├── base.njk
│   │   └── post.njk
│   ├── category/         # Category pages
│   ├── posts/            # Blog posts (Markdown)
│   ├── index.njk         # Blog homepage
│   └── sitemap.njk       # Sitemap generator
```

## Sitemap

The blog generates `/sitemap.xml` which includes:
- All main website pages
- Blog index and category pages
- All blog posts with dates

The sitemap is referenced in the root `robots.txt`.


