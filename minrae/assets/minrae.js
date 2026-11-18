/* MINRAE concept V5 - shared script: product data, header/footer, sparkles, page renderers. */

// Newest first. Images and checkout links are the live Payhip ones.
const PRODUCTS = [
  { slug: "yume",    name: "Yume",    price: 40, platform: "PC",         url: "https://payhip.com/b/kKx5X", image: "https://pe56d.s3.amazonaws.com/o_1jnngs2jqst41mns1tej6ui1pj817.png" },
  { slug: "miko",    name: "Miko",    price: 35, platform: "PC",         url: "https://payhip.com/b/H3br6", image: "https://pe56d.s3.amazonaws.com/o_1j0jmvuvr19ga15c61bf3ll7rh2r.png" },
  { slug: "love",    name: "Love",    price: 15, platform: "PC",         url: "https://payhip.com/b/YNnCW", image: "https://pe56d.s3.amazonaws.com/o_1ik0aevcu1gd6tkf10d714b7k8ut.png" },
  { slug: "akira",   name: "Akira",   price: 35, platform: "PC + Quest", url: "https://payhip.com/b/cZPe3", image: "https://pe56d.s3.amazonaws.com/o_1ihs4rifb114g1hf77f81ujepdat.png" },
  { slug: "lola",    name: "Lola",    price: 20, platform: "PC",         url: "https://payhip.com/b/XlUr5", image: "https://pe56d.s3.amazonaws.com/o_1ifdql73umr6791q2a1gqkrm31j.png" },
  { slug: "tiki",    name: "Tiki",    price: 35, platform: "PC + Quest", url: "https://payhip.com/b/1Mm0A", image: "https://images.payhip.com/o_1ieeqguqlf4i17kghqt1lhn14bct.gif" },
  { slug: "shinobu", name: "Shinobu", price: 40, platform: "PC",         url: "https://payhip.com/b/AaGeL", image: "https://pe56d.s3.amazonaws.com/o_1icnflckjj7019ep15d1hcu12u0r.png" },
  { slug: "kiki",    name: "Kiki",    price: 35, platform: "PC",         url: "https://payhip.com/b/tnOKI", image: "https://pe56d.s3.amazonaws.com/o_1ibr83jck62r1pepjbt106010s1r.png" },
  { slug: "emi",     name: "Emi",     price: 35, platform: "VRChat",     url: "https://payhip.com/b/IbRvg", image: "https://pe56d.s3.amazonaws.com/o_1i8na313net218lb1dv3j1c6941c.png" },
  { slug: "aika",    name: "Aika",    price: 35, platform: "VRChat",     url: "https://payhip.com/b/HvndF", image: "https://pe56d.s3.amazonaws.com/o_1hq5r98po1alh147r9r4c0s1mmft.png" },
];

// TODO: replace with MINRAE's real Discord invite link.
const DISCORD_URL = "https://discord.gg/your-invite";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------- Theme (Cherry default, Mono alternate) ---------- */
function initTheme() {
  const btns = $$(".theme-toggle");
  const label = () => (document.documentElement.dataset.theme === "mono" ? "Cherry" : "Mono");
  btns.forEach((b) => {
    b.textContent = label();
    b.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "mono" ? "cherry" : "mono";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("minrae-v5-theme", next); } catch (e) {}
      btns.forEach((x) => (x.textContent = label()));
    });
  });
}

/* ---------- Shared chrome ---------- */
function renderChrome() {
  const page = document.body.dataset.page;
  const header = $("#site-header");
  if (header) {
    header.outerHTML = `
      <header class="site-header">
        <a class="brand" href="home.html" aria-label="MINRAE home"><img src="assets/minrae-logo-hq.png" alt="MINRAE"></a>
        <nav class="nav">
          <a href="home.html" ${page === "home" ? 'aria-current="page"' : ""}>Home</a>
          <a href="collection.html" ${page === "collection" || page === "product" ? 'aria-current="page"' : ""}>Collection</a>
          <a href="${DISCORD_URL}" target="_blank" rel="noopener">Discord</a>
        </nav>
        <div class="header-right"><button class="theme-toggle" type="button">Mono</button></div>
      </header>`;
  }
  const footer = $("#site-footer");
  if (footer) {
    footer.outerHTML = `
      <footer class="site-footer">
        <img src="assets/minrae-logo-hq.png" alt="MINRAE">
        <nav>
          <a href="collection.html">Collection</a>
          <a href="${DISCORD_URL}" target="_blank" rel="noopener">Discord</a>
          <a href="https://payhip.com/minrae" target="_blank" rel="noopener">Payhip</a>
        </nav>
        <span>MINRAE &copy; 2026</span>
      </footer>`;
  }
}

/* ---------- Sparkles ----------
   data-sparkles="ring"  : twinkling sparkles orbiting an element (logo)
   data-sparkles="float" : sparkles slowly drifting upward (hero background) */
