#!/usr/bin/env node
import 'dotenv/config';
import { spawn } from 'node:child_process';
import process from 'node:process';

function resolveBaseUrl() {
  const explicit = process.env.INTEGRATION_BASE_URL || process.env.SELF_CHECK_BASE || '';
  if (explicit) return explicit;

  const configured = process.env.BASE_URL || '';
  if (configured.includes('127.0.0.1') || configured.includes('localhost')) {
    return configured;
  }

  return 'http://127.0.0.1:5173';
}

const BASE_URL = resolveBaseUrl();
const START_TIMEOUT_MS = Number(process.env.INTEGRATION_START_TIMEOUT_MS || 20000);
const CHECKS = [
  ['self:check', 'npm', ['run', 'self:check']],
  ['healthcheck', 'npm', ['run', 'healthcheck']],
  ['smoke:sepolia', 'npm', ['run', 'smoke:sepolia']],
  ['e2e:sponsor', 'npm', ['run', 'e2e:sponsor']],
  ['e2e:bundler', 'npm', ['run', 'e2e:bundler']],
  ['check:sponsor', 'npm', ['run', 'check:sponsor']],
  ['check:bundler', 'npm', ['run', 'check:bundler']]
];

function killChild(child) {
  if (!child || child.killed) return;
  try {
    child.kill('SIGTERM');
  } catch (_) {
    // no-op best effort
  }
}

async function runCheck(label, command, args, env) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env,
      shell: false
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} failed with exit code ${code}`));
    });
  });
}

async function waitForServerStart(child, timeoutMs) {
  await new Promise((resolve, reject) => {
    const graceMs = Math.min(timeoutMs, 1500);
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, graceMs);

    function handleExit(code, signal) {
      clearTimeout(timer);
      cleanup();
      reject(new Error(`local dev server exited before ready (code=${code}, signal=${signal || 'none'})`));
    }

    function cleanup() {
      child.off('exit', handleExit);
    }

    child.on('exit', handleExit);
  });
}

async function main() {
  const inheritedEnv = {
    ...process.env,
    BASE_URL,
    SELF_CHECK_BASE: BASE_URL
  };

  let startedServer = false;
  let serverChild = null;

  console.log(`[integration] starting local dev server at ${BASE_URL}`);
  serverChild = spawn(process.execPath, ['scripts/dev-server.mjs'], {
    stdio: 'inherit',
    env: inheritedEnv,
    shell: false
  });
  startedServer = true;

  try {
    await waitForServerStart(serverChild, START_TIMEOUT_MS);
  } catch (error) {
    killChild(serverChild);
    throw error;
  }

  try {
    for (const [label, command, args] of CHECKS) {
      console.log(`[integration] running ${label}`);
      await runCheck(label, command, args, inheritedEnv);
    }
  } finally {
    if (startedServer) {
      console.log('[integration] stopping local dev server');
      killChild(serverChild);
    }
  }
}

main().catch((error) => {
  console.error('[integration] fatal:', error?.message || error);
  process.exit(1);
});
