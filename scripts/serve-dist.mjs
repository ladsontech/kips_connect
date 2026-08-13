import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const host = '127.0.0.1';
const startPort = Number(process.env.PORT || 4173);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
]);

if (!existsSync(root)) {
  console.error('dist/ does not exist. Run npm run build first.');
  process.exit(1);
}

function resolveRequestPath(url) {
  const cleanUrl = new URL(url ?? '/', `http://${host}`).pathname;
  const normalized = normalize(decodeURIComponent(cleanUrl)).replace(/^(\.\.[/\\])+/, '');
  const requested = resolve(root, `.${normalized}`);

  if (!requested.startsWith(root)) {
    return join(root, 'index.html');
  }

  if (existsSync(requested) && statSync(requested).isFile()) {
    return requested;
  }

  if (existsSync(requested) && statSync(requested).isDirectory()) {
    const indexPath = join(requested, 'index.html');
    if (existsSync(indexPath)) {
      return indexPath;
    }
  }

  return join(root, 'index.html');
}

function listen(port) {
  const server = createServer((request, response) => {
    const filePath = resolveRequestPath(request.url);
    const contentType = mimeTypes.get(extname(filePath)) ?? 'application/octet-stream';

    response.setHeader('Content-Type', contentType);
    response.setHeader('Cache-Control', 'no-cache');
    createReadStream(filePath).pipe(response);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      listen(port + 1);
      return;
    }

    console.error(error);
    process.exit(1);
  });

  server.listen(port, host, () => {
    console.log(`Kibs Connect preview running at http://${host}:${port}/`);
  });
}

listen(startPort);
