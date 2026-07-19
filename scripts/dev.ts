/**
 * Loads .env.local before starting Next.js so TLS-related vars are available
 * to the Node process (needed on corporate networks with SSL inspection).
 */
import { spawn } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.local" });

const child = spawn("next", ["dev"], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
