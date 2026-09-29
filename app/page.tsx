// The site root. Browsers move on to /docs through the meta refresh; agents
// and crawlers that do not follow it still get a readable summary and links
// instead of an empty redirect. Markdown requests never reach this page:
// proxy.ts rewrites them to the Introduction as Markdown.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Limrun documentation",
  alternates: { canonical: "https://docs.limrun.com/docs", types: { "text/markdown": "/docs.md" } },
};

const entryPoints = [
  { href: "/docs", label: "Introduction", text: "what Limrun runs and how the pieces fit together" },
  { href: "/docs/quickstart", label: "Quickstart", text: "build a sample iOS app on a cloud Mac and drive it on a simulator" },
  { href: "/docs/concepts", label: "Concepts", text: "instances, credentials, lifecycle, labels, placement, and assets" },
  { href: "/docs/agents/cli", label: "Set up a coding agent", text: "install the lim CLI and the Limrun skills where your agent runs" },
  { href: "/docs/reference/cli", label: "CLI reference", text: "every lim command, shared flag, and environment variable" },
  { href: "/llms.txt", label: "llms.txt", text: "every page with a one-line description, for agents" },
];

export default function Home() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/docs" />
      <main style={{ maxWidth: 720, margin: "4rem auto", padding: "0 1.5rem", lineHeight: 1.6 }}>
        <h1>Limrun documentation</h1>
        <p>
          Limrun runs iOS simulators, Android emulators, and Xcode and Gradle builds in the cloud. Any
          process that can reach an HTTPS endpoint can build a mobile app, run it, and drive it: a
          coding agent on a Linux VM, a CI runner without macOS minutes, or a backend that hands live
          devices to its own users.
        </p>
        <h2>Start here</h2>
        <ul>
          {entryPoints.map((entry) => (
            <li key={entry.href}>
              <a href={entry.href}>{entry.label}</a>: {entry.text}.
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
