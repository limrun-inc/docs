"use client";

import * as React from "react";
import {
  Tab,
  Tabs as FumadocsTabs,
  TabsList,
  TabsTrigger,
} from "fumadocs-ui/components/tabs";

interface CodeGroupProps {
  children: React.ReactNode;
  labels?: string[];
}

const ICONS = {
  bash: "M21.038 4.9 13.461.402A2.86 2.86 0 0 0 12 0c-.505 0-1.009.134-1.462.403L2.961 4.9C2.057 5.437 1.5 6.429 1.5 7.503v8.995c0 1.073.557 2.066 1.462 2.603l7.577 4.497A2.86 2.86 0 0 0 12 24c.505 0 1.009-.134 1.461-.402l7.577-4.497c.904-.537 1.462-1.53 1.462-2.603V7.503c0-1.074-.557-2.066-1.462-2.603Z",
  curl: "M.803 14.817a.966.966 0 1 1 1.933 0 .966.966 0 0 1-1.933 0Zm.966-7.149a.966.966 0 1 1 0 1.933.966.966 0 0 1 0-1.933Zm13.222-2.958a.966.966 0 1 1 0-1.933.966.966 0 0 1 0 1.933ZM5.39 21.223a.966.966 0 1 1 0-1.933.966.966 0 0 1 0 1.933Zm9.6-19.249c-.978 0-1.77.792-1.77 1.77 0 .208.053.402.119.588L5.039 18.558a1.77 1.77 0 1 0 2.12 1.698c0-.196-.052-.376-.11-.552l8.343-14.273a1.77 1.77 0 0 0-.401-3.457Zm7.24 2.736a.966.966 0 1 1 0-1.933.966.966 0 0 1 0 1.933Zm-9.599 16.513a.966.966 0 1 1 0-1.933.966.966 0 0 1 0 1.933Zm9.6-19.249c-.978 0-1.77.792-1.77 1.77 0 .208.052.402.118.588l-8.3 14.226a1.77 1.77 0 1 0 2.12 1.698c0-.196-.052-.376-.11-.552L22.63 5.431A1.77 1.77 0 0 0 22.23 1.974Z",
  go: "M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07H1.811Zm-1.764 1.075c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07H.047Zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082H2.875Zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 0 1 .292-.187h4.253a6.253 6.253 0 0 1-.07.947 4.983 4.983 0 0 1-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2Zm3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 0 1-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.63.07-.934.106Zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788.935-2.045 2.033-.21.912.234 1.835 1.075 2.21.643.28 1.285.244 1.905-.07.923-.48 1.425-1.228 1.484-2.233Z",
  java: "M11.915 0 11.7.215C9.515 2.4 7.47 6.39 6.046 10.483c-1.064 1.024-3.633 2.81-3.711 3.551-.093.87 1.746 2.611 1.55 3.235-.198.625-1.304 1.408-1.014 1.939.1.188.823.011 1.277-.491a13.389 13.389 0 0 0-.017 2.14C4.207 21.763 4.4 22.525 4.774 23.09c.372.563.956.911 1.667.911.397 0 .727-.114 1.024-.264.298-.149.571-.33.91-.5.68-.34 1.634-.666 3.53-.604 1.903.062 2.872.39 3.559.704.687.314 1.15.664 1.925.664.767 0 1.395-.336 1.807-.9.412-.563.631-1.33.72-2.24.06-.623.055-1.32 0-2.066.454.45 1.117.604 1.213.424.29-.53-.816-1.314-1.013-1.937-.198-.624 1.642-2.366 1.549-3.236-.08-.748-2.707-2.568-3.748-3.586C16.428 6.374 14.308 2.394 12.13.215L11.915 0Zm.175 6.038a2.95 2.95 0 0 1 2.943 2.942 2.95 2.95 0 0 1-2.943 2.943A2.95 2.95 0 0 1 9.148 8.98a2.95 2.95 0 0 1 2.942-2.942Z",
  json: "M12.043 23.968c.479-.004.953-.029 1.426-.094a11.805 11.805 0 0 0 3.146-.863 12.404 12.404 0 0 0 3.793-2.542 11.977 11.977 0 0 0 2.44-3.427 11.794 11.794 0 0 0 1.02-3.476c.149-1.16.135-2.346-.045-3.499a11.96 11.96 0 0 0-.793-2.788 11.197 11.197 0 0 0-.854-1.617c-1.168-1.837-2.861-3.314-4.81-4.3a12.835 12.835 0 0 0-2.172-.87h-.005a8.93 8.93 0 0 1 2.255 1.756c1.063 1.145 1.797 2.548 2.218 4.041.284.982.434 1.998.495 3.017.044.743.044 1.491-.047 2.229-.149 1.27-.554 2.51-1.228 3.596a7.475 7.475 0 0 1-1.903 2.084c-1.244.928-2.877 1.482-4.436 1.114a4.692 4.692 0 0 1-2.023-1.363 6.507 6.507 0 0 1-1.049-1.747 7.366 7.366 0 0 1-.494-2.54c-.03-1.273.225-2.553.854-3.67a6.43 6.43 0 0 1 2.367-2.404 5.121 5.121 0 0 0-1.441-.12 4.963 4.963 0 0 0-1.228.24c-.359.12-.704.27-1.019.45a6.146 6.146 0 0 0-1.348 1.049c-1.123 1.153-1.768 2.682-2.022 4.256-.15.973-.15 1.96-.091 2.95.105 1.395.391 2.787.945 4.062a8.518 8.518 0 0 0 1.348 2.173 8.14 8.14 0 0 0 3.132 2.23 7.934 7.934 0 0 0 2.113.54c.074.015.149.015.209.015Z",
  python: "M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05Zm-6.3 1.98-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09Zm13.09 3.95.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01Z",
  typescript: "M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125Zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a5.453 5.453 0 0 0-2.786-.821c-.3 0-.573.028-.819.086-.245.058-.453.139-.623.242-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201Zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375V9.938Z",
  yaml: "m0 .97 4.111 6.453v4.09h2.638v-4.09L11.053.969H8.214L5.58 5.125 2.965.969H0Zm12.093.024-4.47 10.544h2.114l.97-2.345h4.775l.804 2.345h2.26L14.255.994h-2.162Zm1.133 2.225 1.463 3.87h-3.096l1.633-3.87Zm3.06 9.475v10.29H24v-2.199h-5.454v-8.091h-2.26Zm-12.175.002v10.335h2.217v-7.129l2.32 4.792h1.746l2.4-4.96v7.295h2.127V12.696h-2.904L9.44 17.37l-2.455-4.674H4.111Z",
} as const;

