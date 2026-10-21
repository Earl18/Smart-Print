/* eslint-disable */
// Smart Print — Electron main process (kiosk shell).
// Runs the renderer fullscreen, frameless, with customer-escape hatches closed.
const { app, BrowserWindow, Menu, session } = require('electron')
const path = require('node:path')

const DIST_RENDERER = path.join(__dirname, '..', 'dist-renderer', 'index.html')

let win = null

function createWindow() {
  win = new BrowserWindow({
    kiosk: true, // true kiosk mode: Esc cannot leave fullscreen on Windows
    frame: false,
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: '#FFFDF5',
    icon: path.join(__dirname, '..', 'public', 'logo.png'), // same brand mark as the UI
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  })

  win.once('ready-to-show', () => win.show())

  // Block all navigation away from the kiosk UI
  win.webContents.on('will-navigate', (e) => e.preventDefault())
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.webContents.on('will-attach-webview', (e) => e.preventDefault())

  // No context menu anywhere
  win.webContents.on('context-menu', (e) => e.preventDefault())

  // Swallow keys that would let a customer escape or break the kiosk.
  // (Ctrl+Shift+F9 is the operator panel and is handled by the renderer.)
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return
    const key = (input.key || '').toLowerCase()
    if (key === 'escape' || key === 'f11') e.preventDefault()
    if (input.control && key === 'r') e.preventDefault()
    if (input.control && key === 'p') e.preventDefault()
    if (input.alt && key === 'f4') e.preventDefault()
    if (input.control && input.shift && key === 'i') e.preventDefault()
    if (input.control && input.shift && key === 'f12') e.preventDefault()
    if (input.meta) e.preventDefault()
  })

  // The kiosk is touch-driven: hide the cursor completely.
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS('* { cursor: none !important; }').catch(() => {})
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(DIST_RENDERER)
  }
}

app.whenReady().then(() => {
  // Hardening: no remote content permissions, no devtools shortcut leakage
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false))
  Menu.setApplicationMenu(null)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => app.quit())
