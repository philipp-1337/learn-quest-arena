import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


function listDir(dir, baseDir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    const relPath = path.relative(baseDir, fullPath);
    if (item.isDirectory()) {
      console.log(relPath + '/');
      listDir(fullPath, baseDir);
    } else {
      console.log(relPath);
    }
  });
}

const srcPath = path.join(__dirname, '../src');
listDir(srcPath, srcPath);