import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { RootProvider } from "@farming-labs/theme";
import docsConfig from "@/docs.config";
import "@farming-labs/next/api-reference.css";
import "./global.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMonoDocs = JetBrains_Mono({
  variable: "--fd-font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMonoMono = JetBrains_Mono({
  variable: "--fd-font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
    if (t === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${jetbrainsMonoDocs.variable} ${jetbrainsMonoMono.variable}`}
        suppressHydrationWarning
      >
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: intentional theme init */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <RootProvider theme={{ defaultTheme: "dark", disableTransitionOnChange: false }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
