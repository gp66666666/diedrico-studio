import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainApp from './MainApp';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AcademyPage from './pages/AcademyPage';
import GuidePage from './pages/GuidePage';
import { useThemeInitializer } from './hooks/useThemeSync';

function App() {
    // Inicializar el tema al cargar la aplicación
    useThemeInitializer();
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainApp />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                {/* <Route path="/academy" element={<AcademyPage />} /> */}
                <Route path="/academy" element={<AcademyPage />} />
                <Route path="/guia" element={<GuidePage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
