"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { campaignOptOutEnabled, prepareCampaignLink } from "@/lib/campaign-links";

export function CampaignLinks() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const originals = useRef(new WeakMap());

  useEffect(() => {
    const optedOut = () => {
      const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
      return campaignOptOutEnabled(nav, (window as Window & { doNotTrack?: string }).doNotTrack, document.cookie);
    };
    const prepare = (link: HTMLAnchorElement) => prepareCampaignLink(link, window.location.href, optedOut(), originals.current);
    const refresh = () => document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(prepare);
    const onLink = (event: Event) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link) return;
      const next = prepare(link);
      const mouse = event as MouseEvent;
      if (event.type === "click" && !event.defaultPrevented && mouse.button === 0 && !mouse.metaKey && !mouse.ctrlKey && !mouse.shiftKey && !mouse.altKey &&
        !link.hasAttribute("download") && (!link.target || link.target === "_self") && next?.changed && next.url.origin === window.location.origin) {
        // Next links otherwise navigate using their original React href prop.
        event.preventDefault();
        router.push(next.url.pathname + next.url.search + next.url.hash);
      }
    };
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["href"] });
    refresh();
    for (const type of ["click", "auxclick", "contextmenu"]) document.addEventListener(type, onLink, true);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      observer.disconnect();
      for (const type of ["click", "auxclick", "contextmenu"]) document.removeEventListener(type, onLink, true);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [pathname, search, router]);
  return null;
}
