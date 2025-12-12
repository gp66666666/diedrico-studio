import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8">
                    <ArrowLeft size={20} />
                    Volver a la aplicación
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-blue-400" size={32} />
                    <h1 className="text-4xl md:text-5xl font-bold">Política de Privacidad</h1>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 space-y-6 text-sm">
                    <p className="text-white/70">
                        <strong>Última actualización:</strong> Diciembre 2025
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">1. Información que Recopilamos</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Diédrico Studio recopila la siguiente información:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li><strong>Información de cuenta:</strong> Si creas una cuenta, recopilamos tu email y nombre de usuario.</li>
                            <li><strong>Datos de uso:</strong> Información sobre cómo utilizas la aplicación (proyectos guardados, herramientas utilizadas).</li>
                            <li><strong>Datos de navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas, mediante Google Analytics.</li>
                            <li><strong>Cookies:</strong> Utilizamos cookies para mejorar tu experiencia y para publicidad (Google AdSense).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">2. Cómo Utilizamos Tu Información</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Utilizamos la información recopilada para:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li>Proporcionar y mejorar nuestros servicios</li>
                            <li>Guardar tus proyectos y preferencias</li>
                            <li>Autenticar tu cuenta</li>
                            <li>Analizar el uso de la aplicación para mejorar la experiencia del usuario</li>
                            <li>Mostrar anuncios relevantes mediante Google AdSense</li>
                            <li>Comunicarnos contigo sobre actualizaciones o problemas técnicos</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">3. Google AdSense y Cookies</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Este sitio web utilizará Google AdSense para mostrar anuncios. Google utilizará cookies
                            para mostrar anuncios basados en tus visitas anteriores a este u otros sitios web.
                        </p>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Puedes inhabilitar el uso de cookies de publicidad personalizada visitando
                            <a
                                href="https://www.google.com/settings/ads"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 ml-1"
                            >
                                Configuración de anuncios de Google
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">4. Compartir Información con Terceros</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            NO vendemos ni alquilamos tu información personal a terceros. Compartimos información solo con:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li><strong>Google AdSense:</strong> Para mostrar anuncios relevantes</li>
                            <li><strong>Google Analytics:</strong> Para análisis de uso del sitio</li>
                            <li><strong>Supabase:</strong> Para autenticación y almacenamiento de datos (cumple con GDPR)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">5. Almacenamiento y Seguridad</h2>
                        <p className="text-white/80 leading-relaxed">
                            Tus datos se almacenan de forma segura en servidores de Supabase, que cumple con las
                            regulaciones de protección de datos GDPR. Utilizamos encriptación y medidas de seguridad
                            para proteger tu información personal.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">6. Tus Derechos</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Tienes derecho a:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li>Acceder a tus datos personales</li>
                            <li>Rectificar datos incorrectos</li>
                            <li>Solicitar la eliminación de tus datos</li>
                            <li>Exportar tus datos</li>
                            <li>Oponerte al procesamiento de tus datos</li>
                            <li>Retirar el consentimiento en cualquier momento</li>
                        </ul>
                        <p className="text-white/80 leading-relaxed mt-3">
                            Para ejercer estos derechos, contáctanos en
                            <Link to="/contact" className="text-blue-400 hover:text-blue-300 ml-1">
                                nuestra página de contacto
                            </Link>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">7. Cookies</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Utilizamos las siguientes tipos de cookies:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
                            <li><strong>Cookies de análisis:</strong> Google Analytics para entender el uso del sitio</li>
                            <li><strong>Cookies de publicidad:</strong> Google AdSense para mostrar anuncios</li>
                        </ul>
                        <p className="text-white/80 leading-relaxed mt-3">
                            Puedes configurar tu navegador para rechazar cookies, pero esto puede afectar
                            la funcionalidad del sitio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">8. Menores de Edad</h2>
                        <p className="text-white/80 leading-relaxed">
                            Este sitio no está dirigido a menores de 13 años. No recopilamos intencionadamente
                            información de menores de 13 años. Si descubres que un menor ha proporcionado
                            información personal, contáctanos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">9. Cambios a esta Política</h2>
                        <p className="text-white/80 leading-relaxed">
                            Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos
                            de cambios significativos mediante un aviso en el sitio web. El uso continuado
                            del sitio después de los cambios constituye la aceptación de la nueva política.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">10. Contacto</h2>
                        <p className="text-white/80 leading-relaxed">
                            Si tienes preguntas sobre esta política de privacidad, contáctanos en:
                        </p>
                        <p className="text-blue-400 mt-2">
                            Email: eloigperezz@gmail.com
                        </p>
                        <p className="text-white/70 mt-2">
                            O visita nuestra
                            <Link to="/contact" className="text-blue-400 hover:text-blue-300 ml-1">
                                página de contacto
                            </Link>.
                        </p>
                    </section>

                    <div className="border-t border-white/20 pt-6 mt-8">
                        <p className="text-xs text-white/50">
                            Al utilizar Diédrico Studio, aceptas esta política de privacidad y el uso de cookies
                            según lo descrito.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
