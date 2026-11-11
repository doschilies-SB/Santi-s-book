import {
  readFile,
  writeFile,
  mkdir,
  cp,
  rm,
  rename,
  stat,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import {
  homePage,
  aboutPage,
  categoryPage,
  articlePage,
  notFoundPage,
  slugify,
  escapeHtml,
} from "../src/templates.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "dist");
const staging = join(root, `.dist-tmp-${process.pid}`);
const readJson = async (path) =>
  JSON.parse(await readFile(join(root, path), "utf8"));

function requiredString(value, label) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Falta ${label}.`);
}

function localAsset(value, label) {
  requiredString(value, label);
  if (
    !/^\/assets\/[a-zA-Z0-9_./-]+$/.test(value) ||
    value.split("/").includes("..")
  ) {
    throw new Error(`${label} debe ser una ruta dentro de /assets/.`);
  }
}

async function build() {
  const site = await readJson("content/sitio.json");
  const catalog = await readJson("content/escritos.json");
  if (!Array.isArray(catalog))
    throw new Error("content/escritos.json debe contener una lista.");
  requiredString(site.name, "el nombre del sitio");
  requiredString(site.author, "el nombre del autor");
  if (site.url && !/^https?:\/\//.test(site.url))
    throw new Error("La URL del sitio debe empezar con https:// o http://.");
  if (site.url) site.url = new URL(site.url).origin;
  const art = site.exhibition;
  for (const [key, value] of Object.entries(art.theme)) {
    if (!/^[a-z]+$/.test(key) || !/^#[a-fA-F0-9]{6}$/.test(value))
      throw new Error(`Color inválido en exhibition.theme.${key}.`);
  }
  const assets = [art.image, art.previewImage, art.motifs?.image].filter(
    Boolean,
  );
  for (const asset of assets) {
    localAsset(asset, "la imagen de la exposición");
    await stat(join(root, "public", asset));
  }
  if (
    !Number.isInteger(art.imageWidth) ||
    !Number.isInteger(art.imageHeight) ||
    art.imageWidth <= 0 ||
    art.imageHeight <= 0
  ) {
    throw new Error(
      "Las dimensiones del cuadro deben ser números enteros positivos.",
    );
  }

  const posts = [];
  const usedSlugs = new Set();
  for (const entry of catalog) {
    if (entry.draft === true) continue;
    for (const key of ["slug", "title", "category", "publishedAt", "file"])
      requiredString(entry[key], `${key} en un escrito`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug))
      throw new Error(
        `Slug inválido: ${entry.slug}. Usá letras minúsculas, números y guiones.`,
      );
    if (usedSlugs.has(entry.slug))
      throw new Error(`El slug ${entry.slug} está repetido.`);
    usedSlugs.add(entry.slug);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(entry.publishedAt) ||
      Number.isNaN(Date.parse(entry.publishedAt)) ||
      new Date(entry.publishedAt).toISOString().slice(0, 10) !==
        entry.publishedAt
    ) {
      throw new Error(`Fecha inválida en ${entry.slug}. Usá AAAA-MM-DD.`);
    }
    if (!/^[a-zA-Z0-9_-]+\.md$/.test(entry.file))
      throw new Error(
        `Archivo inválido en ${entry.slug}. Guardá el Markdown directamente en content/escritos/.`,
      );
    const markdown = await readFile(
      join(root, "content/escritos", entry.file),
      "utf8",
    );
    if (!markdown.trim())
      throw new Error(`El escrito ${entry.slug} está vacío.`);
    posts.push({ ...entry, html: marked.parse(markdown) });
  }
  // For a shared publication date, the last entry added to the catalog comes first.
  posts
    .reverse()
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));

  const categoryMap = new Map();
  for (const name of [
    ...site.initialCategories,
    ...posts.map((post) => post.category),
  ]) {
    requiredString(name, "el nombre de una categoría");
    const slug = slugify(name);
    if (!slug)
      throw new Error(
        `No se pudo crear una dirección para la categoría ${name}.`,
      );
    const existing = categoryMap.get(slug);
    if (existing && existing.name !== name)
      throw new Error(
        `Dos categorías comparten la dirección ${slug}. Unificá sus nombres.`,
      );
    categoryMap.set(slug, {
      name,
      slug,
      count: posts.filter((post) => post.category === name).length,
    });
  }
  const categories = [...categoryMap.values()];
  const pages = new Map([
    ["/", homePage(site, posts, categories)],
    ["/sobre-santi-buffa/", aboutPage(site)],
    ["/404.html", notFoundPage(site)],
  ]);
  for (const category of categories) {
    pages.set(
      `/generos/${category.slug}/`,
      categoryPage(
        site,
        category,
        posts.filter((post) => post.category === category.name),
      ),
    );
  }
  for (const post of posts) {
    const neighbors = posts
      .filter(
        (candidate) =>
          candidate.slug !== post.slug && candidate.category === post.category,
      )
      .slice(0, 2);
    pages.set(`/escritos/${post.slug}/`, articlePage(site, post, neighbors));
  }

  // Prepare the complete result before replacing the previous build.
  await rm(staging, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });
  await cp(join(root, "public"), staging, { recursive: true });
  for (const [path, html] of pages) {
    const file = join(staging, path.endsWith("/") ? `${path}index.html` : path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
  }
  if (site.url) {
    const entries = [...pages.keys()]
      .filter((path) => path !== "/404.html")
      .map(
        (path) =>
          `<url><loc>${escapeHtml(new URL(path, site.url).href)}</loc></url>`,
      )
      .join("\n");
    await writeFile(
      join(staging, "sitemap.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`,
    );
  }
  await writeFile(
    join(staging, "robots.txt"),
    `User-agent: *\nAllow: /\n${site.url ? `Sitemap: ${site.url}/sitemap.xml\n` : ""}`,
  );
  await rm(output, { recursive: true, force: true });
  try {
    await rename(staging, output);
  } catch {
    await cp(staging, output, { recursive: true, force: true });
    await rm(staging, { recursive: true, force: true });
  }
  console.log(
    `Sitio generado en dist/. ${posts.length} escritos, ${categories.length} categorías.`,
  );
}

build().catch(async (error) => {
  await rm(staging, { recursive: true, force: true }).catch(() => {});
  console.error(`No se pudo generar el sitio. ${error.message}`);
  process.exitCode = 1;
});
