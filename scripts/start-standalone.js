const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, ".next", "standalone");
const standaloneNextRoot = path.join(standaloneRoot, ".next");
const sourceStaticDir = path.join(projectRoot, ".next", "static");
const targetStaticDir = path.join(standaloneNextRoot, "static");
const sourcePublicDir = path.join(projectRoot, "public");
const targetPublicDir = path.join(standaloneRoot, "public");
const serverEntry = path.join(standaloneRoot, "server.js");

function assertExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    console.error(`${label} not found: ${targetPath}`);
    process.exit(1);
  }
}

function syncDir(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });
}

assertExists(serverEntry, "Standalone server");
assertExists(sourceStaticDir, "Built static assets");

syncDir(sourceStaticDir, targetStaticDir);
syncDir(sourcePublicDir, targetPublicDir);

const child = spawn(process.execPath, [serverEntry], {
  cwd: standaloneRoot,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

