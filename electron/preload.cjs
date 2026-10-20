/* eslint-disable */
const { contextBridge } = require('electron')

// Minimal, read-only surface for the renderer.
// The renderer uses `window.kiosk.isElectron` to skip browser-only
// behaviors (e.g. requesting fullscreen on the welcome screen).
contextBridge.exposeInMainWorld('kiosk', {
  isElectron: true,
  platform: process.platform,
})
