import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import SEO from '../components/SEO';
import { PAGE_META, pageSeo } from '../data/site';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 text-white p-8">
            <SEO {...pageSeo(PAGE_META.privacy)} />
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
                        <strong>Última actualización:</strong> Octubre 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">1. Información que recopilamos</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            Diédrico Studio funciona sin cuenta. Si decides crear una, recopilamos lo mínimo:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li><strong>Cuenta:</strong> tu email y, si inicias sesión con Google, tu nombre y foto de perfil.</li>
                            <li><strong>Tus proyectos:</strong> los elementos geométricos y las láminas que guardas en la nube.</li>
                            <li><strong>Progreso:</strong> los temas y ejercicios de la Academia que marcas como completados.</li>
                            <li><strong>Consultas de IA:</strong> un contador anónimo de las que has usado hoy (no se guarda lo que escribes).</li>
                            <li><strong>Preferencias:</strong> tema claro/oscuro y posición del panel del asistente.</li>
                        </ul>
                        <p className="text-white/80 leading-relaxed mt-3">
                            No usamos cookies publicitarias, ni Google Analytics, ni vendemos datos a nadie.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">2. Para qué usamos esos datos</h2>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li>Guardar tus proyectos y láminas para que los recuperes en cualquier equipo.</li>
                            <li>Mantener tu sesión iniciada y proteger tu cuenta.</li>
                            <li>Contar las consultas gratuitas del día y evitar abusos.</li>
                            <li>Guardar tu progreso en la Academia.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">3. Asistente IA</h2>
                        <p className="text-white/80 leading-relaxed">
                            Cuando usas el asistente, el texto que escribes se envía a través de nuestro servidor
                            (Supabase Edge Function) al proveedor del modelo (Groq) para generar la respuesta.
                            <strong> No guardamos tus conversaciones</strong>: se pierden al recargar la página.
                            Solo se registra un contador anónimo de peticiones para evitar abusos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">4. Pagos</h2>
                        <p className="text-white/80 leading-relaxed">
                            <strong>No hay pagos.</strong> Diédrico Studio es gratis y no vende planes ni créditos.
                            Si decides dejar un donativo, se hace fuera de esta web, en <strong>Ko-fi</strong>, con
                            su propia pasarela: Diédrico Studio <strong>nunca ve ni almacena datos bancarios</strong>
                            y el donativo no desbloquea ninguna función.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">5. Con quién compartimos</h2>
                        <p className="text-white/80 leading-relaxed mb-3">
                            No vendemos ni alquilamos información personal. Usamos estos proveedores, solo con lo
                            necesario para que la aplicación funcione:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li><strong>Supabase:</strong> base de datos, login y servidor del asistente (servidores en la UE).</li>
                            <li><strong>Vercel:</strong> alojamiento de la web.</li>
                            <li><strong>DeepSeek / Groq:</strong> procesamiento de las peticiones del asistente IA.</li>
                            <li><strong>Ko-fi:</strong> solo si decides dejar un donativo (opcional).</li>
                            <li><strong>Google:</strong> solo si eliges iniciar sesión con tu cuenta de Google.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">6. Almacenamiento y seguridad</h2>
                        <p className="text-white/80 leading-relaxed">
                            Los datos se guardan en Supabase con cifrado en tránsito y reglas de acceso por usuario
                            (cada cuenta solo puede leer y escribir sus propios proyectos). El acceso a la base de
                            datos desde la aplicación está limitado por esas reglas, no por confianza en el navegador.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">7. Cuánto tiempo los guardamos</h2>
                        <p className="text-white/80 leading-relaxed">
                            Tus proyectos y láminas se conservan mientras tengas la cuenta. Puedes borrarlos tú
                            mismo desde la aplicación. Si quieres eliminar la cuenta completa, escríbenos y se
                            borran la cuenta, los proyectos y el progreso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">8. Tus derechos</h2>
                        <p className="text-white/80 leading-relaxed mb-3">Puedes solicitar en cualquier momento:</p>
                        <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                            <li>Acceder a tus datos personales.</li>
                            <li>Rectificar datos incorrectos.</li>
                            <li>Eliminar tu cuenta y tus datos.</li>
                            <li>Exportar tus proyectos.</li>
                            <li>Oponerte al tratamiento o retirar el consentimiento.</li>
                        </ul>
                        <p className="text-white/80 leading-relaxed mt-3">
                            Para ejercerlos, escríbenos desde
                            <Link to="/contact" className="text-blue-400 hover:text-blue-300 ml-1">
                                la página de contacto
                            </Link>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">9. Menores</h2>
                        <p className="text-white/80 leading-relaxed">
                            La aplicación está pensada para estudiantes de secundaria y universidad. Si eres menor de
                            edad, necesitas la autorización de tu padre, madre o tutor para crear una cuenta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">10. Cambios en esta política</h2>
                        <p className="text-white/80 leading-relaxed">
                            Si cambiamos algo relevante (por ejemplo, un nuevo proveedor), actualizaremos esta página
                            y la fecha de arriba.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
