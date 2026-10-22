import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainApp from './MainApp';
import ToastHost from './components/ToastHost';
import { Analytics } from '@vercel/analytics/react';
import { useThemeInitializer } from './hooks/useThemeSync';

// Las páginas secundarias se cargan solo al entrar: la app (3D) pesa lo suyo
// y no tiene sentido descargar la academia o la guía en la primera visita.
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AcademyPage = lazy(() => import('./pages/AcademyPage'));
const GuidePage = lazy(() => import('./pages/GuidePage'));
const ExercisesPage = lazy(() => import('./pages/ExercisesPage'));
const ExerciseDetailPage = lazy(() => import('./pages/ExerciseDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ClassPage = lazy(() => import('./pages/ClassPage'));

function PageLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#070d18]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
    );
}

function App() {
    // Inicializar el tema al cargar la aplicación
    useThemeInitializer();
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<MainApp />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/academy" element={<AcademyPage />} />
                <Route path="/guia" element={<GuidePage />} />
                <Route path="/ejercicios" element={<ExercisesPage />} />
                <Route path="/ejercicios/:slug" element={<ExerciseDetailPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/clase" element={<ClassPage />} />
                {/* Cualquier otra URL: antes se quedaba en blanco */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </Suspense>
            <ToastHost />
            <Analytics />
        </BrowserRouter>
    );
}

export default App;
