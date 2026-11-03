import { copyFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  console.error('HabitFlow requires Node.js 22.13 or newer. Install Node 24 LTS, then run npm run setup again.');
  process.exit(1);
}
if (!existsSync('.dev.vars')) {
  copyFileSync('.dev.vars.example', '.dev.vars');
  console.log('Created local demo configuration. No API keys are needed for local tracking.');
} else {
  console.log('Keeping your existing .dev.vars configuration.');
}
const windows = process.platform === 'win32';
for (const args of [['ci'], ['run', 'db:migrate'], ['run', 'typecheck']]) {
  const result = spawnSync(windows ? 'npm.cmd' : 'npm', args, { stdio: 'inherit', shell: windows });
  if (result.error || result.status !== 0) {
    console.error(result.error?.message || `Setup stopped at: npm ${args.join(' ')}`);
    process.exit(result.status || 1);
  }
}
console.log('\nSetup complete. Run npm start, open the local URL, and select Get Started.');
