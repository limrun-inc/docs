import assert from "node:assert/strict";
import { test } from "node:test";
import { campaignLinkUrl, campaignOptOutEnabled, prepareCampaignLink } from "./campaign-links.ts";

const entry = "https://docs.limrun.com/docs/quickstart?utm_source=google&utm_medium=cpc&utm_campaign=pricing-launch&utm_content=quickstart&utm_id=24287057029&gclid=private-click&email=private@example.com&token=secret";
const expected = {
  utm_source: "google", utm_medium: "cpc", utm_campaign: "pricing-launch", utm_content: "quickstart", utm_id: "24287057029",
};
function labels(href) { return Object.fromEntries([...new URL(href).searchParams].filter(([key]) => key.startsWith("utm_"))); }
function anchor(href) { return { getAttribute: () => href, setAttribute: (_key, next) => { href = next; } }; }

test("docs entry keeps its bounded labels through another docs page and Console", () => {
  const docs = campaignLinkUrl("/docs/ios/build-with-xcode?tab=typescript#build", entry, false);
  assert.deepEqual(labels(docs), expected);
  assert.equal(new URL(docs).searchParams.get("tab"), "typescript");
  assert.equal(new URL(docs).hash, "#build");
  const console = campaignLinkUrl("https://console.limrun.com/stream?os=ios#preview", docs, false);
  assert.deepEqual(labels(console), expected);
  assert.equal(new URL(console).searchParams.get("os"), "ios");
  assert.equal(new URL(console).hash, "#preview");
  for (const href of [docs, console]) assert.doesNotMatch(href, /private|email|token|gclid|li_fat_id|twclid|rdt_cid/);
});

test("labels never leave the exact docs and Console origins or enter API paths", () => {
  for (const href of ["https://example.com", "https://console.limrun.com.evil.test", "http://console.limrun.com", "/api/docs", "/mcp", "/docs-other", "mailto:someone@example.com", "#build", ""]) {
    assert.equal(campaignLinkUrl(href, entry, false), href);
  }
  assert.equal(campaignLinkUrl("https://console.limrun.com", entry.replace("docs.limrun.com", "other.example"), false), "https://console.limrun.com");
});

test("complete destination campaigns stay separate and incomplete tuples do not borrow fields", () => {
  const own = "https://console.limrun.com?utm_source=linkedin&utm_medium=paid_social&utm_campaign=other&utm_id=912454416";
  assert.deepEqual(labels(campaignLinkUrl(own, entry, false)), { utm_source:"linkedin", utm_medium:"paid_social", utm_campaign:"other", utm_id:"912454416" });
  assert.deepEqual(labels(campaignLinkUrl("https://console.limrun.com?utm_source=reddit", entry, false)), {});
  assert.deepEqual(labels(campaignLinkUrl("https://console.limrun.com", "https://docs.limrun.com/docs?utm_id=123&utm_source=google", false)), {});
});

test("malformed labels and unexpanded ID macros are dropped", () => {
  for (const value of ["{{AD_SET_ID}}", "private@example.com", "x".repeat(101), "x y", "x\n"]) {
    const url = new URL(entry);
    url.searchParams.set("utm_id", value);
    assert.equal(new URL(campaignLinkUrl("https://console.limrun.com", url.href, false)).searchParams.has("utm_id"), false);
  }
  const invalid = new URL(entry);
  invalid.searchParams.set("utm_source", "private@example.com");
  assert.deepEqual(labels(campaignLinkUrl("https://console.limrun.com", invalid.href, false)), {});
});

test("each existing privacy signal removes current and explicit destination campaign labels", () => {
  for (const signal of [ [{ doNotTrack:"1" }, undefined, ""], [{}, "1", ""], [{ globalPrivacyControl:true }, undefined, ""], [{}, undefined, "theme=light; limrun_privacy_optout=1"] ]) {
    const stop = campaignOptOutEnabled(...signal);
    assert.equal(stop, true);
    assert.deepEqual(labels(campaignLinkUrl("https://console.limrun.com", entry, stop)), {});
    assert.deepEqual(labels(campaignLinkUrl("/docs/ios/build-with-xcode?utm_source=old&utm_medium=cpc&utm_campaign=old&utm_id=12#build", entry, stop)), {});
  }
  assert.equal(campaignOptOutEnabled({ doNotTrack:"0", globalPrivacyControl:false }, undefined, "theme=light; limrun_privacy_optout=0"), false);
});

test("decorated DOM links update to the new source and forget it on an untagged navigation", () => {
  const link = anchor("/docs/android/build-with-gradle");
  const originals = new WeakMap();
  assert.equal(prepareCampaignLink(link, entry, false, originals).changed, true);
  const newer = "https://docs.limrun.com/docs?utm_source=linkedin&utm_medium=paid_social&utm_campaign=pricing-launch&utm_id=912454416";
  assert.equal(prepareCampaignLink(link, newer, false, originals).changed, true);
  assert.deepEqual(labels(link.getAttribute("href")), { utm_source:"linkedin", utm_medium:"paid_social", utm_campaign:"pricing-launch", utm_id:"912454416" });
  prepareCampaignLink(link, "https://docs.limrun.com/docs/quickstart", false, originals);
  assert.deepEqual(labels(link.getAttribute("href")), {});
});

test("privacy changes clear decorated links before use without losing their original destination", () => {
  const link = anchor("https://console.limrun.com/stream?os=android#preview");
  const originals = new WeakMap();
  prepareCampaignLink(link, entry, false, originals);
  prepareCampaignLink(link, entry, true, originals);
  const cleared = new URL(link.getAttribute("href"));
  assert.deepEqual(labels(cleared.href), {});
  assert.equal(cleared.searchParams.get("os"), "android");
  assert.equal(cleared.hash, "#preview");
});

test("a framework-updated href replaces the saved original rather than reusing old destinations", () => {
  const link = anchor("https://console.limrun.com/stream?os=ios");
  const originals = new WeakMap();
  prepareCampaignLink(link, entry, false, originals);
  link.setAttribute("href", "https://console.limrun.com/settings?utm_source=reddit&utm_medium=paid_social&utm_campaign=another");
  prepareCampaignLink(link, entry, false, originals);
  assert.equal(new URL(link.getAttribute("href")).pathname, "/settings");
  assert.deepEqual(labels(link.getAttribute("href")), { utm_source:"reddit", utm_medium:"paid_social", utm_campaign:"another" });
});

test("untouched relative API, hash and external links do not trigger a router handoff", () => {
  for (const href of ["/api/docs?query=ios", "#build", "https://example.com"]) {
    const link = anchor(href);
    assert.equal(prepareCampaignLink(link, entry, false, new WeakMap()).changed, false);
    assert.equal(link.getAttribute("href"), href);
  }
});
