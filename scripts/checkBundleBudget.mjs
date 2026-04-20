import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIST_ASSETS_DIR = join(process.cwd(), "dist", "assets");
const MAX_GZIP_BYTES = 95 * 1024;

const jsAssets = readdirSync(DIST_ASSETS_DIR).filter((filename) =>
  filename.endsWith(".js"),
);

if (jsAssets.length === 0) {
  throw new Error("No built JavaScript assets found in dist/assets");
}

const largestAsset = jsAssets
  .map((filename) => {
    const buffer = readFileSync(join(DIST_ASSETS_DIR, filename));

    return {
      filename,
      gzipBytes: gzipSync(buffer).byteLength,
    };
  })
  .sort((left, right) => right.gzipBytes - left.gzipBytes)[0];

if (largestAsset.gzipBytes > MAX_GZIP_BYTES) {
  throw new Error(
    `Bundle budget exceeded: ${largestAsset.filename} gzip size ${largestAsset.gzipBytes} bytes exceeds ${MAX_GZIP_BYTES} bytes`,
  );
}

console.log(
  `Bundle budget OK: ${largestAsset.filename} gzip size ${largestAsset.gzipBytes} bytes within ${MAX_GZIP_BYTES} bytes`,
);
