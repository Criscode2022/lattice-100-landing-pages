(function () {
  "use strict";

  const pages = window.LANDING_PAGES || [];
  const root = document.getElementById("page-root");
  const loading = document.getElementById("loading");

  const params = new URLSearchParams(window.location.search);
  let id = parseInt(params.get("id") || "1", 10);
  if (!Number.isFinite(id) || id < 1) id = 1;

  const page = pages.find((p) => p.id === id) || pages[0];

  if (!page) {
    root.innerHTML = `
      <div class="lp-error">
        <h1>Page not found</h1>
        <p>This landing page does not exist.</p>
        <a class="lp-btn lp-btn-primary" href="index.html">Back to gallery</a>
      </div>`;
    return;
  }

  document.title = `${page.name} · Lattice`;
  applyPalette(page.palette);
  renderPage(page);
  setupMotion();
  setupInteractions(page);

  requestAnimationFrame(() => {
    loading?.classList.add("is-done");
    setTimeout(() => loading?.remove(), 450);
  });

  function applyPalette(pal) {
    const r = document.documentElement;
    r.style.setProperty("--bg", pal.bg);
    r.style.setProperty("--surface", pal.surface);
    r.style.setProperty("--fg", pal.fg);
    r.style.setProperty("--muted", pal.muted);
    r.style.setProperty("--accent", pal.accent);
    r.style.setProperty("--accent2", pal.accent2);
    // CTA text needs contrast on accent
    const accentFg = pal.dark ? pal.bg : "#ffffff";
    r.style.setProperty("--bg", pal.bg);
  }

  function renderPage(p) {
    const prevId = p.id > 1 ? p.id - 1 : null;
    const nextId = p.id < pages.length ? p.id + 1 : null;
    const layoutClass = `layout-${p.layout}`;
    const featStyle = `features-style-${p.featureStyle}`;

    const featureCopy = [
      "Built around how your customers actually decide.",
      "Clear pricing signals and no hidden complexity.",
      "Crafted details that make the brand feel premium.",
      "Responsive, accessible, and ready to hand to clients.",
    ];

    root.innerHTML = `
      <div class="lp ${layoutClass}" id="lp">
        <div class="lp-chrome">
          <a class="lp-back" href="index.html">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
            Gallery
          </a>
          <div class="lp-chrome-meta">
            <strong>${esc(p.name)}</strong>
            <span class="lp-badge">#${String(p.id).padStart(3, "0")}</span>
            <span>${esc(p.category)}</span>
            <span>· ${esc(p.layout.replace("hero-", ""))}</span>
          </div>
          <div class="lp-chrome-actions">
            <a class="lp-nav-btn" href="${prevId ? `landing.html?id=${prevId}` : "#"}" aria-label="Previous page" ${prevId ? "" : "aria-disabled='true' tabindex='-1'"} ${prevId ? "" : "style='pointer-events:none;opacity:.35'"}>‹</a>
            <a class="lp-nav-btn" href="${nextId ? `landing.html?id=${nextId}` : "#"}" aria-label="Next page" ${nextId ? "" : "aria-disabled='true' tabindex='-1'"} ${nextId ? "" : "style='pointer-events:none;opacity:.35'"}>›</a>
          </div>
        </div>

        <header class="lp-nav">
          <div class="lp-logo">${esc(p.name)}</div>
          <nav class="lp-links" aria-label="Page sections">
            <a href="#features">Features</a>
            <a href="#story">Story</a>
            <a href="#contact">Contact</a>
          </nav>
          <a class="lp-nav-cta" href="#contact">${esc(p.cta)}</a>
        </header>

        <section class="lp-hero" id="hero-stage">
          <div class="lp-hero-inner">
            <div class="lp-hero-copy reveal">
              ${p.layout === "hero-soft" ? '<div class="lp-hero-panel">' : ""}
              <p class="lp-kicker">${esc(p.type)}</p>
              <h1>${esc(p.tagline)}</h1>
              ${p.layout === "hero-stack" ? '<div class="lp-stack-line"></div>' : ""}
              <p class="lp-sub">${esc(p.desc)}</p>
              <div class="lp-hero-actions">
                <a class="lp-btn lp-btn-primary" href="#contact">${esc(p.cta)}</a>
                <a class="lp-btn lp-btn-secondary" href="#features">See how it works</a>
              </div>
              <div class="lp-stats">
                ${p.stats
                  .map(
                    (s) => `
                  <div class="lp-stat">
                    <strong>${esc(s.n)}</strong>
                    <span>${esc(s.l)}</span>
                  </div>`
                  )
                  .join("")}
              </div>
              ${p.layout === "hero-soft" ? "</div>" : ""}
            </div>
            <div class="lp-hero-visual reveal" id="hero-visual" aria-hidden="true">
              ${
                p.layout === "hero-grid"
                  ? '<div class="lp-tile"></div><div class="lp-tile"></div><div class="lp-tile"></div>'
                  : ""
              }
            </div>
          </div>
        </section>

        <section class="lp-section ${featStyle}" id="features">
          <h2 class="reveal">Why ${esc(p.name)}</h2>
          <p class="lp-section-lead reveal">${esc(p.desc)}</p>
          <div class="lp-features">
            ${p.features
              .map(
                (f, i) => `
              <article class="lp-feature reveal" style="transition-delay:${i * 50}ms">
                <span class="lp-feature-num">${String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>${esc(f)}</h3>
                  <p>${esc(featureCopy[i % featureCopy.length])}</p>
                </div>
              </article>`
              )
              .join("")}
          </div>
        </section>

        <section class="lp-quote" id="story">
          <blockquote class="reveal">
            <p>“${esc(p.testimonial.quote)}”</p>
            <footer>
              <cite>${esc(p.testimonial.author)}</cite> · ${esc(p.testimonial.role)}
            </footer>
          </blockquote>
        </section>

        <section class="lp-cta" id="contact">
          <div class="lp-cta-inner reveal">
            <h2>${esc(p.cta)}</h2>
            <p>Tell us a little about your goals. This is a demo form—no data is sent.</p>
            <form class="lp-form" id="demo-form">
              <label>
                Name
                <input type="text" name="name" placeholder="Your name" required autocomplete="name" />
              </label>
              <label>
                Email
                <input type="email" name="email" placeholder="you@company.com" required autocomplete="email" />
              </label>
              <label>
                Message
                <textarea name="message" placeholder="What are you looking for?" required></textarea>
              </label>
              <button class="lp-btn lp-btn-primary" type="submit" style="width:100%;margin-top:8px">${esc(p.cta)}</button>
              <p class="lp-form-note">Demo only · ${esc(p.palette.name)} palette · ${esc(p.scene)} scene</p>
            </form>
          </div>
        </section>

        <footer class="lp-footer">
          <span>© ${new Date().getFullYear()} ${esc(p.name)} · Lattice demo</span>
          <a href="index.html">All 100 landing pages</a>
        </footer>

        <div class="lp-toast" id="toast" role="status" aria-live="polite">Message ready — demo only</div>
      </div>
    `;

    // Three.js hero atmosphere
    const stage = document.getElementById("hero-stage");
    if (stage && window.LatticeThree) {
      window.LatticeThree.createScene(stage, {
        mode: p.scene,
        accent: p.palette.accent,
        accent2: p.palette.accent2,
        bg: p.palette.bg,
        interactive: true,
      });
    }
  }

  function setupMotion() {
    const reduced =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodes = document.querySelectorAll(".reveal");
    if (reduced) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach((n) => io.observe(n));
  }

  function setupInteractions(p) {
    const form = document.getElementById("demo-form");
    const toast = document.getElementById("toast");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!toast) return;
      toast.textContent = `Thanks — ${p.name} would follow up (demo)`;
      toast.classList.add("is-on");
      setTimeout(() => toast.classList.remove("is-on"), 2600);
      form.reset();
    });

    // Keyboard prev/next
    window.addEventListener("keydown", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft" && p.id > 1) {
        window.location.href = `landing.html?id=${p.id - 1}`;
      } else if (e.key === "ArrowRight" && p.id < pages.length) {
        window.location.href = `landing.html?id=${p.id + 1}`;
      }
    });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """);
  }
})();
