# Mohiadeen Ameer · Blog

Blog by Mohiadeen Ameer, live at https://mohiadeen-ameer.github.io/blogs/. Posts are Markdown files, and there's no build step.

**Writing a new post?** Follow [AGENTS.md](AGENTS.md). It sets out the structure, diagrams and style every post should match, using the Journey to Cloud post as the reference.

## Add a post

1. Create `posts/<slug>.md`.
2. Add an entry to `posts.json` (`slug`, `title`, `date`, `description`, `tags`, `readTime`, `difficulty`).
3. Commit and push.

To hide a post that isn't finished, add `"draft": true`.

### What you can use in a post

- A **terminal** block: a code fence labeled `terminal`. Lines that start with `$ ` are commands, and the copy button copies only those lines.
- **Code**: a fence labeled with its language (`yaml`, `java`, `go`, …). It gets syntax highlighting and a copy button.
- **Callouts**: a blockquote that starts with `[!NOTE]`, `[!TIP]` or `[!WARNING]`.
- **Diagrams**: a fence labeled `mermaid`. Diagrams follow the light/dark theme.
- **Quizzes**: a fence labeled `quiz` containing `{"q": "...", "options": ["a","b"], "answer": 1, "why": "..."}`.
- **Stat strip**: `<div class="stat-strip"><div><b>6</b><span>months</span></div>…</div>`
- **Click-to-reveal**: `<details><summary>Question</summary>Answer</details>`

After changing CSS or JS, increase the `?v=` number on the `<link>`/`<script>` tags in the HTML files, so returning visitors get the new version.

## Rules for every page

Any new HTML page must have:

- The tab title `<title>Tech Blogs</title>`. Post pages also set `document.title = "Tech Blogs"`.
- The same favicon tags as the other pages (SVG, PNG, ICO and Apple touch icon), with the same `?v=` number:
  ```html
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg?v=3">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png?v=3">
  <link rel="shortcut icon" href="favicon.ico?v=3">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png?v=3">
  ```
- The same header (MA logo + name, Posts · About, theme button) and footer as the existing pages.

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

If you open `index.html` directly from the file system, the posts won't load, because the browser blocks `fetch` there. Use the server above instead.

## Publish on GitHub Pages

1. Create a repo named `blogs` on GitHub and push this folder to it.
2. In the repo, go to **Settings → Pages → Source: Deploy from a branch**, then choose `main` and `/ (root)`.
3. After about a minute, the site is live at `https://<your-username>.github.io/blogs/`.
