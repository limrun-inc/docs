import docsConfig from "@/docs.config";
import { createNextDocsLayout, createNextDocsMetadata } from "@farming-labs/next/layout";
import { NavLinks } from "@/components/nav-links";

export const metadata = createNextDocsMetadata(docsConfig);

const DocsLayout = createNextDocsLayout(docsConfig);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavLinks />
      <DocsLayout>{children}</DocsLayout>
    </>
  );
}
