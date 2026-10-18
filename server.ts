import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const isTsxActive = Boolean(process.env.TSX_LOADED) || process.execArgv.some(arg => arg.includes('tsx'));

if (!isTsxActive) {
  // If invoked with bare 'node server.ts', spawn using the '--import tsx' loader
  const filename = fileURLToPath(import.meta.url);
  const child = spawn(process.execPath, ['--import', 'tsx', filename, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, TSX_LOADED: '1' }
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  child.on('error', (err) => {
    console.error('Failed to spawn tsx server:', err);
    process.exit(1);
  });
} else {
  // Running with tsx active - load and run serverApp
  const { startServer } = await import('./server/serverApp.js');
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
