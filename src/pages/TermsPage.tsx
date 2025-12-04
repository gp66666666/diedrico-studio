import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8">
                    <ArrowLeft size={20} />
                    Volver a la aplicación
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <FileText className="text-blue-400" size={32} />
                    <h1 className="text-4xl md:text-5xl font-bold">Términos de Uso</h1>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 space-y-6 text-sm">
                    <p className="text-white/70">
                        <strong>Última actualización:</strong> Diciembre 2024
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">1. Aceptación de los Términos</h2>
                        <p className="text-white/80 leading-relaxed">
                            Al acceder y utilizar Diedrico 3D, aceptas estar sujeto a estos Términos de Uso
                            y a nuestra Política de Privacidad. Si no estás de acuerdo con alguno de estos términos,
                            no debes utilizar este sitio web.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">2. Descripción del Servicio</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Diedrico 3D es una herramienta educativa gratuita para el aprendizaje del sistema
                            diédrico. Proporcionamos:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li>Visualización 3D interactiva</li>
                            <li>Proyecciones diédricas automáticas</li>
                            <li>Herramientas de geometría descriptiva</li>
                            <li>Asistente AI para resolver ejercicios</li>
                            <li>Almacenamiento opcional de proyectos (con cuenta)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">3. Uso Aceptable</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Al utilizar Diedrico 3D, te comprometes a:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li>Utilizar el servicio solo con fines educativos y legales</li>
                            <li>No intentar acceder a áreas restringidas del sistema</li>
                            <li>No realizar ingeniería inversa del código de la aplicación</li>
                            <li>No interferir con el funcionamiento normal del servicio</li>
                            <li>No utilizar el servicio para actividades maliciosas o ilegales</li>
                            <li>No hacer clic fraudulento en los anuncios de Google AdSense</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">4. Cuentas de Usuario</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Si creas una cuenta:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li>Eres responsable de mantener la confidencialidad de tu contraseña</li>
                            <li>Eres responsable de todas las actividades que ocurran bajo tu cuenta</li>
                            <li>Debes proporcionar información precisa y actualizada</li>
                            <li>Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">5. Propiedad Intelectual</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            <strong>Contenido del sitio:</strong> Todo el contenido de Diedrico 3D (código, diseño,
                            textos, gráficos) es propiedad de Eloi García y está protegido por derechos de autor.
                        </p>
                        <p className="text-white/80 leading-relaxed">
                            <strong>Tu contenido:</strong> Los proyectos que crees son tuyos. Te otorgamos el
                            derecho de almacenarlos en nuestros servidores, pero mantienes todos los derechos
                            sobre tu trabajo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">6. Publicidad y AdSense</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Este sitio muestra anuncios mediante Google AdSense:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li>Los anuncios ayudan a mantener el servicio gratuito</li>
                            <li>No controlamos el contenido de los anuncios de terceros</li>
                            <li>No somos responsables del contenido de sitios externos vinculados en anuncios</li>
                            <li>Hacer clic fraudulento en anuncios está estrictamente prohibido</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">7. Limitación de Responsabilidad</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Diedrico 3D se proporciona "tal cual" sin garantías de ningún tipo:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li>No garantizamos que el servicio esté disponible sin interrupciones</li>
                            <li>No garantizamos la exactitud de los cálculos o visualizaciones</li>
                            <li>No somos responsables de pérdidas de datos o proyectos</li>
                            <li>No somos responsables de daños derivados del uso del servicio</li>
                            <li>No garantizamos que el servicio esté libre de errores</li>
                        </ul>
                        <p className="text-white/80 leading-relaxed mt-3">
                            <strong>Importante:</strong> Este es un proyecto educativo. Siempre verifica los
                            resultados antes de usar cualquier cálculo en trabajos académicos o profesionales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">8. Modificaciones del Servicio</h2>
                        <p className="text-white/80 leading-relaxed">
                            Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento,
                            con o sin previo aviso. No seremos responsables ante ti ni ante terceros por cualquier
                            modificación, suspensión o discontinuación del servicio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">9. Terminación</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Podemos terminar o suspender tu acceso al servicio:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li>Por violación de estos términos</li>
                            <li>Por actividad sospechosa o fraudulenta</li>
                            <li>A nuestra discreción, sin previo aviso</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">10. Enlaces a Sitios de Terceros</h2>
                        <p className="text-white/80 leading-relaxed">
                            Nuestro servicio puede contener enlaces a sitios web de terceros. No controlamos
                            ni somos responsables del contenido, políticas de privacidad o prácticas de
                            sitios de terceros.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">11. Ley Aplicable</h2>
                        <p className="text-white/80 leading-relaxed">
                            Estos términos se rigen por las leyes de España. Cualquier disputa relacionada
                            con estos términos se resolverá en los tribunales competentes de España.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">12. Cambios a los Términos</h2>
                        <p className="text-white/80 leading-relaxed">
                            Podemos actualizar estos términos ocasionalmente. Te notificaremos de cambios
                            significativos mediante un aviso en el sitio. El uso continuado del servicio
                            después de los cambios constituye la aceptación de los nuevos términos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">13. Contacto</h2>
                        <p className="text-white/80 leading-relaxed">
                            Si tienes preguntas sobre estos términos, contáctanos:
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
                            Al utilizar Diedrico 3D, confirmas que has leído, entendido y aceptado estos
                            Términos de Uso y nuestra Política de Privacidad.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
