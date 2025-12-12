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
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <Crown size={32} />
                        <h2 className="text-2xl font-bold">Proyecto en Desarrollo</h2>
                    </div>
                    <p className="text-white/90 text-sm">
                        Ayuda a mantener y mejorar Diédrico Studio
                    </p>
                </div>

                {/* Features */}
                <div className="p-8 text-center space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-4">
                        <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                            Estamos preparando algo increíble para ti.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Las funciones premium estarán disponibles próximamente.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
