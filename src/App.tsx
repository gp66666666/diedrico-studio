import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainApp from './MainApp';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainApp />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
