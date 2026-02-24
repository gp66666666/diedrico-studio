import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Mail } from 'lucide-react';
import SEO from '../components/SEO';

export default function AboutPage() {
    return (
        <>
            <SEO
                title="Quiénes Somos - Diédrico Studio"
                description="Conoce más sobre Diédrico Studio, la herramienta educativa gratuita para aprender sistema diédrico con visualización 3D. Proyecto creado por Eloi García."
                keywords="sobre Diédrico Studio, equipo, proyecto educativo, geometría descriptiva online, herramienta educativa"
                canonicalUrl="https://diedrico-studio.vercel.app/about"
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8">
                        <ArrowLeft size={20} />
                        Volver a la aplicación
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Quiénes Somos</h1>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Sobre Diédrico Studio</h2>
                            <p className="text-white/80 leading-relaxed">
                                Diédrico Studio es una herramienta educativa interactiva diseñada para facilitar el aprendizaje
                                del sistema diédrico, una técnica fundamental en geometría descriptiva y dibujo técnico.
                                Nuestra plataforma combina visualización 3D en tiempo real con proyecciones diédricas tradicionales,
                                permitiendo a estudiantes y profesionales comprender mejor los conceptos espaciales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Nuestra Misión</h2>
                            <p className="text-white/80 leading-relaxed">
                                Hacer que el aprendizaje del sistema diédrico sea accesible, intuitivo y efectivo mediante
                                tecnología web moderna. Creemos que la visualización interactiva es clave para dominar conceptos
                                espaciales complejos, y nuestra herramienta está diseñada para hacer que este proceso sea
                                lo más natural posible.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Características Principales</h2>
                            <ul className="list-disc list-inside space-y-2 text-white/80">
                                <li>Visualización 3D interactiva en tiempo real</li>
                                <li>Proyecciones diédricas automáticas (alzado, planta, perfil)</li>
                                <li>Herramientas avanzadas de paralelismo y perpendicularidad</li>
                                <li>Asistente AI para resolver ejercicios paso a paso</li>
                                <li>Cálculo de distancias, intersecciones y verdaderas magnitudes</li>
                                <li>Modo boceto para dibujo libre</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Para Quién</h2>
                            <p className="text-white/80 leading-relaxed mb-4">
                                Diédrico Studio está diseñado para:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-white/80">
                                <li>Estudiantes de ingeniería y arquitectura</li>
                                <li>Profesores de geometría descriptiva y dibujo técnico</li>
                                <li>Profesionales que necesitan visualizar problemas espaciales</li>
                                <li>Cualquier persona interesada en aprender sistema diédrico</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Creador</h2>
                            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                                <p className="text-lg font-medium mb-2">Eloi García</p>
                                <p className="text-white/70 mb-4">
                                    Desarrollador web y estudiante apasionado por la educación y la tecnología.
                                    Este proyecto nace de la necesidad de crear una herramienta que facilite el
                                    aprendizaje del sistema diédrico de forma visual e interactiva.
                                </p>
                                <div className="space-y-2">
                                    <a
                                        href="https://github.com/gp66666666"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                                    >
                                        <Github size={20} />
                                        GitHub
                                    </a>
                                    <div>
                                        <a
                                            href="mailto:diedrico.studio25@gmail.com"
                                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                                        >
                                            <Mail size={20} />
                                            diedrico.studio25@gmail.com
                                        </a>
                                        <p className="text-xs text-white/50 mt-1 ml-7">
                                            Contacto, soporte y sugerencias
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Tecnología</h2>
                            <p className="text-white/80 leading-relaxed mb-3">
                                Diédrico Studio está construido con tecnologías web modernas:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-white/80">
                                <li>React + TypeScript para la interfaz de usuario</li>
                                <li>Three.js y React Three Fiber para visualización 3D</li>
                                <li>Zustand para gestión de estado</li>
                                <li>Tailwind CSS para diseño responsivo</li>
                                <li>Supabase para autenticación y almacenamiento</li>
                                <li>IA (Groq/Gemini) para asistente inteligente</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Desarrollo Continuo</h2>
                            <p className="text-white/80 leading-relaxed">
                                Estamos constantemente mejorando Diédrico Studio con nuevas características y herramientas.
                                Si tienes sugerencias o encuentras algún problema, no dudes en contactarnos.
                                Tu feedback es invaluable para hacer de esta plataforma la mejor herramienta
                                de aprendizaje del sistema diédrico.
                            </p>
                        </section>

                        <section className="border-t border-white/20 pt-6">
                            <p className="text-sm text-white/60">
                                Última actualización: Diciembre 2025
                            </p>
                            <p className="text-sm text-white/60 mt-2">
                                Este sitio web es un proyecto educativo. Los anuncios que aparecen
                                ayudan a cubrir los costos de hosting y mantenimiento del servidor, cualquier donación es de agradecer.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
