const fs = require('fs/promises');
const path = require('path');
const fm = require('front-matter');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, 'posts');
const PLACEHOLDER_POSTS_DIR = path.join(__dirname, 'posts-placeholders');
const DIST_DIR = path.join(__dirname, 'dist/blog');

// Function to create a slug from a filename
const createSlug = (filename) => {
    return path.basename(filename, path.extname(filename));
};

// HTML template for a single blog post
const createPostHtml = (post) => `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${post.attributes.snippet}">
    <title>${post.attributes.title} - Shervin Naseri</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../output.css">
</head>
<body class="bg-gradient-to-b from-slate-800 to-slate-950 text-gray-300 font-sans leading-relaxed flex flex-col min-h-screen">

    <!-- Header -->
    <header class="bg-slate-800/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-700">
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="../../index.html" class="text-2xl font-bold text-white hover:text-gray-300 transition transform hover:scale-105 duration-200 inline-block">Shervin Naseri</a>
            <nav>
                <a href="../../blog.html" class="text-indigo-400 hover:text-indigo-300 hover:underline">Blog</a>
            </nav>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="container mx-auto px-6 py-12 flex-grow">
        <article class="max-w-4xl mx-auto">
            <h1 class="text-4xl font-bold text-white mb-4">${post.attributes.title}</h1>
            <p class="text-sm text-gray-400 mb-8">Published on <time datetime="${post.attributes.date}">${new Date(post.attributes.date).toDateString()}</time></p>

            <div class="prose prose-invert max-w-none text-gray-300">
                ${post.body}
            </div>

            <div class="mt-8">
                ${post.attributes.tags.map(tag => `<span class="inline-block bg-slate-700 text-indigo-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">${tag}</span>`).join('')}
            </div>
        </article>
    </main>

    <!-- Footer -->
    <footer class="text-center py-6 mt-16 border-t border-slate-700">
        <p class="text-gray-500 text-sm">&copy; ${new Date().getFullYear()} Shervin Naseri. All rights reserved.</p>
    </footer>

</body>
</html>
`;

// HTML template for the blog index page
const createBlogIndexHtml = (posts) => `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Technical blog of Shervin Naseri">
    <title>Shervin Naseri - Blog</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="dist/output.css">
</head>
<body class="bg-gradient-to-b from-slate-800 to-slate-950 text-gray-300 font-sans leading-relaxed flex flex-col min-h-screen">

    <!-- Header -->
    <header class="bg-slate-800/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-700">
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="index.html" class="text-2xl font-bold text-white hover:text-gray-300 transition transform hover:scale-105 duration-200 inline-block">Shervin Naseri</a>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="container mx-auto px-6 py-12 flex-grow">
        <div class="space-y-16 max-w-4xl mx-auto">
            ${posts.map(post => `
            <article class="bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-700 hover:bg-slate-700/50 transition-all duration-300">
                <h2 class="text-3xl font-semibold text-white mb-2">
                    <a href="dist/blog/${post.slug}.html" class="hover:underline">${post.attributes.title}</a>
                </h2>
                <p class="text-sm text-gray-400 mb-4">Published on <time datetime="${post.attributes.date}">${new Date(post.attributes.date).toDateString()}</time></p>
                <p class="text-gray-300 mb-4">${post.attributes.snippet}</p>
                <div class="flex justify-between items-center">
                    <a href="dist/blog/${post.slug}.html" class="text-indigo-400 hover:underline font-semibold">Read more...</a>
                    <div class="flex items-center gap-2">
                        ${post.attributes.tags.map(tag => `<span class="inline-block bg-slate-700 text-indigo-300 text-xs font-medium px-2.5 py-0.5 rounded">${tag}</span>`).join('')}
                    </div>
                </div>
            </article>
            `).join('')}
        </div>
    </main>

    <!-- Footer -->
    <footer class="text-center py-6 mt-16 border-t border-slate-700">
        <p class="text-gray-500 text-sm">&copy; ${new Date().getFullYear()} Shervin Naseri. All rights reserved.</p>
    </footer>

</body>
</html>
`;

const main = async () => {
    try {
        // Create dist directory if it doesn't exist
        await fs.mkdir(DIST_DIR, { recursive: true });

        const postFiles = [];
        // Read real posts if the directory exists
        if (await fs.access(POSTS_DIR).then(() => true).catch(() => false)) {
            const files = await fs.readdir(POSTS_DIR);
            postFiles.push(...files.map(file => path.join(POSTS_DIR, file)));
        }

        // In development, also read placeholder posts
        if (process.env.NODE_ENV === 'development') {
            if (await fs.access(PLACEHOLDER_POSTS_DIR).then(() => true).catch(() => false)) {
                const placeholderFiles = await fs.readdir(PLACEHOLDER_POSTS_DIR);
                postFiles.push(...placeholderFiles.map(file => path.join(PLACEHOLDER_POSTS_DIR, file)));
            }
        }

        const posts = [];

        for (const filePath of postFiles) {
            if (path.extname(filePath) === '.md') {
                const fileContent = await fs.readFile(filePath, 'utf8');

                const { attributes, body } = fm(fileContent);
                const htmlContent = marked(body);
                const slug = createSlug(path.basename(filePath));

                // Create individual post page
                const postPageHtml = createPostHtml({ attributes, body: htmlContent });
                await fs.writeFile(path.join(DIST_DIR, `${slug}.html`), postPageHtml);
                console.log(`Successfully built post: ${slug}.html`);

                // Collect post data for the index page
                posts.push({ attributes, slug });
            }
        }

        // Sort posts by date, newest first
        posts.sort((a, b) => new Date(b.attributes.date) - new Date(a.attributes.date));

        // Generate and write the blog index page
        const blogIndexHtml = createBlogIndexHtml(posts);
        await fs.writeFile(path.join(__dirname, 'blog.html'), blogIndexHtml);
        console.log('Successfully built blog index page: blog.html');

    } catch (error) {
        console.error("Error during build process:", error);
    }
};

main();
