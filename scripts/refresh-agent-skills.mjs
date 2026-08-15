// Mirrors the published Limrun skills from github.com/limrun-inc/skills into
// public/.well-known/agent-skills/ and regenerates index.json per the Agent
// Skills Discovery RFC v0.2.0. Run `pnpm refresh-agent-skills` and commit the
// outputs; do not edit the mirrored files by hand.

import { createHash } from "node:crypto";
import { appendFile, mkdir, rm, writeFile } from "node:fs/promises";
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

// Unauthenticated GitHub API calls are rate-limited; export GITHUB_TOKEN
// (e.g. GITHUB_TOKEN=$(gh auth token)) if you hit 403s.
const apiHeaders = {
  accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN && {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

async function fetchJson(url) {
  return (await fetchOk(url, { headers: apiHeaders })).json();
}

// Deliberately not a full YAML parser (the script stays dependency-free), so
// it must fail loudly on anything beyond a single-line scalar instead of
// publishing mangled text into the RFC-facing index.json.
function frontmatterDescription(skillMd, name) {
  const frontmatter = skillMd.replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  const match = frontmatter?.match(/^description:[ \t]*(.+)\r?\n?(([ \t]+).*)?$/m);
  const raw = match?.[1].trim();
  if (!raw) throw new Error(`${name}/SKILL.md has no frontmatter description`);
  if (/^[>|&*]/.test(raw) || match[3]) {
    throw new Error(
      `${name}/SKILL.md description is not a single-line plain or quoted scalar; this script cannot parse it faithfully`,
    );
  }
  const quoted = raw.match(/^"(.*)"$/) ?? raw.match(/^'(.*)'$/);
  return quoted ? quoted[1] : raw;
}

const commit = (await fetchJson(`https://api.github.com/repos/${REPO}/commits/${BRANCH}`)).sha;
const catalog = await (
  await fetchOk(`https://raw.githubusercontent.com/${REPO}/${commit}/catalog.json`)
).json();
const tree = await fetchJson(
  `https://api.github.com/repos/${REPO}/git/trees/${commit}?recursive=1`,
);
if (tree.truncated) {
  throw new Error(`git tree listing for ${REPO}@${commit} is truncated; refusing a partial mirror`);
}

// Fetch everything into memory first so a mid-run failure cannot leave a
// half-populated mirror on disk.
const outputs = new Map();
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
    outputs.set(join(name, relative), bytes);
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
outputs.set("index.json", Buffer.from(`${JSON.stringify(index, null, 2)}\n`));

await rm(OUT_DIR, { recursive: true, force: true });
for (const [relative, bytes] of outputs) {
  const target = join(OUT_DIR, relative);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
}
console.log(`Mirrored ${skills.length} skills from ${REPO}@${commit.slice(0, 12)}`);
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `commit=${commit.slice(0, 12)}\n`);
}
