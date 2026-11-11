import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

export function serve() {
  const port = Number(option("--port", process.env.PORT || "3000"));
  const host = option("--host", process.env.HOST || "127.0.0.1");
  const server = createServer(async (request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    try {
      const url = new URL(request.url, "http://localhost");
      const pathname = decodeURIComponent(url.pathname);
      let file = resolve(root, `.${pathname}`);
      if (file !== root && !file.startsWith(root + sep)) {
        response.writeHead(403).end();
        return;
      }
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith("/")) {
          response
            .writeHead(308, { Location: `${url.pathname}/${url.search}` })
            .end();
          return;
        }
        file = resolve(file, "index.html");
      }
      const content = await readFile(file);
      response.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch {
      const content = await readFile(resolve(root, "404.html")).catch(
        () => "Página no encontrada",
      );
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(request.method === "HEAD" ? undefined : content);
    }
  });
  server.listen(port, host, () =>
    console.log(`Vista local en http://${host}:${port}`),
  );
  return server;
}

if (resolve(process.argv[1]) === fileURLToPath(import.meta.url)) serve();
