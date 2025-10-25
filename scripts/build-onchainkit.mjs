#!/usr/bin/env node
import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function main() {
  const entry = path.join(ROOT, 'src', 'ui', 'onchainkit-app.jsx');
  const outdir = path.join(ROOT, 'vendor', 'onchainkit');
  const outfile = path.join(outdir, 'onchainkit.bundle.js');

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile,
    platform: 'browser',
    target: ['es2020'],
    format: 'iife',
    sourcemap: true,
    minify: true,
    loader: {
      '.css': 'css',
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  });

  console.log(`[onchainkit] Bundled to ${path.relative(ROOT, outfile)}`);
}

main().catch((err) => {
  console.error('[onchainkit] build failed', err);
  process.exit(1);
});
