# AGENTS.md: how to write and change this blog

Instructions for AI agents and anyone else adding posts or pages to **Tech Blogs** (https://mohiadeen-ameer.github.io/blogs/).

**The reference post is `posts/journey-to-cloud.md`** (live: https://mohiadeen-ameer.github.io/blogs/post.html?p=journey-to-cloud). Every new post should match its structure, tone and visual patterns. When in doubt, open it and copy what it does.

## How the site works

- Plain HTML with no build step. `index.html` lists the posts, `post.html?p=<slug>` renders one post, and `about.html` is the About page.
- A post is two things: an entry in `posts.json` and a Markdown file at `posts/<slug>.md`.
- `assets/post.js` renders the Markdown with marked, highlight.js and Mermaid, adds the table of contents, and turns special code fences into components (see below).
- To preview locally, run `python3 -m http.server 8000` and open http://localhost:8000. Opening the files directly won't work.

## Adding a post

### 1. `posts.json` entry

```json
{
  "slug": "short-kebab-case",
  "title": "Short Main Title: Longer Subtitle That Says What It Covers",
  "date": "YYYY-MM-DD",
  "description": "Two sentences that tell the story: what was done, what went wrong or was learned, and what the reader gets.",
  "tags": ["lowercase", "max-six", "tags"],
  "readTime": "12 min",
  "difficulty": "intro | intermediate | advanced"
}
```

- **Title format is `Main title: Subtitle`.** The part before the first `: ` shows as the big title, and the part after it shows as a lighter subtitle on cards and on the post page. Keep the main title short (2–4 words, like "Journey to Cloud").
- The **date** is when the work happened, not when it was written up. It can be in the past.
- Add `"draft": true` to hide a post until it's ready.
- Estimate `readTime` at about 220 words per minute, counting diagrams and code as reading time.

### 2. Post structure (copy this order)

1. **Hook paragraph.** No heading, first person, a bit of humor, and what happened in one or two sentences. Bold the key facts.
2. **One-line summary**, like "If I had to sum up the work in one sentence: …"
3. **Stat strip** with 3–4 real numbers from the work, never invented:
   ```html
   <div class="stat-strip">
     <div><b>60+</b><span>legacy apps modernized</span></div>
     <div><b>~$800</b><span>per month saved</span></div>
   </div>
   ```
4. **An overview diagram** of the whole journey near the top.
5. **Where we started:** the problem and why it mattered.
6. **Numbered phases** (`## Phase 1: …`), each with: what we did, a diagram or code where it helps, "What that gave us" bullets, and a callout for the gotcha.
7. **The plot twist:** what went wrong, with a diagram and a quiz.
8. **The unglamorous parts:** CI/CD, observability, security.
9. **If I did it again today:** current best practice, clearly framed as hindsight rather than what was done.
10. **Lessons learned:** bold lead-in plus one sentence each.
11. **TL;DR** inside `<details>`, then a closing paragraph and a question that invites readers to connect on LinkedIn.

### 3. Building blocks

| Need | Use |
|---|---|
| Shell commands | ```` ```terminal ```` fence. Lines starting with `$ ` are commands, and the copy button copies only those |
| Code or config | Fence with a language (`yaml`, `xml`, `java`, `dockerfile`, …) |
| Long config or step-by-step detail | `<details><summary>Step by step: …</summary>` … `</details>` with blank lines inside |
| Tip, background or risk | `> [!TIP]`, `> [!NOTE]`, `> [!WARNING]` |
| Check understanding | ```` ```quiz ```` fence with `{"q": "...", "options": [...], "answer": <0-based index>, "why": "..."}`. One or two per post |
| Before/after or mapping | Markdown table |
| Architecture or flow | ```` ```mermaid ```` (rules below) |

### 4. Diagram rules (Mermaid)

- **Never one long horizontal row.** More than about 5 boxes in a row shrinks the text until it's unreadable. Use `flowchart TB` with `subgraph` rows (each `direction LR`) of 3–5 boxes, linked top to bottom.
- **Avoid diamonds `{...}` for long labels**, because they grow huge. Use a rounded node `([...])` for a decision or question.
- **Avoid back-edges** (for example rollback arrows pointing left), because they make Mermaid reorder boxes. Make the result its own final step, like `-. on failure .-> RB[Roll back]`.
- **Color-code with this palette** (white text, readable in both themes):
  ```
  classDef build fill:#4f46e5,stroke:#a5b4fc,color:#fff   %% build steps / app
  classDef ship  fill:#0f766e,stroke:#5eead4,color:#fff   %% cloud / logs
  classDef sec   fill:#b45309,stroke:#fcd34d,color:#fff   %% security scans / metrics / warnings
  classDef store fill:#334155,stroke:#94a3b8,color:#fff   %% databases, registries, questions
  classDef good  fill:#15803d,stroke:#86efac,color:#fff   %% outcome / prod / success
  classDef bad   fill:#b91c1c,stroke:#fca5a5,color:#fff   %% the problem
  ```
- Highlight a problem path with `linkStyle <n> stroke:#f87171,stroke-width:3px,color:#f87171`.
- Keep labels short (1–4 words). Put the explanation in the text, not the box.

### 5. Writing style

- First person ("we", "I"), conversational, light humor, no hype.
- Short sentences. Bold the key fact in a paragraph and nothing else.
- **Only real facts from the author's own work.** Never invent numbers, scale, results or outcomes. Label any illustrative example as such (e.g. "40 × 20 ms").
- Be precise about scope. If one app out of 60 did something, say "one app", not "we".
- Never put real hostnames, credentials or passwords in config samples. Use `${env.DB_PASSWORD}`-style placeholders.
- Link the author's related Medium articles or GitHub repos where relevant.

## Rules for every page (new pages too)

- `<title>Tech Blogs</title>`, and post pages keep `document.title = "Tech Blogs"`.
- The same four favicon tags as the existing pages (`favicon.svg`, `favicon-32.png`, `favicon.ico`, `apple-touch-icon.png`, all with the same `?v=`).
- The same header (MA logo + "Mohiadeen Ameer", menu **Posts · About**, theme button) and footer (© year set by script, plus LinkedIn · GitHub · Medium). No LinkedIn link in the top menu.
- Dark mode is the default.
- After changing `assets/style.css` or any `assets/*.js`, increase the `?v=` number on those tags in **all** HTML pages so returning visitors get the new version.

## Before you finish

- **Check it visually.** Render the post in a browser at desktop width (~1280px) and phone width (~390px), and look at every diagram. Labels must not be clipped and text must be readable.
- Check light and dark mode if you touched CSS.

## Git

- Commit as `Mohiadeen Ameer <mohiadeen07ece@gmail.com>`.
- **No AI attribution** in commit messages or PRs: no "Co-Authored-By: Claude" or similar.
- Short, plain commit messages that say what changed.
- Push to `main`. GitHub Pages deploys in about a minute, and the site caches for about 10 minutes (Cmd+Shift+R to refresh).
