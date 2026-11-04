(function () {
  document.getElementById("year").textContent = new Date().getFullYear();
  var article = document.getElementById("article");
  var head = document.getElementById("head");
  var slug = new URLSearchParams(location.search).get("p");

  function fail(msg) {
    article.innerHTML = '<p class="empty">' + esc(msg) + ' <a href="./">Go back to all posts →</a></p>';
  }

  loadPosts().then(function (posts) {
    var i = posts.findIndex(function (p) { return p.slug === slug; });
    if (i === -1) return fail("Post not found.");
    var post = posts[i];
    return fetch("posts/" + encodeURIComponent(post.slug) + ".md", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (md) { render(post, md, posts[i + 1], posts[i - 1]); });
  }).catch(function () { fail("Could not load this post."); });

  function render(post, md, older, newer) {
    document.title = "Tech Blogs";
    var meta = document.querySelector('meta[name="description"]') || document.head.appendChild(document.createElement("meta"));
    meta.name = "description"; meta.content = post.description || "";

    var words = md.split(/\s+/).length;
    var readTime = post.readTime || Math.max(1, Math.round(words / 220)) + " min";
    head.innerHTML += '<div class="card-meta" style="margin-top:18px">' +
        "<span>" + formatDate(post.date) + "</span><span>·</span><span>" + esc(readTime) + " read</span>" +
        difficultyBadge(post.difficulty) + "</div>" +
      titleHtml(post.title) +
      '<p class="lede">' + esc(post.description) + "</p>" +
      '<div class="tags">' + (post.tags || []).map(function (t) {
        return '<a class="tag" href="./?tag=' + encodeURIComponent(t) + '">#' + esc(t) + "</a>";
      }).join("") + "</div>";

    article.innerHTML = marked.parse(md, { gfm: true });
    enhanceHeadings();
    enhanceCallouts();
    enhanceCode();
    renderDiagrams();
    article.querySelectorAll('a[href^="http"]').forEach(function (a) { a.target = "_blank"; a.rel = "noopener"; });

    var nav = document.getElementById("postNav");
    nav.innerHTML =
      (older ? '<a href="post.html?p=' + encodeURIComponent(older.slug) + '"><small>← Previous</small>' + esc(older.title) + "</a>" : "") +
      (newer ? '<a class="next" href="post.html?p=' + encodeURIComponent(newer.slug) + '"><small>Next →</small>' + esc(newer.title) + "</a>" : "");

    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  // "Main title: subtitle" -> big main line + lighter subtitle line
  function titleHtml(t) {
    var i = t.indexOf(": ");
    if (i < 0) return '<h1 class="post-title">' + esc(t) + "</h1>";
    return '<h1 class="post-title">' + esc(t.slice(0, i)) +
      '<span class="post-subtitle">' + esc(t.slice(i + 2)) + "</span></h1>";
  }

  function slugify(s) {
    return s.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  }

  function enhanceHeadings() {
    var toc = document.getElementById("toc");
    var hs = article.querySelectorAll("h2, h3");
    var used = {};
    var links = [];
    hs.forEach(function (h) {
      var text = h.textContent;
      var id = slugify(text) || "section";
      if (used[id]) id += "-" + (++used[id]); else used[id] = 1;
      h.id = id;
      var a = document.createElement("a");
      a.className = "anchor"; a.href = "#" + id; a.textContent = "#"; a.setAttribute("aria-label", "Link to section");
      h.appendChild(a);
      links.push('<a href="#' + id + '"' + (h.tagName === "H3" ? ' class="sub"' : "") + ">" + esc(text) + "</a>");
    });
    if (hs.length < 2) { toc.remove(); return; }
    toc.innerHTML = '<div class="toc-title">On this page</div>' + links.join("");

    var tocLinks = toc.querySelectorAll("a");
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        tocLinks.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    hs.forEach(function (h) { obs.observe(h); });
  }

  // > [!NOTE] / [!TIP] / [!WARNING]
  function enhanceCallouts() {
    article.querySelectorAll("blockquote").forEach(function (bq) {
      var p = bq.querySelector("p");
      if (!p) return;
      var m = p.innerHTML.match(/^\s*\[!(NOTE|TIP|WARNING)\]\s*(<br>)?/i);
      if (!m) return;
      var kind = m[1].toLowerCase();
      p.innerHTML = p.innerHTML.slice(m[0].length);
      if (!p.innerHTML.trim()) p.remove();
      var div = document.createElement("div");
      div.className = "callout " + kind;
      div.innerHTML = '<div class="callout-title">' + kind + "</div>" + bq.innerHTML;
      bq.replaceWith(div);
    });
  }

  function enhanceCode() {
    article.querySelectorAll("pre > code").forEach(function (code) {
      var pre = code.parentElement;
      var lang = ((code.className.match(/language-([\w-]+)/) || [])[1] || "").toLowerCase();
      var text = code.textContent;

      if (lang === "quiz") return makeQuiz(pre, text);
      if (lang === "mermaid") {
        var fig = document.createElement("figure");
        fig.className = "diagram";
        fig.setAttribute("data-src", text);
        pre.replaceWith(fig);
        return;
      }

      var box = document.createElement("div");
      box.className = "code" + (lang === "terminal" ? " term" : "");
      var label = lang === "terminal" ? '<span><span class="dots"><i></i><i></i><i></i></span>terminal</span>' : "<span>" + esc(lang || "code") + "</span>";
      box.innerHTML = '<div class="code-head">' + label + '<button class="copy" type="button">Copy</button></div>';
      pre.replaceWith(box);
      box.appendChild(pre);

      var copyText = text;
      if (lang === "terminal") {
        var cmds = [];
        code.innerHTML = text.replace(/\n$/, "").split("\n").map(function (line) {
          if (/^\$ /.test(line)) { cmds.push(line.slice(2)); return '<span class="prompt">$ </span>' + esc(line.slice(2)); }
          return '<span class="out">' + esc(line) + "</span>";
        }).join("\n");
        copyText = cmds.length ? cmds.join("\n") : text;
      } else if (window.hljs && lang && hljs.getLanguage(lang)) {
        hljs.highlightElement(code);
      }

      box.querySelector(".copy").addEventListener("click", function () {
        var btn = this;
        navigator.clipboard.writeText(copyText).then(function () {
          btn.textContent = "Copied ✓";
          setTimeout(function () { btn.textContent = "Copy"; }, 1500);
        });
      });
    });
  }

  // ```mermaid diagrams, themed to match the site and re-drawn when the theme changes
  var mermaidReady = null;
  function loadMermaid() {
    if (!mermaidReady) {
      mermaidReady = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return mermaidReady;
  }
  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  }
  var diagramSeq = 0;
  function renderDiagrams() {
    var figs = article.querySelectorAll("figure.diagram");
    if (!figs.length) return;
    var fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
    Promise.all([loadMermaid(), fontsReady]).then(function () {
      var dark = isDark();
      mermaid.initialize({
        startOnLoad: false, theme: "base", securityLevel: "strict",
        fontFamily: "Inter, sans-serif", fontSize: 16,
        flowchart: { curve: "basis", padding: 14, htmlLabels: true },
        themeVariables: dark ? {
          background: "#12152a", primaryColor: "#1d2148", primaryTextColor: "#eef0fa",
          primaryBorderColor: "#8b85ff", secondaryColor: "#0f2a2e", secondaryBorderColor: "#2dd4bf",
          secondaryTextColor: "#eef0fa", tertiaryColor: "#181c35", tertiaryBorderColor: "#3a3f6b",
          tertiaryTextColor: "#eef0fa", lineColor: "#7f849c", textColor: "#eef0fa",
          clusterBkg: "#141833", clusterBorder: "#2a2f55", edgeLabelBackground: "#12152a",
          actorBkg: "#1d2148", actorBorder: "#8b85ff", actorTextColor: "#eef0fa", signalColor: "#b4b8cc",
          signalTextColor: "#eef0fa", noteBkgColor: "#2a2440", noteTextColor: "#eef0fa", noteBorderColor: "#8b85ff"
        } : {
          background: "#ffffff", primaryColor: "#eef0ff", primaryTextColor: "#0f1222",
          primaryBorderColor: "#4f46e5", secondaryColor: "#e6f7f6", secondaryBorderColor: "#0ea5a4",
          secondaryTextColor: "#0f1222", tertiaryColor: "#f3f4f8", tertiaryBorderColor: "#c9ccdb",
          tertiaryTextColor: "#0f1222", lineColor: "#7a7f93", textColor: "#0f1222",
          clusterBkg: "#f7f8fc", clusterBorder: "#e0e2ec", edgeLabelBackground: "#ffffff",
          actorBkg: "#eef0ff", actorBorder: "#4f46e5", actorTextColor: "#0f1222", signalColor: "#454a5e",
          signalTextColor: "#0f1222", noteBkgColor: "#fff7e6", noteTextColor: "#0f1222", noteBorderColor: "#d97706"
        }
      });
      figs.forEach(function (fig) {
        var id = "dg" + (++diagramSeq);
        mermaid.render(id, fig.getAttribute("data-src")).then(function (r) {
          fig.innerHTML = r.svg;
        }).catch(function () {
          fig.innerHTML = '<pre class="diagram-error">' + esc(fig.getAttribute("data-src")) + "</pre>";
        });
      });
    }).catch(function () {});
  }
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", function () { setTimeout(renderDiagrams, 0); });

  // ```quiz
  // {"q": "...", "options": ["a", "b"], "answer": 0, "why": "..."}
  // ```
  function makeQuiz(pre, text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { return; }
    var box = document.createElement("div");
    box.className = "quiz";
    box.innerHTML = '<div class="quiz-label">Quick check</div>' +
      '<p class="quiz-q">' + esc(data.q) + "</p>" +
      '<div class="quiz-opts">' + (data.options || []).map(function (o, i) {
        return '<button class="quiz-opt" type="button" data-i="' + i + '">' + esc(o) + "</button>";
      }).join("") + "</div>" +
      (data.why ? '<p class="quiz-why">' + esc(data.why) + "</p>" : "");
    box.addEventListener("click", function (e) {
      var b = e.target.closest(".quiz-opt");
      if (!b || box.classList.contains("done")) return;
      var picked = +b.getAttribute("data-i");
      box.querySelectorAll(".quiz-opt").forEach(function (o, i) {
        o.disabled = true;
        if (i === data.answer) o.classList.add("right");
        else if (i === picked) o.classList.add("wrong");
      });
      box.classList.add("done");
    });
    pre.replaceWith(box);
  }

  // Reading progress bar
  var bar = document.getElementById("progress");
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  addEventListener("scroll", onScroll, { passive: true });
})();
