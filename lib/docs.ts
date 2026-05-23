import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content/docs");

export type DocMeta = { title?: string; description?: string };

export function getDoc(slug: string) {
  const fullPath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const { content, data } = matter(fs.readFileSync(fullPath, "utf-8"));
  return { content, meta: data as DocMeta };
}

export function getAllSlugs() {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
