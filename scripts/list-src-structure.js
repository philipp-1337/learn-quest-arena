import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));



function listDirSorted(dir, baseDir) {
  const folders = [];
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    const relPath = path.relative(baseDir, fullPath);
    if (item.isDirectory()) {
      folders.push(relPath + '/');
    } else {
      files.push(relPath);
    }
  });
  // Erst Ordner ausgeben und rekursiv aufrufen
  folders.forEach(folder => {
    console.log(folder);
    listDirSorted(path.join(baseDir, folder), baseDir);
  });
  // Dann Dateien ausgeben
  files.forEach(file => {
    console.log(file);
  });
}

const srcPath = path.join(__dirname, '../src');
listDirSorted(srcPath, srcPath);