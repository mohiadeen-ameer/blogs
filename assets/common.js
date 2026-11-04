// Shared helpers: theme toggle, escaping, difficulty badges, config.
window.BLOG = {
  title: "Mohiadeen Ameer",
  github: "https://github.com/mohiadeen-ameer",
};

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function difficultyBadge(d) {
  if (!d) return "";
  var v = String(d).toLowerCase();
  var cls = v.indexOf("adv") === 0 ? "hard" : v.indexOf("inter") === 0 ? "mid" : "easy";
  return '<span class="badge ' + cls + '">' + esc(d) + "</span>";
}

function formatDate(iso) {
  var d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return esc(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function loadPosts() {
  return fetch("posts.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (posts) {
      return posts.filter(function (p) { return !p.draft; })
        .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    });
}

(function themeToggle() {
  var btn = document.getElementById("themeBtn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var root = document.documentElement;
    var current = root.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();
