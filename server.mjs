import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { basename, dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('.', import.meta.url));
const livesRoot = basename(appRoot.replace(/[\\/]$/, '')).toLowerCase() === 'live-console'
  ? dirname(appRoot.replace(/[\\/]$/, ''))
  : appRoot;
const port = Number(process.env.PORT) || 8787;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4'
};

function isInside(parent, child) {
  const relative = child.slice(resolve(parent).length);
  return child === resolve(parent) || (relative.startsWith(sep) && !relative.includes(`..${sep}`));
}

function localAsset(reference = '') {
  const portable = reference.replace(/\\/g, '/');
  const marker = '/lives/';
  const markerIndex = portable.toLowerCase().lastIndexOf(marker);
  const relative = markerIndex >= 0 ? portable.slice(markerIndex + marker.length) : portable.replace(/^\.?\/+/, '');
  const candidate = resolve(livesRoot, relative.split('/').join(sep));
  const allowed = ['musicas', 'letras', 'repertorios'].some(folder => isInside(join(livesRoot, folder), candidate));
  if (!allowed) throw new Error('Arquivo fora das pastas permitidas');
  return candidate;
}

function openBrowser(url) {
  const command = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.on('error', () => {});
  child.unref();
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://localhost:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === '/local') {
      const file = localAsset(url.searchParams.get('path') || '');
      const body = await readFile(file);
      response.writeHead(200, {
        'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      response.end(body);
      return;
    }
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = normalize(join(appRoot, relative));
    if (!isInside(appRoot, resolve(file))) throw new Error('Caminho inválido');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Arquivo não encontrado.');
  }
});

server.listen(port, '127.0.0.1', () => {
  const url = `http://localhost:${port}`;
  console.log(`Live Console aberto em ${url}`);
  console.log(`Pasta de lives: ${livesRoot}`);
  console.log('Mantenha esta janela aberta durante a live. Pressione Ctrl+C para encerrar.');
  if (process.env.NO_OPEN !== '1') openBrowser(url);
});
