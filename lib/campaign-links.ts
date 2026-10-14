const fields = ["source", "medium", "campaign", "content", "id"] as const;
const docsOrigin = "https://docs.limrun.com";

export function campaignOptOutEnabled(nav: { doNotTrack?: string | null; globalPrivacyControl?: boolean }, windowDoNotTrack: string | undefined, cookie: string): boolean {
  return nav.doNotTrack === "1" || windowDoNotTrack === "1" || nav.globalPrivacyControl === true ||
    cookie.split("; ").includes("limrun_privacy_optout=1");
}

function campaign(query: URLSearchParams): URLSearchParams | undefined {
  const labels = new URLSearchParams();
  for (const field of fields) {
    const key = `utm_${field}`;
    const value = query.get(key);
    if (value && /^[a-z0-9._-]{1,100}$/i.test(value)) labels.set(key, value);
  }
  return ["source", "medium", "campaign"].every((field) => labels.has(`utm_${field}`)) ? labels : undefined;
}

// Ordinary campaign labels only. Never copy the source URL, identity or click IDs.
export function campaignLinkUrl(href: string, currentHref: string, optedOut: boolean): string {
  if (!href || href.startsWith("#")) return href;
  let current: URL, target: URL;
  try { current = new URL(currentHref); target = new URL(href, current); } catch { return href; }
  const docsPage = target.origin === docsOrigin && (target.pathname === "/" || target.pathname === "/docs" || target.pathname.startsWith("/docs/"));
  if (current.origin !== docsOrigin || (!docsPage && target.origin !== "https://console.limrun.com")) return href;
  // A deliberately tagged destination owns its complete tuple; do not mix campaigns.
  const tagged = fields.some((field) => target.searchParams.has(`utm_${field}`));
  const labels = tagged ? campaign(target.searchParams) : campaign(current.searchParams);
  for (const field of fields) target.searchParams.delete(`utm_${field}`);
  if (!optedOut && labels) labels.forEach((value, key) => target.searchParams.set(key, value));
  return target.href;
}

type OriginalLink = { original: string; written: string };

// Keep the original DOM link so an earlier decoration cannot become a later source.
export function prepareCampaignLink(link: HTMLAnchorElement, currentHref: string, optedOut: boolean, originals: WeakMap<HTMLAnchorElement, OriginalLink>) {
  const href = link.getAttribute("href");
  if (href === null) return;
  const previous = originals.get(link);
  const original = previous?.written === href ? previous.original : href;
  const next = campaignLinkUrl(original, currentHref, optedOut);
  originals.set(link, { original, written: next });
  if (next !== href) link.setAttribute("href", next);
  try {
    const url = new URL(next, currentHref);
    return { url, changed: url.href !== new URL(original, currentHref).href };
  } catch { return; }
}
