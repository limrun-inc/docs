import { getMDXComponents } from "@farming-labs/theme/mdx";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Callout } from "fumadocs-ui/components/callout";
import type { MDXComponents } from "mdx/types";
import docsConfig from "@/docs.config";

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return getMDXComponents(
    {
      // Mintlify → fumadocs-ui equivalents
      Accordion,
      Accordions,
      Step,
      Steps,
      Callout,
      // Mintlify's <Note> maps to an info callout
      Note: ({ children }: { children: React.ReactNode }) => (
        <Callout type="info">{children}</Callout>
      ),
      // Mintlify's <Warning> maps to a warning callout
      Warning: ({ children }: { children: React.ReactNode }) => (
        <Callout type="warn">{children}</Callout>
      ),
      // Mintlify's <CodeGroup> → just render children (fumadocs tabs handle it in MDX)
      CodeGroup: ({ children }: { children: React.ReactNode }) => (
        <div className="fd-tabs">{children}</div>
      ),
      ...components,
    },
    {
      theme: docsConfig.theme,
    },
  );
}
