import { createRoot } from 'react-dom/client'
import KioskApp from '@/kiosk'
import '@/kiosk/kiosk-entry.css'

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root element')
createRoot(container).render(<KioskApp />)
