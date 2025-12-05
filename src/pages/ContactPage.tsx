import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import emailjs from '@emailjs/browser';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError('');

        try {
            // EmailJS configuration
            const serviceId = 'service_okhmw6d';
            const templateId = 'template_y6rqi5j';
            const publicKey = 'SIyk3MPIy99O0HZxY';

            // Prepare template parameters
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject,
                message: formData.message,
                to_email: 'eloigperezz@gmail.com'
            };

            // Send email via EmailJS
            await emailjs.send(serviceId, templateId, templateParams, publicKey);

            // Show success message
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });

            // Hide success message after 5 seconds
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            console.error('Error sending email:', err);
            setError('Hubo un error al enviar el mensaje. Por favor intenta de nuevo o escríbeme directamente a eloigperezz@gmail.com');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8">
                    <ArrowLeft size={20} />
                    Volver a la aplicación
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold mb-6">Contacto</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            <h2 className="text-2xl font-semibold mb-4">Información de Contacto</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Mail className="text-blue-400 mt-1" size={20} />
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <a
                                            href="mailto:eloigperezz@gmail.com"
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            eloigperezz@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MessageSquare className="text-green-400 mt-1" size={20} />
                                    <div>
                                        <p className="font-medium">Tiempo de Respuesta</p>
                                        <p className="text-white/70 text-sm">
                                            Responderé lo antes posible
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                <AlertCircle className="text-yellow-400" size={20} />
                                Política de Privacidad
                            </h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Tu privacidad es importante para nosotros. No compartimos tu información
                                personal con terceros. Los datos que nos proporciones solo se utilizarán
                                para responder a tu consulta. Para más información, consulta nuestra
                                <Link to="/privacy" className="text-blue-400 hover:text-blue-300 ml-1">
                                    Política de Privacidad
                                </Link>.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            <h3 className="text-xl font-semibold mb-3">Motivos de Contacto</h3>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li>• Reportar errores o bugs</li>
                                <li>• Sugerencias de mejora</li>
                                <li>• Preguntas sobre el uso de la herramienta</li>
                                <li>• Problemas técnicos</li>
                                <li>• Consultas sobre contenido y anuncios</li>
                                <li>• Propuestas de colaboración</li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <h2 className="text-2xl font-semibold mb-4">Envíanos un Mensaje</h2>

                        {submitted && (
                            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
                                <p className="text-green-300 text-sm">
                                    ✓ ¡Mensaje enviado correctamente! Te responderé lo antes posible a tu email.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
                                <p className="text-red-300 text-sm">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 text-white placeholder-white/40"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 text-white placeholder-white/40"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Asunto *
                                </label>
                                <select
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                                >
                                    <option value="">Selecciona un asunto</option>
                                    <option value="bug">Reportar Error</option>
                                    <option value="suggestion">Sugerencia</option>
                                    <option value="help">Necesito Ayuda</option>
                                    <option value="ads">Consulta sobre Anuncios</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mensaje *
                                </label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 text-white placeholder-white/40 resize-none"
                                    placeholder="Escribe tu mensaje aquí..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${sending
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                <Mail size={20} />
                                {sending ? 'Enviando...' : 'Enviar Mensaje'}
                            </button>

                            <p className="text-xs text-white/50 text-center">
                                Al enviar este formulario, aceptas nuestra política de privacidad.
                            </p>
                        </form>
                    </div>
                </div>

                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold mb-3">Preguntas Frecuentes</h3>
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="font-medium text-white mb-1">¿Es gratuito usar Diédrico Studio?</p>
                            <p className="text-white/70">
                                Sí, Diédrico Studio es completamente gratuito. Hay versión premium que te da más herramientas y características. Los anuncios nos ayudan a mantener
                                el servidor y seguir desarrollando nuevas características.
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-white mb-1">¿Necesito crear una cuenta?</p>
                            <p className="text-white/70">
                                No es obligatorio, pero crear una cuenta te permite guardar tus trabajos
                                y acceder a ellos desde cualquier dispositivo.
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-white mb-1">¿Hay versión móvil?</p>
                            <p className="text-white/70">
                                Sí, la aplicación es completamente responsiva y funciona en móviles y tablets,
                                aunque la experiencia es mejor en pantallas más grandes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
