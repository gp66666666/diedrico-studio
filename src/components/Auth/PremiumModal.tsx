import { X, Crown, Check } from 'lucide-react';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <Crown size={32} />
                        <h2 className="text-2xl font-bold">Premium</h2>
                    </div>
                    <p className="text-white/90 text-sm">
                        Desbloquea todas las funcionalidades profesionales
                    </p>
                </div>

                {/* Features */}
                <div className="p-6 space-y-4">
                    <div className="space-y-3">
                        {[
                            'Exportar vistas a JPG/PNG de alta calidad',
                            'Exportar todas las vistas en un ZIP',
                            'Guardar proyectos en la nube (próximamente)',
                            'Sin anuncios (próximamente)',
                            'Respuestas ilimitadas de la IA (próximamente)',
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                                    <Check size={14} className="text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                            Para obtener acceso Premium, contacta con el administrador:
                        </p>
                        <a
                            href="mailto:eloigperezz@gmail.com?subject=Solicitud Premium - Diedrico Studio"
                            className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-bold text-center hover:shadow-lg transition-all"
                        >
                            Solicitar Acceso Premium
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
