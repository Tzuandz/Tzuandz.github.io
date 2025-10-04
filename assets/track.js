(async () => {
  const out = { ts: Date.now(), href: location.href };
  try {
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
      const e = await navigator.userAgentData.getHighEntropyValues(['brands','fullVersionList','platform','platformVersion','model','architecture','bitness','mobile']);
      Object.assign(out, e);
      if (navigator.userAgentData.brands) out.brands = navigator.userAgentData.brands;
    }
  } catch {}
  if (!('fullVersionList' in out)) out.ua = navigator.userAgent || '';
  const blob = new Blob([JSON.stringify(out)], { type: 'application/json' });
  if (!navigator.sendBeacon('/api/track', blob)) {
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(out), keepalive: true });
  }
})();