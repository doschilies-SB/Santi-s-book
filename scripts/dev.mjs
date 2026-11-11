import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "./serve.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let building = false;
let rebuildRequested = false;
let timer;

async function rebuild() {
  if (building) {
    rebuildRequested = true;
    return;
  }
  building = true;
  const success = await new Promise((resolveResult) => {
    const child = spawn(process.execPath, ["scripts/build.mjs"], {
      cwd: root,
      stdio: "inherit",
    });
    child.once("exit", (code) => resolveResult(code === 0));
    child.once("error", (error) => {
      console.error(error.message);
      resolveResult(false);
    });
  });
  building = false;
  if (rebuildRequested) {
    rebuildRequested = false;
    await rebuild();
  }
  return success;
}

if (!(await rebuild())) process.exit(1);
const server = serve();
const watchers = ["content", "src", "public"].map((directory) =>
  watch(resolve(root, directory), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 180);
  }),
);

function close() {
  clearTimeout(timer);
  watchers.forEach((watcher) => watcher.close());
  server.close(() => process.exit(0));
}
process.on("SIGTERM", close);
process.on("SIGINT", close);