function sparkle(layer, css) {
  const s = document.createElement("i");
  s.className = "spk";
  Object.assign(s.style, css);
  layer.appendChild(s);
  return s;
}
function initSparkles() {
  $$("[data-sparkles]").forEach((host) => {
    const mode = host.dataset.sparkles;
    const count = +host.dataset.count || 20;
    const layer = document.createElement("div");
    layer.className = "sparkle-layer";
    layer.setAttribute("aria-hidden", "true");
    host.prepend(layer);

    for (let i = 0; i < count; i++) {
      const size = Math.round(rand(6, i % 5 === 0 ? 26 : 15)) + "px";
      if (mode === "ring") {
        // Distribute around an ellipse, with some sparkles drifting inward for depth.
        const a = (i / count) * Math.PI * 2 + rand(-.25, .25);
        const r = rand(.38, .52);
        sparkle(layer, {
          left: `calc(${50 + Math.cos(a) * r * 100}% - ${size} / 2)`,
          top: `calc(${50 + Math.sin(a) * r * 100}% - ${size} / 2)`,
          width: size, height: size,
          animationDelay: `${rand(-4, 0)}s`, animationDuration: `${rand(2.2, 4.5)}s`,
        });
      } else {
        const s = sparkle(layer, {
          left: `${rand(0, 100)}%`, width: size, height: size,
          animationDelay: `${rand(-18, 0)}s`, animationDuration: `${rand(10, 20)}s`,
        });
        s.classList.add("float");
      }
    }
    // A few static twinklers on top for "float" mode, so it never looks empty.
    if (mode === "float") {
      for (let i = 0; i < Math.round(count / 2); i++) {
        const size = Math.round(rand(5, 13)) + "px";
        sparkle(layer, { left: `${rand(2, 98)}%`, top: `${rand(4, 96)}%`, width: size, height: size, animationDelay: `${rand(-4, 0)}s` });
      }
    }
  });
}

/* ---------- Cards ---------- */
const money = (n) => `$${n}`;
function cardHTML(p) {
  return `
    <a class="card glow" href="product.html?p=${p.slug}">
      <div class="thumb"><img src="${p.image}" alt="${p.name} VRChat avatar" loading="lazy"></div>
      <div class="info">
        <div class="name">${p.name}<span class="plat">${p.platform}</span></div>
        <div class="price">${money(p.price)}</div>
      </div>
    </a>`;
}

/* ---------- Page: home ---------- */
function initHome() {
  const grid = $("#latest-grid");
  if (grid) grid.innerHTML = PRODUCTS.slice(1, 5).map(cardHTML).join("");
  const n = $("#avatar-count");
  if (n) n.textContent = PRODUCTS.length;
  $$("[data-discord]").forEach((a) => (a.href = DISCORD_URL));
}

/* ---------- Page: collection ---------- */
function initCollection() {
  const grid = $("#collection-grid");
  if (!grid) return;
  let filter = "all", sort = "new";
  const render = () => {
    let list = PRODUCTS.map((p, i) => ({ ...p, i }));
    if (filter !== "all") list = list.filter((p) => p.platform === filter);
    if (sort === "low") list.sort((a, b) => a.price - b.price || a.i - b.i);
    if (sort === "high") list.sort((a, b) => b.price - a.price || a.i - b.i);
    grid.innerHTML = list.map(cardHTML).join("");
    $("#count").textContent = `${list.length} avatar${list.length === 1 ? "" : "s"}`;
  };
  $$(".chip").forEach((c) => c.addEventListener("click", () => {
    $$(".chip").forEach((x) => x.classList.toggle("is-active", x === c));
    filter = c.dataset.filter; render();
  }));
  $("#sort").addEventListener("change", (e) => { sort = e.target.value; render(); });
  render();
}

/* ---------- Page: product ---------- */
function initProduct() {
  const host = $("#product");
  if (!host) return;
  const slug = new URLSearchParams(location.search).get("p") || PRODUCTS[0].slug;
  const p = PRODUCTS.find((x) => x.slug === slug) || PRODUCTS[0];
  document.title = `${p.name} - MINRAE`;
  $("#crumb").textContent = p.name;
  host.innerHTML = `
    <div class="media glow"><img src="${p.image}" alt="${p.name} VRChat avatar"></div>
    <div>
      <span class="eyebrow">VRChat avatar</span>
      <h1>${p.name}</h1>
      <div class="price">${money(p.price)}</div>
      <ul class="specs">
        <li><span>Platform</span><span>${p.platform}</span></li>
        <li><span>Format</span><span>Unity package</span></li>
        <li><span>Delivery</span><span>Instant download</span></li>
      </ul>
      <a class="btn btn-solid" href="${p.url}" target="_blank" rel="noopener">Buy on Payhip <i class="spk-inline"></i></a>
      <p class="note">Full feature list, setup notes and terms are on the Payhip listing.</p>
    </div>`;
  $("#related-grid").innerHTML = PRODUCTS.filter((x) => x.slug !== p.slug).slice(0, 4).map(cardHTML).join("");
}

renderChrome();
initTheme();
initSparkles();
initHome();
initCollection();
initProduct();
