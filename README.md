# portfolio

Personal portfolio and technical blog for Shervin Naseri. Built with vanilla HTML, Tailwind CSS, and a static blog generator.

## tech

- **HTML** -- semantic, responsive markup
- **Tailwind CSS 3** -- utility-first CSS via PostCSS
- **JavaScript** -- vanilla ES6, IntersectionObserver-based animations
- **Node.js** -- blog build pipeline (`marked` + `highlight.js`)
- **GitHub Pages** -- CI/CD deployment via Actions

## structure

```
├── index.html              # main portfolio page
├── blog.html               # blog index (auto-generated on build)
├── src/
│   ├── input.css           # Tailwind source + custom design system
│   └── script.js           # animations, scroll spy, mobile menu
├── build.js                # blog static site generator
├── posts/                  # markdown blog posts (front matter)
├── dist/
│   ├── output.css          # compiled Tailwind
│   ├── blog-meta.js        # post count for blog link visibility
│   ├── blog/               # generated individual post pages
│   └── tags/               # generated tag-filtered pages
└── .github/workflows/      # GitHub Pages deploy
```

## quick start

```bash
npm install
npm run build:css   # compile Tailwind
npm run build:blog  # generate blog from posts/*.md
npm run build       # both, in sequence
npm start           # serve locally
```

## blog posts

Add `.md` files to `posts/` with YAML front matter:

```markdown
---
title: "Post Title"
date: 2026-05-17
snippet: "Short description for index cards."
tags: [tag1, tag2]
---

Post body in markdown. Code blocks get syntax highlighting via highlight.js.
```

Run `npm run build:blog` to generate individual post pages, tag pages, and update the blog index.

## design

Dark theme with indigo/purple gradient accents, glassmorphism cards, animated scroll progress, section reveal on scroll, timeline layout for experience, skill bars with shimmer animation, and a noise texture overlay. Reduced motion respected via `prefers-reduced-motion`.
