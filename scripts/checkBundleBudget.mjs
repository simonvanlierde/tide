// Fails when the largest JavaScript file in the build, or the files the service
// worker precaches taken together, gzipped, are over their budgets. Run after `pnpm build`.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { gzipSync } from "node:zlib";

// The budget, in gzipped bytes. It catches a dependency or a chunk split gone wrong, not
// the next feature: keep it at least 25% above the build. When a change goes over, find
// what grew first, then raise it in its own commit, back to 25% headroom.
// The main chunk measured 96,637 bytes and the precache 204,921 bytes when these were set.
const MAX_GZIP_BYTES = 118 * 1024;
const MAX_PRECACHE_GZIP_BYTES = 251 * 1024;
const DIST_DIR = join(process.cwd(), "dist");
const DIST_ASSETS_DIR = join(DIST_DIR, "assets");

const jsAssets = readdirSync(DIST_ASSETS_DIR).filter((filename) => filename.endsWith(".js"));

if (jsAssets.length === 0) {
  throw new Error("No built JavaScript assets found in dist/assets");
}

const largestAsset = jsAssets
  .map((filename) => ({
    filename,
    gzipBytes: gzipSync(readFileSync(join(DIST_ASSETS_DIR, filename))).byteLength,
  }))
  .sort((left, right) => right.gzipBytes - left.gzipBytes)[0];

if (largestAsset.gzipBytes > MAX_GZIP_BYTES) {
  throw new Error(
    `Bundle budget exceeded: ${largestAsset.filename} gzip size ${largestAsset.gzipBytes} bytes exceeds ${MAX_GZIP_BYTES} bytes`,
  );
}

// The precache is every file the service worker stores on first visit: all five
// catalogs, the lazy chunks, icons and styles.
const precached = [...readFileSync(join(DIST_DIR, "sw.js"), "utf8").matchAll(/url:"([^"]+)"/g)].map(
  (match) => match[1],
);
const precacheGzipBytes = precached.reduce(
  (total, url) => total + gzipSync(readFileSync(join(DIST_DIR, url))).byteLength,
  0,
);

if (precached.length === 0) {
  throw new Error("No precache entries found in dist/sw.js");
}

if (precacheGzipBytes > MAX_PRECACHE_GZIP_BYTES) {
  throw new Error(
    `Bundle budget exceeded: precache gzip size ${precacheGzipBytes} bytes exceeds ${MAX_PRECACHE_GZIP_BYTES} bytes`,
  );
}

console.log(
  `Precache budget OK: ${precached.length} files, gzip size ${precacheGzipBytes} bytes within ${MAX_PRECACHE_GZIP_BYTES} bytes`,
);
console.log(
  `Bundle budget OK: ${largestAsset.filename} gzip size ${largestAsset.gzipBytes} bytes within ${MAX_GZIP_BYTES} bytes`,
);
