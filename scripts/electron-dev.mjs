/**
 * Smart Print desktop dev runner.
 * Starts the Vite renderer dev server, then launches the Electron kiosk
 * shell pointing at it. Both processes are cleaned up together.
 *
 * Usage: bun run electron:dev   (or: npm run electron:dev)
 * Prerequisite: `bun install` (installs electron + vite devDependencies).
 */
import { spawn } from 'node:child_process'

const vite = spawn('bunx', ['vite', '--config', 'vite.renderer.config.mts'], {
  stdio: 'inherit',
  env: process.env,
})

const electron = spawn(
  'bunx',
  ['electron', 'electron/main.cjs'],
  {
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_RENDERER_URL: 'http://localhost:5173' },
  },
)

function cleanup() {
  vite.kill('SIGTERM')
  electron.kill('SIGTERM')
  process.exit(0)
}

electron.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