function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

function normalizeLabel(label: string): string {
  const key = label.toLowerCase();
  if (key === "ts" || key === "tsx" || key.includes("typescript")) return "TypeScript";
  if (key === "js" || key === "jsx" || key.includes("javascript")) return "JavaScript";
  if (key === "py" || key.includes("python")) return "Python";
  if (key === "go" || key.includes("golang")) return "Go";
  if (key.includes("java")) return "Java";
  if (key.includes("curl")) return "cURL";
  if (key.includes("bash") || key.includes("shell") || key.includes("cli")) return "CLI";
  if (key.includes("json")) return "JSON";
  if (key.includes("yaml") || key.includes("yml")) return "YAML";
  return label;
}

function extractLanguage(node: React.ReactNode): string | null {
  if (!React.isValidElement(node)) return null;

  const props = (node.props ?? {}) as Record<string, unknown>;
  const className = props.className;
  if (typeof className === "string") {
    const match = /language-([\w+-]+)/.exec(className);
    if (match) return match[1];
  }

  const dataLanguage = props["data-language"] ?? props.lang;
  if (typeof dataLanguage === "string" && dataLanguage.length > 0) {
    return dataLanguage;
  }

  const children = props.children as React.ReactNode;
  if (Array.isArray(children)) {
    for (const child of children) {
      const language = extractLanguage(child);
      if (language) return language;
    }
    return null;
  }

  return extractLanguage(children);
}

function inferLabel(child: React.ReactElement, index: number): string {
  const props = (child.props ?? {}) as Record<string, unknown>;
  const explicit = props.title ?? props["data-title"];
  if (typeof explicit === "string" && explicit.length > 0) {
    return normalizeLabel(explicit);
  }

  const language = extractLanguage(child);
  if (language) return normalizeLabel(language);

  const text = extractText(child).trim();
  if (/^(curl|http)\s/i.test(text)) return "cURL";
  if (/^(lim|npm|pnpm|yarn|export|npx|gh)\s/im.test(text)) return "CLI";
  if (/^(name:|on:|jobs:|steps:|uses:|run:)/m.test(text)) return "YAML";
  if (/^\s*[{[]/.test(text)) return "JSON";
  if (text.includes("from limrun_api") || text.includes("print(")) return "Python";
  if (text.includes("limrun.NewClient") || text.includes(":=")) return "Go";
  if (text.includes("LimrunClient") || text.includes(".builder()")) return "Java";
  if (text.includes("@limrun/api") || text.includes("const ") || text.includes("await ")) return "TypeScript";

  return index === 0 ? "Code" : `Code ${index + 1}`;
}

function CodeTabIcon({ label }: { label: string }) {
  const key = normalizeLabel(label).toLowerCase();
  const iconKey: keyof typeof ICONS | null =
    key.includes("typescript") ? "typescript"
    : key.includes("javascript") ? "typescript"
    : key.includes("python") ? "python"
    : key === "go" ? "go"
    : key.includes("java") ? "java"
    : key.includes("curl") ? "curl"
    : key.includes("json") ? "json"
    : key.includes("yaml") ? "yaml"
    : key.includes("cli") ? "bash"
    : null;

  if (!iconKey) return null;

  return (
    <svg aria-hidden="true" className="docs-code-tab-icon" viewBox="0 0 24 24">
      <path d={ICONS[iconKey]} fill="currentColor" />
    </svg>
  );
}

export function CodeGroup({ children, labels }: CodeGroupProps) {
  const validChildren = React.Children.toArray(children).filter(
    React.isValidElement,
  ) as React.ReactElement[];

  if (validChildren.length === 0) return null;
  if (validChildren.length === 1) return <>{children}</>;

  const seen = new Map<string, number>();
  const tabs = validChildren.map((child, index) => {
    const explicitLabel = labels?.[index];
    const label =
      typeof explicitLabel === "string" && explicitLabel.length > 0
        ? normalizeLabel(explicitLabel)
        : inferLabel(child, index);
    const n = (seen.get(label) ?? 0) + 1;
    seen.set(label, n);
    const displayLabel = n === 1 ? label : `${label} ${n}`;

    return {
      child,
      label: displayLabel,
      value: `${displayLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
    };
  });

  return (
    <FumadocsTabs defaultValue={tabs[0].value} className="docs-code-tabs">
      <TabsList>
        {tabs.map(({ label, value }) => (
          <TabsTrigger key={value} value={value}>
            <CodeTabIcon label={label} />
            <span>{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ child, value }) => (
        <Tab key={value} value={value}>
          {child}
        </Tab>
      ))}
    </FumadocsTabs>
  );
}
