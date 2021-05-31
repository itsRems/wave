import { promises as fs } from 'fs';
import { join } from 'path';

export async function controllers (path: string) {
  const folders = await fs.readdir(path);
  for (const file of folders) {
    let dirPath = join(path, file);
    let isDirectory = (await fs.stat(dirPath)).isDirectory();
    if (isDirectory) {
      const _import = require(dirPath);
      if (_import) {
        const keys = Object.keys(_import);
        const name = keys[0];
        if (name) {
          const controller = _import[name];
          console.log({ controller });
        }
      }
    }
  }
}