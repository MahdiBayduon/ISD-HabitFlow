import { build } from 'esbuild';
await build({ entryPoints: { worker: 'src/worker/index.ts', progress: 'src/worker/lib/progress.ts' }, outdir: '.test-build', outExtension: { '.js': '.mjs' }, bundle: true, platform: 'node', format: 'esm', packages: 'external' });
