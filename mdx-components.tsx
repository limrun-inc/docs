import { getMDXComponents } from "@farming-labs/theme/mdx";
import { Accordion as FumadocsAccordion, Accordions } from "fumadocs-ui/components/accordion";
import { Cards } from "fumadocs-ui/components/card";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Callout } from "fumadocs-ui/components/callout";
import { Tab as FumadocsTab, Tabs as FumadocsTabs } from "fumadocs-ui/components/tabs";
import { Children, isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import docsConfig from "@/docs.config";
import { CodeGroup } from "@/components/code-group";

// Pages are written with Mintlify component names so scripts/build-docs7.mjs
// can publish them unchanged; this maps those names onto fumadocs-ui.

function childProps<T>(children: ReactNode): T[] {
  return Children.toArray(children)
    .filter(isValidElement)
    .map((child) => child.props as T);
}

function Tabs({ children }: { children: ReactNode }) {
  const items = childProps<{ title: string }>(children).map((tab) => tab.title);
  return <FumadocsTabs items={items}>{children}</FumadocsTabs>;
}

function Tab({ title, children }: { title: string; children: ReactNode }) {
  return <FumadocsTab value={title}>{children}</FumadocsTab>;
}

function AccordionGroup({ children }: { children: ReactNode }) {
  const open = childProps<{ title: string; defaultOpen?: boolean }>(children)
    .filter((item) => item.defaultOpen)
    .map((item) => item.title);
  return (
    <Accordions type="multiple" defaultValue={open}>
      {children}
    </Accordions>
  );
}

function Accordion({
  defaultOpen: _defaultOpen,
  ...props
}: ComponentProps<typeof FumadocsAccordion> & { defaultOpen?: boolean }) {
  return <FumadocsAccordion {...props} />;
}

function Columns({ children }: { cols?: number; children: ReactNode }) {
  return <Cards>{children}</Cards>;
}

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return getMDXComponents(
    {
      Accordion,
      AccordionGroup,
      Columns,
      Step,
      Steps,
      Tab,
      Tabs,
      Note: ({ children }: { children: ReactNode }) => <Callout type="info">{children}</Callout>,
      Warning: ({ children }: { children: ReactNode }) => (
        <Callout type="warn">{children}</Callout>
      ),
      // Each child fence renders as a tab, labelled by `labels` or the fence title.
      CodeGroup,
      Frame: ({ children }: { children: ReactNode }) => (
        <div className="docs-frame">{children}</div>
      ),
      ...components,
    },
    {
      theme: docsConfig.theme,
    },
  );
}
