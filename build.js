const fs = require('fs/promises');
const path = require('path');
const fm = require('front-matter');
const hljs = require('highlight.js');

const POSTS_DIR = path.join(__dirname, 'posts');

const DIST_DIR = path.join(__dirname, 'dist/blog');

const createSlug = (filename) => path.basename(filename, path.extname(filename));

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[char]));

const createTagSlug = (tag) => String(tag)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'tag';

const normalizeDate = (value, filePath) => {
  if (!value) {
    throw new Error(`Missing required "date" in ${path.basename(filePath)}`);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const iso = value.toISOString().slice(0, 10);
    const [year, month, day] = iso.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return {
      iso,
      label: localDate.toDateString(),
      sortTime: localDate.getTime(),
    };
  }

  const raw = String(value).trim();
  const dateParts = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateParts) {
    const [, year, month, day] = dateParts;
    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
    return {
      iso: `${year}-${month}-${day}`,
      label: localDate.toDateString(),
      sortTime: localDate.getTime(),
    };
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid "date" in ${path.basename(filePath)}: ${raw}`);
  }

  return {
    iso: parsed.toISOString().slice(0, 10),
    label: parsed.toDateString(),
    sortTime: parsed.getTime(),
  };
};

const normalizeAttributes = (attributes, filePath) => {
  const date = normalizeDate(attributes.date, filePath);
  const rawTags = Array.isArray(attributes.tags)
    ? attributes.tags
    : attributes.tags
      ? [attributes.tags]
      : [];

  return {
    title: String(attributes.title || createSlug(path.basename(filePath))).trim(),
    date: date.iso,
    dateLabel: date.label,
    sortTime: date.sortTime,
    snippet: String(attributes.snippet || '').trim(),
    tags: rawTags.map(tag => String(tag).trim()).filter(Boolean),
  };
};

const readingTime = (text) => {
  const wpm = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
};

const shell = (title, desc, extraCss) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${desc}">
    <title>${title} - Shervin Naseri</title>
    <link rel="icon" type="image/svg+xml" href="../../favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../output.css">
    ${extraCss || ''}
</head>
<body class="bg-slate-950 text-slate-200 font-sans leading-relaxed flex flex-col min-h-screen">

<div id="scroll-progress"></div>

<header class="bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800">
    <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="../../index.html" class="text-2xl font-bold text-white hover:text-indigo-400 transition-colors">Shervin Naseri</a>
        <nav>
            <a href="../../blog.html" class="text-slate-400 hover:text-white transition-colors text-sm">Back to Blog</a>
        </nav>
    </div>
</header>

<main class="container mx-auto px-6 py-12 flex-grow">
    {{BODY}}
</main>

<footer class="text-center py-10 px-6 border-t border-slate-800/50" style="border-image: linear-gradient(90deg, transparent, rgba(99,102,241,0.15), rgba(139,92,246,0.15), transparent) 1;">
    <p class="text-slate-600 text-xs tracking-wide">&copy; ${new Date().getFullYear()} Shervin Naseri. All rights reserved.</p>
</footer>

<button id="back-to-top" title="Back to Top">
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" /></svg>
</button>

<script>
var bar=document.getElementById('scroll-progress');
window.addEventListener('scroll',function(){var h=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=h>0?(window.scrollY/h*100)+'%':'0%';});
var tb=document.getElementById('back-to-top');
window.addEventListener('scroll',function(){tb.classList.toggle('hidden',window.scrollY<400);});
tb.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
</script>
</body>
</html>
`;

const createPostHtml = (post, prev, next) => {
  const title = escapeHtml(post.attributes.title);
  const snippet = escapeHtml(post.attributes.snippet);
  const body = `
    <article class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-white mb-3">${title}</h1>
        <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8">
            <time datetime="${escapeHtml(post.attributes.date)}">${escapeHtml(post.attributes.dateLabel)}</time>
            <span class="w-1 h-1 rounded-full bg-slate-600"></span>
            <span class="reading-time"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>${post.readingTime} min read</span>
        </div>
        <div class="prose-custom">${post.body}</div>
        <div class="flex flex-wrap gap-2 mt-8">
            ${post.attributes.tags.map(tag => {
                const tagSlug = createTagSlug(tag);
                return `<a href="../tags/${tagSlug}.html" class="tag">${escapeHtml(tag)}</a>`;
            }).join('')}
        </div>
        <div class="post-nav">
            ${prev ? `<a href="../blog/${prev.slug}.html">&larr; ${escapeHtml(prev.attributes.title)}</a>` : '<span></span>'}
            ${next ? `<a href="../blog/${next.slug}.html">${escapeHtml(next.attributes.title)} &rarr;</a>` : '<span></span>'}
        </div>
    </article>`;

  return shell(
    title,
    snippet,
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">'
  ).replace('{{BODY}}', body);
};

const createTagPageHtml = (tag, posts) => {
  const safeTag = escapeHtml(tag);
  const body = `
    <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-center text-white mb-4">Posts tagged with <span class="text-indigo-400">"${safeTag}"</span></h1>
        <p class="text-center text-slate-500 mb-12">${posts.length} post${posts.length === 1 ? '' : 's'} found.</p>
        <div class="space-y-8">
            ${posts.map(post => `
            <article class="card-enhanced p-6">
                <h2 class="text-2xl font-semibold text-white mb-2">
                    <a href="../blog/${post.slug}.html" class="hover:text-indigo-400 transition-colors">${escapeHtml(post.attributes.title)}</a>
                </h2>
                <p class="text-sm text-slate-500 mb-3">Published on <time datetime="${escapeHtml(post.attributes.date)}">${escapeHtml(post.attributes.dateLabel)}</time></p>
                <p class="text-slate-400 mb-4">${escapeHtml(post.attributes.snippet)}</p>
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <a href="../blog/${post.slug}.html" class="text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors">Read more &rarr;</a>
                    <div class="flex items-center gap-2">
                        ${post.attributes.tags.map(t => {
                            const tagSlug = createTagSlug(t);
                            return `<a href="${tagSlug}.html" class="tag">${escapeHtml(t)}</a>`;
                        }).join('')}
                    </div>
                </div>
            </article>`).join('')}
        </div>
    </div>`;

  return shell(
    `Posts tagged with "${safeTag}"`,
    `Posts tagged with ${safeTag} on the technical blog of Shervin Naseri.`
  ).replace('{{BODY}}', body);
};

const createBlogIndexHtml = (posts) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Technical blog of Shervin Naseri.">
    <meta name="theme-color" content="#0f172a">
    <title>Shervin Naseri - Blog</title>
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="dist/output.css">
</head>
<body class="bg-slate-950 text-slate-200 font-sans leading-relaxed flex flex-col min-h-screen">

<div id="scroll-progress"></div>

<header class="bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800">
    <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="index.html" class="text-2xl font-bold text-white hover:text-indigo-400 transition-colors">Shervin Naseri</a>
        <nav>
            <a href="index.html" class="text-slate-400 hover:text-white transition-colors text-sm">Portfolio</a>
        </nav>
    </div>
</header>

<main class="container mx-auto px-6 py-12 flex-grow">
    <h1 class="text-4xl font-bold text-center text-white mb-12">Technical Blog</h1>
    <div class="space-y-8 max-w-4xl mx-auto">
        ${posts.length ? posts.map(post => `
        <article class="card-enhanced p-6">
            <h2 class="text-2xl font-semibold text-white mb-2">
                <a href="dist/blog/${post.slug}.html" class="hover:text-indigo-400 transition-colors">${escapeHtml(post.attributes.title)}</a>
            </h2>
            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
                <time datetime="${escapeHtml(post.attributes.date)}">${escapeHtml(post.attributes.dateLabel)}</time>
                <span class="w-1 h-1 rounded-full bg-slate-600"></span>
                <span class="reading-time"><svg class="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>${post.readingTime} min read</span>
            </div>
            <p class="text-slate-400 mb-4">${escapeHtml(post.attributes.snippet)}</p>
            <div class="flex flex-wrap items-center justify-between gap-4">
                <a href="dist/blog/${post.slug}.html" class="text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors">Read more &rarr;</a>
                <div class="flex items-center gap-2">
                    ${post.attributes.tags.map(tag => {
                        const tagSlug = createTagSlug(tag);
                        return `<a href="dist/tags/${tagSlug}.html" class="tag">${escapeHtml(tag)}</a>`;
                    }).join('')}
                </div>
            </div>
        </article>`).join('') : `
        <div class="blog-empty">
            <svg class="blog-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            <h2 class="text-2xl font-semibold text-white mb-3">Coming Soon</h2>
            <p class="text-slate-500 max-w-md mx-auto">I'm working on some technical posts. Check back soon for articles on machine learning, software engineering, and computer vision.</p>
        </div>`}
    </div>
</main>

<footer class="text-center py-10 px-6 border-t border-slate-800/50" style="border-image: linear-gradient(90deg, transparent, rgba(99,102,241,0.15), rgba(139,92,246,0.15), transparent) 1;">
    <div class="flex flex-wrap justify-center gap-8 mb-4">
        <a href="index.html" class="text-slate-500 hover:text-indigo-400 transition-colors text-sm tracking-wide">Portfolio</a>
        <a href="mailto:shervin.naseri@gmail.com" class="text-slate-500 hover:text-indigo-400 transition-colors text-sm tracking-wide">Email</a>
        <a href="https://github.com/shervinemp" target="_blank" rel="noopener noreferrer" class="text-slate-500 hover:text-indigo-400 transition-colors text-sm tracking-wide">GitHub</a>
    </div>
    <p class="text-slate-600 text-xs tracking-wide">&copy; <span id="current-year"></span> Shervin Naseri. All rights reserved.</p>
</footer>

<button id="back-to-top" title="Back to Top">
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" /></svg>
</button>

<script>
document.getElementById('current-year').textContent=new Date().getFullYear();
var bar=document.getElementById('scroll-progress');
window.addEventListener('scroll',function(){var h=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=h>0?(window.scrollY/h*100)+'%':'0%';});
var tb=document.getElementById('back-to-top');
window.addEventListener('scroll',function(){tb.classList.toggle('hidden',window.scrollY<400);});
tb.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
</script>
</body>
</html>
`;

const main = async () => {
  try {
    const { marked } = await import('marked');

    const renderer = new marked.Renderer();
    renderer.code = (codeBlock) => {
      const code = codeBlock.text;
      const lang = codeBlock.lang;
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlightedCode = hljs.highlight(code, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlightedCode}</code></pre>`;
    };

    await fs.mkdir(DIST_DIR, { recursive: true });

    const postFiles = [];
    if (await fs.access(POSTS_DIR).then(() => true).catch(() => false)) {
      const files = await fs.readdir(POSTS_DIR);
      postFiles.push(...files.map(file => path.join(POSTS_DIR, file)));
    }

    const posts = [];
    const allTags = new Set();

    for (const filePath of postFiles) {
      if (path.extname(filePath) !== '.md') continue;
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { attributes, body } = fm(fileContent);
      const normalizedAttributes = normalizeAttributes(attributes, filePath);
      const htmlContent = marked(body, { renderer });
      const slug = createSlug(path.basename(filePath));
      posts.push({ attributes: normalizedAttributes, body: htmlContent, slug, readingTime: readingTime(body) });
      normalizedAttributes.tags.forEach(tag => allTags.add(tag));
    }

    posts.sort((a, b) => b.attributes.sortTime - a.attributes.sortTime);

    for (let i = 0; i < posts.length; i++) {
      const prev = i > 0 ? posts[i - 1] : null;
      const next = i < posts.length - 1 ? posts[i + 1] : null;
      const postPageHtml = createPostHtml(posts[i], prev, next);
      await fs.writeFile(path.join(DIST_DIR, `${posts[i].slug}.html`), postPageHtml);
      console.log(`Built post: ${posts[i].slug}.html`);
    }

    const TAGS_DIST_DIR = path.join(__dirname, 'dist/tags');
    await fs.mkdir(TAGS_DIST_DIR, { recursive: true });

    for (const tag of allTags) {
      const postsWithTag = posts.filter(post => post.attributes.tags.includes(tag));
      const tagSlug = createTagSlug(tag);
      const tagPageHtml = createTagPageHtml(tag, postsWithTag);
      await fs.writeFile(path.join(TAGS_DIST_DIR, `${tagSlug}.html`), tagPageHtml);
      console.log(`Built tag page: ${tagSlug}.html`);
    }

    const blogIndexHtml = createBlogIndexHtml(posts);
    await fs.writeFile(path.join(__dirname, 'blog.html'), blogIndexHtml);
    console.log('Built blog index: blog.html');

    const metaContent = `window.BLOG_META = { postCount: ${posts.length} };\n`;
    await fs.writeFile(path.join(__dirname, 'dist', 'blog-meta.js'), metaContent);
    console.log('Built blog metadata: dist/blog-meta.js');

  } catch (error) {
    console.error("Error during build process:", error);
    process.exitCode = 1;
  }
};

main();
