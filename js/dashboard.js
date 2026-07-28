(function () {
  "use strict";

  const pages = window.LANDING_PAGES || [];
  const categories = window.LANDING_CATEGORIES || [];

  const grid = document.getElementById("card-grid");
  const empty = document.getElementById("empty-state");
  const search = document.getElementById("search");
  const chips = document.getElementById("category-chips");
  const resultCount = document.getElementById("result-count");
  const countPill = document.getElementById("count-pill");
  const heroPreview = document.getElementById("hero-preview-grid");
  const btnRandom = document.getElementById("btn-random");
  const btnClear = document.getElementById("btn-clear");

  let activeCategory = "All";
  let query = "";
  let view = "grid";

  if (countPill) countPill.textContent = `${pages.length} pages`;

  // Three.js background
  const canvas = document.getElementById("bg-canvas");
  if (canvas && window.LatticeThree) {
    window.LatticeThree.createScene(canvas, {
      mode: "lattice",
      accent: "#5eead4",
      accent2: "#2a6f7a",
      bg: "#090a0c",
      interactive: true,
    });
  }

  // Palette mosaic
  if (heroPreview) {
    const sample = pages.slice(0, 20);
    heroPreview.innerHTML = sample
      .map(
        (p) =>
          `<span style="background:${p.palette.accent}" title="${escapeHtml(p.name)}"></span>`
      )
      .join("");
  }

  // Category chips
  if (chips) {
    const all = ["All", ...categories];
    chips.innerHTML = all
      .map(
        (c, i) =>
          `<button type="button" class="chip${i === 0 ? " is-active" : ""}" role="option" aria-selected="${i === 0}" data-cat="${escapeAttr(c)}">${escapeHtml(c)}</button>`
      )
      .join("");

    chips.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      activeCategory = btn.dataset.cat;
      chips.querySelectorAll(".chip").forEach((el) => {
        const on = el === btn;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-selected", on ? "true" : "false");
      });
      render();
    });
  }

  // View toggle
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      view = btn.dataset.view;
      document.querySelectorAll(".view-btn").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      grid.classList.toggle("is-list", view === "list");
    });
  });

  if (search) {
    let t;
    search.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        query = search.value.trim().toLowerCase();
        render();
      }, 120);
    });
  }

  if (btnRandom) {
    btnRandom.addEventListener("click", () => {
      const p = pages[Math.floor(Math.random() * pages.length)];
      if (p) window.location.href = `landing.html?id=${p.id}`;
    });
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      query = "";
      activeCategory = "All";
      if (search) search.value = "";
      chips?.querySelectorAll(".chip").forEach((el, i) => {
        el.classList.toggle("is-active", i === 0);
        el.setAttribute("aria-selected", i === 0 ? "true" : "false");
      });
      render();
    });
  }

  function filterPages() {
    return pages.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (!query) return true;
      const hay = `${p.name} ${p.tagline} ${p.type} ${p.category} ${p.desc}`.toLowerCase();
      return hay.includes(query);
    });
  }

  function render() {
    const list = filterPages();
    if (resultCount) resultCount.textContent = String(list.length);

    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    grid.innerHTML = list
      .map((p, i) => {
        const delay = Math.min(i, 24) * 18;
        return `
        <a class="card" href="landing.html?id=${p.id}" style="--card-bg:${p.palette.bg};--card-surface:${p.palette.surface};--card-accent:${p.palette.accent};animation-delay:${delay}ms">
          <div class="card-swatch">
            <div class="card-swatch-dots" aria-hidden="true">
              <i style="background:${p.palette.accent}"></i>
              <i style="background:${p.palette.accent2}"></i>
              <i style="background:${p.palette.fg}"></i>
            </div>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-id">#${String(p.id).padStart(3, "0")}</span>
              <span class="card-cat">${escapeHtml(p.category)}</span>
            </div>
            <h3>${escapeHtml(p.name)}</h3>
            <p class="card-tagline">${escapeHtml(p.tagline)}</p>
            <div class="card-foot">
              <span class="card-type">${escapeHtml(p.type)} · ${escapeHtml(p.layout.replace("hero-", ""))}</span>
              <span class="card-open">Open →</span>
            </div>
          </div>
        </a>`;
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """);
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  render();
})();
