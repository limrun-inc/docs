"use client";

import * as React from "react";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";

interface CodeGroupProps {
  children: React.ReactNode;
}

/**
 * Extract a tab label from a single child of a `<CodeGroup>`.
 *
 * In this framework code fences with `title="X"` (or any meta key like
 * `tab="X"`) end up on the rendered element as a `title` prop. We
 * also walk one level into the `<code>` child and look for a
 * `language-foo` class as a fallback.
 */
function extractTitle(child: React.ReactElement, index: number): string {
  const props = (child.props ?? {}) as Record<string, unknown>;

  if (typeof props.title === "string" && props.title.length > 0) {
    return props.title;
  }
  if (typeof props["data-title"] === "string" && (props["data-title"] as string).length > 0) {
    return props["data-title"] as string;
  }

  // Walk one level: <pre><code className="language-X">
  const inner = props.children as React.ReactNode;
  if (React.isValidElement(inner)) {
    const innerProps = (inner.props ?? {}) as Record<string, unknown>;
    if (typeof innerProps.title === "string" && innerProps.title.length > 0) {
      return innerProps.title;
    }
    const className = innerProps.className as string | undefined;
    if (className) {
      const langMatch = /language-([\w+-]+)/.exec(className);
      if (langMatch) {
        return langMatch[1];
      }
    }
  }

  return `Tab ${index + 1}`;
}

export function CodeGroup({ children }: CodeGroupProps) {
  const validChildren = React.Children.toArray(children).filter(
    React.isValidElement,
  ) as React.ReactElement[];

  if (validChildren.length === 0) {
    return null;
  }

  const items = validChildren.map((child, i) => extractTitle(child, i));

  // Disambiguate any duplicate labels so Tabs receives unique values.
  const seen = new Map<string, number>();
  const uniqueItems = items.map((label) => {
    const n = (seen.get(label) ?? 0) + 1;
    seen.set(label, n);
    return n === 1 ? label : `${label} ${n}`;
  });

  return (
    <Tabs items={uniqueItems}>
      {validChildren.map((child, i) => (
        <Tab key={i} value={uniqueItems[i]}>
          {child}
        </Tab>
      ))}
    </Tabs>
  );
}
