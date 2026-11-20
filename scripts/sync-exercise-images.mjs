/**
 * Gera src/lib/content/exercise-images.json com as imagens que EXISTEM em public/images/exercicios.
 * Roda automaticamente antes do build (prebuild) e do dev (predev).
 * Aceita os nomes definidos em exercise-image-files.json ou "<slug-do-exercicio>.png|webp|jpg".
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const dir = "public/images/exercicios";
const named = JSON.parse(readFileSync("src/lib/content/exercise-image-files.json", "utf8"));
const files = existsSync(dir) ? readdirSync(dir) : [];
const out = {};
for (const [slug, file] of Object.entries(named)) if (files.includes(file)) out[slug] = `/images/exercicios/${file}`;
for (const f of files) {
  const m = /^([a-z0-9-]+)\.(png|webp|jpe?g)$/.exec(f);
  if (m && !out[m[1]] && !Object.values(named).includes(f)) out[m[1]] = `/images/exercicios/${f}`;
}
writeFileSync("src/lib/content/exercise-images.json", JSON.stringify(out, null, 2) + "\n");
console.log(`[imagens] ${Object.keys(out).length} imagem(ns) de exercício encontrada(s).`);
