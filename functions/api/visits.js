export async function onRequestGet({ env }) {
  const vnDate = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
  const key = `visits:${vnDate}`;
  const count = parseInt((await env.VISITS_KV.get(key)) || '0', 10);
  return new Response(JSON.stringify({ date: vnDate, count }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}