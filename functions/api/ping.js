export async function onRequestGet() {
  return new Response('ok', { headers: { 'Cache-Control': 'no-store' } });
}
