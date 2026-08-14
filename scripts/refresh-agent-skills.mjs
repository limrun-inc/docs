// Mirrors the published Limrun skills from github.com/limrun-inc/skills into
// public/.well-known/agent-skills/ and regenerates index.json per the Agent
// Skills Discovery RFC v0.2.0. Run `pnpm refresh-agent-skills` and commit the
// outputs; do not edit the mirrored files by hand.

import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = "limrun-inc/skills";
const BRANCH = "main";
const SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";
const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  ".well-known",
  "agent-skills",
);

async function fetchOk(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`GET ${url} returned ${res.status}`);
  return res;
}

async function fetchJson(url) {
  return (await fetchOk(url, { headers: { accept: "application/vnd.github+json" } })).json();
}

function frontmatterDescription(skillMd, name) {
  const frontmatter = skillMd.match(/^---\n([\s\S]*?)\n---/)?.[1];
  const raw = frontmatter?.match(/^description:\s*(.+)$/m)?.[1].trim();
  if (!raw) throw new Error(`${name}/SKILL.md has no frontmatter description`);
  return raw.replace(/^["']|["']$/g, "");
}

const commit = (await fetchJson(`https://api.github.com/repos/${REPO}/commits/${BRANCH}`)).sha;
const catalog = await (
  await fetchOk(`https://raw.githubusercontent.com/${REPO}/${commit}/catalog.json`)
).json();
const tree = await fetchJson(
  `https://api.github.com/repos/${REPO}/git/trees/${commit}?recursive=1`,
);

await rm(OUT_DIR, { recursive: true, force: true });

const skills = [];
for (const { name } of catalog.skills) {
  const files = tree.tree.filter(
    (entry) => entry.type === "blob" && entry.path.startsWith(`skills/${name}/`),
  );
  if (!files.some((file) => file.path === `skills/${name}/SKILL.md`)) {
    throw new Error(`catalog lists ${name} but skills/${name}/SKILL.md is missing`);
  }

  let digest;
  let description;
  for (const file of files) {
    const relative = file.path.slice(`skills/${name}/`.length);
    const bytes = Buffer.from(
      await (
        await fetchOk(`https://raw.githubusercontent.com/${REPO}/${commit}/${file.path}`)
      ).arrayBuffer(),
    );
    const target = join(OUT_DIR, name, relative);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes);
    if (relative === "SKILL.md") {
      digest = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
      description = frontmatterDescription(bytes.toString("utf8"), name);
    }
  }

  skills.push({
    name,
    type: "skill-md",
    description,
    url: `/.well-known/agent-skills/${name}/SKILL.md`,
    digest,
  });
}

const index = {
  $schema: SCHEMA,
  // Unrecognized fields are ignored by spec-compliant clients; this records provenance.
  source: { repository: `https://github.com/${REPO}`, commit },
  skills,
};
await writeFile(join(OUT_DIR, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
console.log(`Mirrored ${skills.length} skills from ${REPO}@${commit.slice(0, 12)}`);
