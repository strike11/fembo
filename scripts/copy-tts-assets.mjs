import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ortSrc = join(root, "node_modules", "onnxruntime-web", "dist");
const ortDest = join(root, "public", "ort");

mkdirSync(ortDest, { recursive: true });

const names = existsSync(ortSrc)
  ? readdirSync(ortSrc).filter((name) => name.startsWith("ort-wasm-simd-threaded"))
  : [];

for (const name of names) {
  copyFileSync(join(ortSrc, name), join(ortDest, name));
}

console.log(`Copied ${names.length} ONNX Runtime WASM files to public/ort`);
