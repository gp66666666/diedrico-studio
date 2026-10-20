import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import './sidebar-theme-protection.css'
import './academy-dark-theme.css'
import App from './App'

// Herramienta de desarrollo: permite inspeccionar y manipular el estado
// desde la consola del navegador. No se incluye en la build de producción.
if (import.meta.env.DEV) {
    void Promise.all([
        import('./store/geometryStore'),
        import('./store/userStore'),
    ]).then(([geometry, user]) => {
        Object.assign(window as any, {
            __geometryStore: geometry.useGeometryStore,
            __userStore: user.useUserStore,
        })
    })
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </StrictMode>,
)