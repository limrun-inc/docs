import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "@farming-labs/theme";
import docsConfig from "@/docs.config";
import "@farming-labs/next/api-reference.css";
import "./global.css";
import { webMcpScript } from "@/components/webmcp-script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "lim.run docs",
    template: docsConfig.metadata?.titleTemplate ?? "%s – lim.run",
  },
  description: docsConfig.metadata?.description,
};

// Runs before React hydration to set the correct theme class immediately,
// preventing a flash of the wrong theme on page load.
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="ai-catalog" href="/.well-known/ai-catalog.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: intentional theme init */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <RootProvider theme={{ defaultTheme: "light", disableTransitionOnChange: false }}>
          {children}
        </RootProvider>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static WebMCP registration, see webmcp-script.ts */}
        <script type="module" dangerouslySetInnerHTML={{ __html: webMcpScript }} />
      </body>
    </html>
  );
}
