const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const INCLUDED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".scss",
  ".html",
  ".md",
  ".yml",
  ".yaml",
  ".prisma",
  ".sql",
  ".txt",
]);

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  "node_modules",
  ".tmp-runner",
  "dist",
  "build",
  "coverage",
]);

const SOURCE_ROOTS = [
  "actions",
  "app",
  "components",
  "data",
  "lib",
  "pages",
  "prisma",
  "scripts",
  "types",
];

const ROOT_FILES = [
  ".editorconfig",
  ".gitattributes",
  ".env.example",
  "Dockerfile",
  "docker-compose.yml",
  "next.config.js",
  "next.config.ts",
  "package.json",
  "postcss.config.js",
  "tailwind.config.ts",
  "tsconfig.json",
];

const SUSPICIOUS_PATTERNS = [
  { label: "merge-conflict-marker", regex: /^(<<<<<<<|=======|>>>>>>>)(?: .*)?$/u },
  { label: "replacement-character", regex: /\uFFFD/u },
  { label: "bom-garble", regex: /\u0E4F\u0E1B\u0E1F|\u00EF\u00BB\u00BF/u },
  { label: "thai-mojibake-fragments", regex: /(?:เธ.{0,2}เน|เน.{0,2}เธ|เธ.{0,2}เธ|เน€.{0,2}เน€)/u },
];

function walk(dir, results) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, results);
      continue;
    }

    if (!INCLUDED_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    results.push(fullPath);
  }
}

function inspectFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  const findings = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.regex.test(line)) {
        findings.push({
          line: i + 1,
          label: pattern.label,
          snippet: line.trim().slice(0, 160),
        });
        break;
      }
    }
  }

  return findings;
}

const files = [];
for (const relativeRoot of SOURCE_ROOTS) {
  const fullRoot = path.join(ROOT, relativeRoot);
  if (fs.existsSync(fullRoot)) {
    walk(fullRoot, files);
  }
}

for (const relativeFile of ROOT_FILES) {
  const fullPath = path.join(ROOT, relativeFile);
  if (fs.existsSync(fullPath)) {
    files.push(fullPath);
  }
}

const problems = [];
for (const filePath of files) {
  if (path.relative(ROOT, filePath) === path.join("scripts", "check-text-encoding.js")) {
    continue;
  }
  const findings = inspectFile(filePath);
  if (findings.length > 0) {
    problems.push({
      filePath: path.relative(ROOT, filePath),
      findings,
    });
  }
}

if (problems.length > 0) {
  console.error("Detected suspicious text encoding / mojibake patterns:\n");
  for (const problem of problems) {
    console.error(problem.filePath);
    for (const finding of problem.findings.slice(0, 10)) {
      console.error(`  line ${finding.line} [${finding.label}] ${finding.snippet}`);
    }
    if (problem.findings.length > 10) {
      console.error(`  ... ${problem.findings.length - 10} more line(s)`);
    }
    console.error("");
  }
  process.exit(1);
}

console.log("Text encoding check passed.");
