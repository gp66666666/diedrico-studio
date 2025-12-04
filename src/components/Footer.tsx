import { Link } from 'react-router-dom';
import { Info, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900/50 backdrop-blur-md border-t border-white/10 text-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    {/* About Section */}
                    <div>
                        <h3 className="font-semibold mb-3 text-blue-400">Diédrico Studio</h3>
                        <p className="text-white/70 text-xs leading-relaxed mb-2">
                            Herramienta educativa interactiva para aprender sistema diédrico
                            con visualización 3D en tiempo real.
                        </p>
                        <p className="text-white/50 text-xs">
                            © 2024 Eloi García
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-3 text-blue-400">Enlaces</h3>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-white/70 hover:text-white flex items-center gap-2"
                                >
                                    <Info size={14} />
                                    Quiénes Somos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-white/70 hover:text-white flex items-center gap-2"
                                >
                                    <Mail size={14} />
                                    Contacto
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-white/70 hover:text-white"
                                >
                                    Política de Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-white/70 hover:text-white"
                                >
                                    Términos de Uso
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal / AdSense */}
                    <div>
                        <h3 className="font-semibold mb-3 text-blue-400">Información</h3>
                        <p className="text-white/60 text-xs leading-relaxed">
                            Este sitio web utiliza Google AdSense para mostrar anuncios.
                            Al utilizar este sitio, aceptas el uso de cookies y nuestra
                            política de privacidad.
                        </p>
                        <p className="text-white/50 text-xs mt-2">
                            Contenido educativo y gratuito.
                        </p>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-6 pt-4 text-center text-xs text-white/50">
                    <p>
                        Hecho con ❤️ para estudiantes y profesionales de geometría descriptiva
                    </p>
                </div>
            </div>
        </footer>
    );
}
