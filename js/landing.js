import { LANDING_PAGES } from "./businesses.js";
import { createScene } from "./three-scene.js";
import { imagesForPage } from "./images.js";

const pages = LANDING_PAGES || [];
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
} else {
  document.title = `${page.name} · Lattice`;
  applyPalette(page.palette);
  renderPage(page);
  setupMotion();
  setupInteractions(page);

  requestAnimationFrame(() => {
    loading?.classList.add("is-done");
    setTimeout(() => loading?.remove(), 450);
  });
}

function applyPalette(pal) {
  const r = document.documentElement;
  r.style.setProperty("--bg", pal.bg);
  r.style.setProperty("--surface", pal.surface);
  r.style.setProperty("--fg", pal.fg);
  r.style.setProperty("--muted", pal.muted);
  r.style.setProperty("--accent", pal.accent);
  r.style.setProperty("--accent2", pal.accent2);
}

function initials(name) {
  return String(name)
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderPage(p) {
  const prevId = p.id > 1 ? p.id - 1 : null;
  const nextId = p.id < pages.length ? p.id + 1 : null;
  const layoutClass = `layout-${p.layout}`;
  const featStyle = `features-style-${p.featureStyle}`;
  const imgs = imagesForPage(p);

  const featureCopy = [
    "Designed around how your customers actually decide.",
    "Clear pricing signals with no hidden complexity.",
    "Crafted details that make the brand feel premium.",
    "Responsive, accessible, and ready to hand to clients.",
  ];

  const steps = [
    { t: "Discover", d: `We map goals for ${p.type.toLowerCase()} and define success metrics.` },
    { t: "Design", d: "Layout, palette, and content system tailored to your audience." },
    { t: "Launch", d: "Ship a polished experience your team can iterate on." },
  ];

  const trust = ["Northline", "Parcel & Co", "Aether", "Summit Group", "Forma"];

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
          <span class="hide-sm">${esc(p.category)}</span>
        </div>
        <div class="lp-chrome-actions">
          <a class="lp-nav-btn" href="${prevId ? `landing.html?id=${prevId}` : "#"}" aria-label="Previous page" ${prevId ? "" : 'aria-disabled="true" tabindex="-1" style="pointer-events:none;opacity:.35"'}>‹</a>
          <a class="lp-nav-btn" href="${nextId ? `landing.html?id=${nextId}` : "#"}" aria-label="Next page" ${nextId ? "" : 'aria-disabled="true" tabindex="-1" style="pointer-events:none;opacity:.35"'}>›</a>
        </div>
      </div>

      <header class="lp-nav">
        <div class="lp-logo">
          <span class="lp-logo-mark" aria-hidden="true"></span>
          ${esc(p.name)}
        </div>
        <nav class="lp-links" aria-label="Page sections">
          <a href="#features">Product</a>
          <a href="#gallery">Gallery</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
        <a class="lp-nav-cta" href="#contact">${esc(p.cta)}</a>
      </header>

      <section class="lp-hero">
        <div class="lp-hero-inner">
          <div class="lp-hero-copy reveal">
            <p class="lp-kicker">${esc(p.type)}</p>
            <h1>${esc(p.tagline)}</h1>
            ${p.layout === "hero-stack" ? '<div class="lp-stack-line"></div>' : ""}
            <p class="lp-sub">${esc(p.desc)}</p>
            <div class="lp-hero-actions">
              <a class="lp-btn lp-btn-primary" href="#contact">${esc(p.cta)}</a>
              <a class="lp-btn lp-btn-secondary" href="#features">Explore capabilities</a>
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
          </div>

          <div class="lp-hero-media reveal" id="hero-media">
            <img src="${esc(imgs.hero)}" alt="" width="1176" height="784" loading="eager" decoding="async" />
            <div class="lp-hero-media-overlay" aria-hidden="true"></div>
            <div class="lp-hero-media-caption">
              <strong>${esc(p.name)}</strong>
              <span>${esc(p.category)}</span>
            </div>
            <div class="lp-three-accent" id="three-accent" aria-hidden="true"></div>
          </div>
        </div>
      </section>

      <div class="lp-trust reveal">
        <p class="lp-trust-label">Trusted by teams who care about craft</p>
        <div class="lp-trust-row">
          ${trust.map((t) => `<span class="lp-trust-item">${esc(t)}</span>`).join("")}
        </div>
      </div>

      <section class="lp-section ${featStyle}" id="features">
        <div class="lp-section-head reveal">
          <p class="lp-section-label">Capabilities</p>
          <h2>Why teams choose ${esc(p.name)}</h2>
          <p class="lp-section-lead">${esc(p.desc)}</p>
        </div>
        <div class="lp-features">
          ${p.features
            .map(
              (f, i) => `
            <article class="lp-feature reveal" style="transition-delay:${i * 45}ms">
              <div class="lp-feature-img">
                <img src="${esc(imgs.feature[i % imgs.feature.length])}" alt="" width="800" height="500" loading="lazy" decoding="async" />
              </div>
              <div class="lp-feature-body">
                <span class="lp-feature-num">${String(i + 1).padStart(2, "0")}</span>
                <h3>${esc(f)}</h3>
                <p>${esc(featureCopy[i % featureCopy.length])}</p>
              </div>
            </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="lp-gallery" id="gallery">
        <div class="lp-section-head reveal" style="padding:0 0 20px">
          <p class="lp-section-label">Visual identity</p>
          <h2>A look inside the experience</h2>
        </div>
        <div class="lp-gallery-grid reveal">
          ${imgs.gallery
            .map(
              (src, i) => `
            <div class="lp-gallery-item">
              <img src="${esc(src)}" alt="" width="900" height="600" loading="lazy" decoding="async" />
            </div>`
            )
            .join("")}
        </div>
      </section>

      <section class="lp-section" id="process" style="padding-top:24px">
        <div class="lp-section-head reveal">
          <p class="lp-section-label">How it works</p>
          <h2>From first conversation to launch</h2>
        </div>
        <div class="lp-process">
          ${steps
            .map(
              (s, i) => `
            <div class="lp-step reveal" style="transition-delay:${i * 50}ms">
              <div class="lp-step-n">${i + 1}</div>
              <div>
                <h3>${esc(s.t)}</h3>
                <p>${esc(s.d)}</p>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </section>

      <section class="lp-quote" id="story">
        <div class="lp-quote-card reveal">
          <p>“${esc(p.testimonial.quote)}”</p>
          <div class="lp-quote-meta">
            <div class="lp-avatar" aria-hidden="true">${esc(initials(p.testimonial.author))}</div>
            <div>
              <cite>${esc(p.testimonial.author)}</cite>
              <span>${esc(p.testimonial.role)}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="lp-cta" id="contact">
        <div class="lp-cta-grid reveal">
          <div class="lp-cta-media">
            <img src="${esc(imgs.cta)}" alt="" width="900" height="700" loading="lazy" decoding="async" />
          </div>
          <div class="lp-cta-body">
            <h2>${esc(p.cta)}</h2>
            <p>Share a few details and we will follow up with next steps. Demo form only — nothing is sent.</p>
            <form class="lp-form" id="demo-form">
              <div class="lp-form-row">
                <label>
                  Name
                  <input type="text" name="name" placeholder="Your name" required autocomplete="name" />
                </label>
                <label>
                  Email
                  <input type="email" name="email" placeholder="you@company.com" required autocomplete="email" />
                </label>
              </div>
              <label>
                Message
                <textarea name="message" placeholder="What are you looking for?" required></textarea>
              </label>
              <button class="lp-btn lp-btn-primary" type="submit" style="width:100%">${esc(p.cta)}</button>
              <p class="lp-form-note">Demo · ${esc(p.palette.name)} palette · photography-led layout</p>
            </form>
          </div>
        </div>
      </section>

      <footer class="lp-footer">
        <span>© ${new Date().getFullYear()} ${esc(p.name)}</span>
        <a href="index.html">Browse all 100 landing pages</a>
      </footer>

      <div class="lp-toast" id="toast" role="status" aria-live="polite">Message ready — demo only</div>
    </div>
  `;

  // Subtle Three.js accent only (corner of hero image)
  const accent = document.getElementById("three-accent");
  if (accent) {
    createScene(accent, {
      mode: p.scene,
      accent: p.palette.accent,
      accent2: p.palette.accent2,
      subtle: true,
      interactive: false,
      className: "lp-canvas",
    });
  }
}

function setupMotion() {
  const reduced =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nodes = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
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
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
