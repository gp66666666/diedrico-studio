import { useEffect } from 'react';
import { X, Crown, Check, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PREMIUM } from '../../config/premium';
import { useUserStore } from '../../store/userStore';
import { useModalA11y } from '../../hooks/useModalA11y';
import { trackEvent } from '../../lib/analytics';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const { isPremium, user } = useUserStore();
    const panelRef = useModalA11y(isOpen, onClose);

    useEffect(() => {
        if (isOpen) trackEvent('premium_modal_open', { premium: isPremium });
    }, [isOpen, isPremium]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Diédrico Studio Premium"
                tabIndex={-1}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden outline-none"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <Crown size={32} />
                        <h2 className="text-2xl font-bold">
                            {isPremium ? 'Ya eres Premium' : 'Diédrico Studio Premium'}
                        </h2>
                    </div>
                    <p className="text-white/90 text-sm">
                        {isPremium
                            ? 'Gracias por apoyar el proyecto.'
                            : 'Desbloquea el contenido y las herramientas que de verdad ahorran tiempo.'}
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {isPremium ? (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Tu cuenta tiene acceso a todo. Si quieres gestionar o cancelar tu
                                aportación, hazlo desde Ko-fi.
                            </p>
                            <a
                                href={PREMIUM.kofiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity"
                            >
                                Abrir Ko-fi <ExternalLink size={16} />
                            </a>
                        </>
                    ) : (
                        <>
                            <ul className="space-y-3">
                                {PREMIUM.features.map((feature) => (
                                    <li key={feature.id} className="flex gap-3">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                            <Check size={14} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {feature.title}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {PREMIUM.priceLabel && (
                                <p className="text-center text-lg font-bold text-gray-900 dark:text-white">
                                    {PREMIUM.priceLabel}
                                </p>
                            )}

                            <a
                                href={PREMIUM.kofiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEvent('premium_kofi_click', { source: 'premium' })}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:opacity-90 transition-opacity"
                            >
                                <Crown size={18} /> Hacerme Premium
                            </a>

                            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 text-center">
                                {PREMIUM.activationNote}
                                {user?.email ? ` Email de tu cuenta: ${user.email}.` : ''}
                            </p>

                            <a
                                href={PREMIUM.kofiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-center text-xs text-pink-600 dark:text-pink-400 hover:underline"
                            >
                                O simplemente invítame a un café ☕
                            </a>
                        </>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Seguir explorando
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
