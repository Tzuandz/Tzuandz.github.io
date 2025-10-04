export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const mode = request.headers.get('Sec-Fetch-Mode') || '';
  const dest = request.headers.get('Sec-Fetch-Dest') || '';
  const isNavigate = dest === 'document' || mode === 'navigate';

  const allowPages = new Set([
    '/',
    '/index.html',
    '/favicon.ico'
  ]);

  if (isNavigate && !allowPages.has(url.pathname)) {
    return new Response('Not Found', { status: 404 });
  }

  return env.ASSETS.fetch(request);
}