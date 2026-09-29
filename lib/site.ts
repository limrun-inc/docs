// Single source for the public site identity, consumed by docs.config.tsx and
// the .well-known route handlers.
export const SITE_URL = "https://docs.limrun.com";
export const SITE_NAME = "Limrun docs";
export const SITE_DESCRIPTION =
  "Cloud infrastructure for mobile development: iOS simulators, Android emulators, and Xcode builds in the cloud, controlled through one CLI or SDK.";
export const MCP_NAME = SITE_NAME;
export const MCP_VERSION = "1.0.0";

export const DOC_SECTIONS = [
  { title: "Agents", slug: "agents" },
  { title: "iOS", slug: "ios" },
  { title: "Android", slug: "android" },
  { title: "Testing", slug: "testing" },
  { title: "CI", slug: "ci" },
  { title: "Guides", slug: "guides" },
  { title: "Platform", slug: "platform" },
  { title: "Reference", slug: "reference" },
];
