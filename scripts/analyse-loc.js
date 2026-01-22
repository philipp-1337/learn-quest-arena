import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Nutze das aktuelle Arbeitsverzeichnis als Basis (Projekt-Root)
const SRC_DIR = path.join(process.cwd(), "src");
const extensions = [".ts", ".tsx"];

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, fileList);
    } else if (extensions.includes(path.extname(file))) {
      const content = fs.readFileSync(fullPath, "utf8");
      const lines = content.split("\n").length;
      fileList.push({ file: fullPath, lines });
    }
  }

  return fileList;
}

const results = walk(SRC_DIR)
  .sort((a, b) => b.lines - a.lines)
  .slice(0, 3);

console.log("Top 3 größte TS/TSX Dateien:");
results.forEach((r, i) => {
  console.log(`${i + 1}. ${r.file} – ${r.lines} Zeilen`);
});
