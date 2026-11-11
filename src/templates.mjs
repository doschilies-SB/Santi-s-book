import { marked } from "marked";

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

export function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const e = escapeHtml;
const sunPoints = Array.from({ length: 32 }, (_, index) => {
  const angle = (index * Math.PI) / 16 - Math.PI / 2;
  const radius = index % 2 === 0 ? 11.4 : 6.7;
  const x = (18 + radius * Math.cos(angle)).toFixed(2);
  const y = (16 + radius * Math.sin(angle)).toFixed(2);
  return `${x},${y}`;
}).join(" ");
const paragraphs = (values) =>
  values.map((value) => `<p>${e(value)}</p>`).join("\n");
const inlineParagraphs = (values) =>
  values.map((value) => `<p>${marked.parseInline(value)}</p>`).join("\n");

function motif(kind, exhibition) {
  if (!exhibition.motifs?.image) return "";
  return `<span class="motif motif--${kind}" aria-hidden="true"></span>`;
}

function dateLabel(date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function postList(posts) {
  return `<div class="writing-list">${posts
    .map(
      (post) => `
    <article class="writing-card">
      <div class="writing-meta"><span>${e(post.category)}</span><time datetime="${post.publishedAt}">${dateLabel(post.publishedAt)}</time></div>
      <h3><a href="/escritos/${post.slug}/">${e(post.title)}</a></h3>
      ${post.excerpt ? `<p>${e(post.excerpt)}</p>` : ""}
    </article>`,
    )
    .join("")}</div>`;
}

function emptyWriting() {
  return `<div class="empty-writing"><p>El primer escrito está en camino.</p></div>`;
}

function page({
  site,
  title,
  description = site.description,
  path = "/",
  body,
  kind = "home",
  article,
}) {
  const exhibition = site.exhibition;
  const fullTitle = title
    ? `${title} · ${site.name}`
    : `${site.name} · Escritos y pensamientos`;
  const canonical = site.url ? new URL(path, site.url).href : "";
  const ogImage = site.url ? new URL(exhibition.image, site.url).href : "";
  const theme = Object.entries(exhibition.theme)
    .map(([key, value]) => `--${key}:${value}`)
    .join(";");
  const motifStyle = exhibition.motifs?.image
    ? `;--motifs:url('${e(exhibition.motifs.image)}');--hat-position:${e(exhibition.motifs.hatPosition || "left center")};--napkin-position:${e(exhibition.motifs.napkinPosition || "right center")}`
    : "";
  const themeInitScript = article
    ? `<script>try{if(localStorage.getItem("santis-book-reading-theme")==="night")document.documentElement.setAttribute("data-reading-theme","night");}catch{}</script>`
    : "";
  const articleCategoryClass = article
    ? ` page-article--${slugify(article.category)}`
    : "";
  return `<!doctype html>
<html lang="es-AR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(fullTitle)}</title>
  <meta name="description" content="${e(description)}">
  <meta name="theme-color" content="${exhibition.theme.night}">
  <meta property="og:title" content="${e(fullTitle)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:type" content="${article ? "article" : "website"}">
  <meta property="og:locale" content="es_AR">
  ${canonical ? `<link rel="canonical" href="${e(canonical)}"><meta property="og:url" content="${e(canonical)}">` : ""}
  ${ogImage ? `<meta property="og:image" content="${e(ogImage)}"><meta property="og:image:alt" content="${e(exhibition.alt)}">` : ""}
  ${article ? `<meta property="article:published_time" content="${article.publishedAt}"><meta property="article:author" content="${e(site.author)}">` : ""}
  ${themeInitScript}
  <link rel="stylesheet" href="/assets/fonts.css">
  <link rel="stylesheet" href="/assets/styles.css">
  <script src="/assets/main.js" defer></script>
</head>
<body class="page-${kind}${articleCategoryClass}" style="${theme}${motifStyle}">
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <header class="site-header" id="arriba">
    <a class="wordmark" href="/" aria-label="${e(site.name)}, inicio">${e(site.name)}</a>
    <nav aria-label="Navegación principal">
      <a href="/" ${path === "/" ? 'aria-current="page"' : ""}>Inicio</a>
      <a href="/sobre-santi-buffa/" ${path === "/sobre-santi-buffa/" ? 'aria-current="page"' : ""}>Sobre Santi Buffa</a>
    </nav>
  </header>
  <main id="contenido">${body}</main>
  <footer class="site-footer">
    <a class="footer-name" href="/">${e(site.name)}</a>
    <span>Escritos y pensamientos</span>
    <a class="back-top" href="#arriba">Volver arriba</a>
  </footer>
</body>
</html>`;
}

export function homePage(site, posts, categories) {
  const art = site.exhibition;
  const picture = `<img src="${e(art.image)}" ${art.previewImage ? `srcset="${e(art.previewImage)} 1280w, ${e(art.image)} ${art.imageWidth}w" sizes="(max-width: 850px) 92vw, 57vw"` : ""} width="${art.imageWidth}" height="${art.imageHeight}" alt="${e(art.alt)}" fetchpriority="high">`;
  const body = `
    <section class="gallery" aria-labelledby="welcome-title">
      <div class="gallery-light" aria-hidden="true"></div>
      <div class="welcome">
        <h1 id="welcome-title" aria-label="Sean bienvenidos"><span class="welcome-first-word"><span class="welcome-initial">S${motif("hat", art)}</span>ean</span><br><em>bienvenidos</em></h1>
        <div class="welcome-copy">${paragraphs(site.welcome)}</div>
      </div>
      <div class="exhibition">
        <figure class="painting">
          <a class="painting-frame" href="${e(art.image)}" data-open-art aria-label="Ampliar ${e(art.title)}">
            <span class="painting-canvas">${picture}</span>
            <span class="painting-zoom" aria-hidden="true">Ampliar</span>
          </a>
          <figcaption class="painting-caption">
            <div><h2>${e(art.title)} <span>(${e(art.originalTitle)})</span></h2><p>${e(art.artist)} <span aria-hidden="true">·</span> ${e(art.year)}</p></div>
            <span class="painting-medium">${e(art.medium)}</span>
          </figcaption>
        </figure>
        <p class="exhibition-note">${e(art.note)}</p>
      </div>
    </section>

    <section class="reflection-section" aria-labelledby="reflection-title">
      <div class="reflection-intro"><h2 id="reflection-title">Por qué<br><em>este cuadro</em></h2></div>
      <div class="reflection-window">
        <div class="reflection-copy">${inlineParagraphs(art.reflection)}</div>
        <span class="signature">Santi</span>
      </div>
    </section>

    <section class="recent-section section-shell" id="escritos" aria-labelledby="recent-title">
      <div class="section-heading"><h2 id="recent-title">Últimos <em>escritos</em></h2>${motif("napkin", art)}</div>
      ${posts.length ? postList(posts.slice(0, 3)) : emptyWriting()}
    </section>

    <section class="categories-section section-shell" aria-labelledby="categories-title">
      <h2 id="categories-title">Para seguir <em>leyendo</em></h2>
      <div class="category-list">${categories.map((category) => `<a href="/generos/${category.slug}/"><span>${e(category.name)}</span><span class="category-count">${category.count} ${category.count === 1 ? "escrito" : "escritos"}</span></a>`).join("")}</div>
    </section>

    <div class="art-credit section-shell"><span>${e(art.title)}, ${e(art.artist)}, ${e(art.year)}.</span><a href="${e(art.sourceUrl)}" target="_blank" rel="noopener noreferrer">${e(art.sourceName)}</a></div>
    <dialog class="art-dialog" aria-labelledby="dialog-art-title">
      <button class="dialog-close" type="button" data-close-art aria-label="Cerrar cuadro ampliado">Cerrar <span aria-hidden="true">×</span></button>
      <img src="${e(art.image)}" width="${art.imageWidth}" height="${art.imageHeight}" alt="${e(art.alt)}" loading="lazy">
      <p id="dialog-art-title">${e(art.title)} · ${e(art.artist)} · ${e(art.year)}</p>
    </dialog>`;
  return page({ site, body });
}

export function aboutPage(site) {
  return page({
    site,
    title: "Sobre Santi Buffa",
    path: "/sobre-santi-buffa/",
    kind: "about",
    body: `
    <section class="about-page section-shell">
      <a class="text-link" href="/">Volver al inicio</a>
      <div class="about-grid"><div><h1>Sobre<br><em>Santi Buffa</em></h1></div>
      <div class="about-copy">${paragraphs(site.about)}<a class="text-link" href="/#escritos">Leer los escritos</a></div></div>
    </section>`,
  });
}

export function categoryPage(site, category, posts) {
  return page({
    site,
    title: category.name,
    path: `/generos/${category.slug}/`,
    kind: "archive",
    body: `
    <section class="archive-page section-shell">
      <a class="text-link" href="/">Volver al inicio</a>
      <div class="archive-heading"><h1>${e(category.name)}</h1></div>
      ${posts.length ? postList(posts) : emptyWriting()}
    </section>`,
  });
}

export function articlePage(site, post, neighbors) {
  const categorySlug = slugify(post.category);
  const categoryPath = `/generos/${categorySlug}/`;
  return page({
    site,
    title: post.title,
    description: post.excerpt || site.description,
    path: `/escritos/${post.slug}/`,
    kind: "article",
    article: post,
    body: `
    <div class="reading-canvas">
      <article class="reading-page" data-category="${categorySlug}">
        <header class="reading-header">
          <div class="reading-header-bar">
            <a class="text-link reading-category" href="${categoryPath}">${e(post.category)}</a>
            <button class="reading-theme-toggle" type="button" data-reading-theme-toggle aria-pressed="false" aria-label="Modo noche">
              <svg class="reading-theme-icon" viewBox="0 0 64 32" width="56" height="28" aria-hidden="true" focusable="false">
                <rect class="reading-theme-track" x="1.5" y="1.5" width="61" height="29" rx="14.5" />
                <polygon class="reading-theme-sun" points="${sunPoints}" />
                <path class="reading-theme-moon" d="M 43.92 4.71 A 11.4 11.4 0 1 1 37.16 23.77 A 10.2 10.2 0 0 0 43.92 4.71 Z" />
                <circle class="reading-theme-knob" cx="17" cy="16" r="11.6" />
              </svg>
            </button>
          </div>
          <h1>${e(post.title)}</h1>
          ${post.excerpt ? `<p class="reading-excerpt">${e(post.excerpt)}</p>` : ""}
          <div class="reading-meta"><time datetime="${post.publishedAt}">${dateLabel(post.publishedAt)}</time></div>
        </header>
        <div class="prose">${post.html}</div>
        <p class="reading-signature">${e(site.author)}</p>
        <footer class="reading-end" aria-label="Navegación del artículo">
          <a class="text-link" href="${categoryPath}">Más en ${e(post.category)}</a>
          <a class="text-link" href="/">Volver al inicio</a>
        </footer>
      </article>
      ${neighbors.length ? `<section class="more-writing section-shell"><h2>Para seguir <em>leyendo</em></h2>${postList(neighbors)}</section>` : ""}
    </div>`,
  });
}

export function notFoundPage(site) {
  return page({
    site,
    title: "Página no encontrada",
    path: "/404.html",
    kind: "not-found",
    body: `
    <section class="not-found section-shell"><p class="small-caption">404</p><h1>Por acá<br><em>todavía no hay un escrito.</em></h1><a class="text-link" href="/">Volver al inicio</a></section>`,
  });
}
