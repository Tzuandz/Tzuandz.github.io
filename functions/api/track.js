export async function onRequestPost({ request, env }) {
  const h = request.headers;
  let p = {};
  try { p = await request.json(); } catch {}
  const vnDate = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
  const key = `visits:${vnDate}`;
  const cur = parseInt((await env.VISITS_KV.get(key)) || '0', 10);
  const next = cur + 1;
  await env.VISITS_KV.put(key, String(next), { expirationTtl: 60 * 60 * 24 * 40 });

  const model = p.model ?? h.get('sec-ch-ua-model') ?? null;
  const platform = p.platform ?? h.get('sec-ch-ua-platform') ?? null;
  const platformVersion = p.platformVersion ?? h.get('sec-ch-ua-platform-version') ?? null;
  const brandsArr = Array.isArray(p.fullVersionList) ? p.fullVersionList.map(x => `${x.brand} ${x.version}`) : null;
  const brandsHdr = h.get('sec-ch-ua-full-version-list') || h.get('sec-ch-ua') || null;
  const brands = brandsArr ? brandsArr.join(', ') : brandsHdr;
  const arch = p.architecture ?? h.get('sec-ch-ua-arch') ?? null;
  const bitness = p.bitness ?? h.get('sec-ch-ua-bitness') ?? null;
  const mobile = typeof p.mobile === 'boolean' ? String(p.mobile) : (h.get('sec-ch-ua-mobile') ?? null);
  const ua = p.ua ?? h.get('user-agent') ?? null;
  const href = p.href ?? null;

  const lines = [
    `visit #${next} ${vnDate}`,
    model ? `model=${model}` : null,
    platform ? `platform=${platform}` : null,
    platformVersion ? `platformVersion=${platformVersion}` : null,
    brands ? `brands=${brands}` : null,
    arch ? `arch=${arch}` : null,
    bitness ? `bitness=${bitness}` : null,
    mobile ? `mobile=${mobile}` : null,
    href ? `href=${href}` : null,
    ua ? `ua=${ua.slice(0, 380)}` : null
  ].filter(Boolean).join('\n');

  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: '```txt\n' + lines + '\n```' })
  });

  return new Response(null, { status: 204, headers: {
    'Accept-CH': 'Sec-CH-UA, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Model, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile',
    'Critical-CH': 'Sec-CH-UA, Sec-CH-UA-Platform, Sec-CH-UA-Model',
    'Permissions-Policy': 'ch-ua=*, ch-ua-arch=*, ch-ua-bitness=*, ch-ua-full-version-list=*, ch-ua-mobile=*, ch-ua-model=*, ch-ua-platform=*, ch-ua-platform-version=*',
    'Vary': 'Sec-CH-UA, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Model, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Mobile'
  }});
}