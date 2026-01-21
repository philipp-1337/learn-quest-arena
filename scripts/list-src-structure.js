import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function listDir(dir, indent = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach(item => {
    if (item.isDirectory()) {
      console.log(`${indent}- ${item.name}/`);
      listDir(path.join(dir, item.name), indent + '  ');
    } else {
      console.log(`${indent}- ${item.name}`);
    }
  });
}

const srcPath = path.join(__dirname, '../src');
listDir(srcPath);