import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const port = Number(process.env.PORT || 8788);
const host = '127.0.0.1';
const html = await readFile(new URL('./dist/index.html', import.meta.url));
const server = createServer((request, response) => {
  const path = new URL(request.url, 'http://' + host).pathname;
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, {Allow: 'GET, HEAD'}).end();
    return;
  }
  if (path !== '/' && path !== '/index.html') {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  response.end(request.method === 'HEAD' ? undefined : html);
});
server.listen(port, host, () => console.log('Public demo preview at http://' + host + ':' + port));
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'Preview port is already in use. Choose PORT.' : error.message);
  process.exitCode = 1;
});
