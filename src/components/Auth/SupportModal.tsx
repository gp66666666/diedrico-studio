import { useEffect } from 'react';
import { X, Coffee, Heart, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';
import { SUPPORT } from '../../config/support';
import { useUserStore } from '../../store/userStore';
import { useModalA11y } from '../../hooks/useModalA11y';
import { trackEvent } from '../../lib/analytics';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal de apoyo. Antes vendía un "Premium" que ya no existe: la web es gratis,
 * el asistente tiene 5 consultas al día y aquí solo se explica cómo ayudar a
 * pagar la factura de la API. Nada de precios ni de promesas.
 */
export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
    const { isPremium } = useUserStore();
    const panelRef = useModalA11y(isOpen, onClose);

    useEffect(() => {
        if (isOpen) trackEvent('support_modal_open', { premium: isPremium });
    }, [isOpen, isPremium]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Apoyar Diédrico Studio"
                tabIndex={-1}
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl outline-none dark:bg-gray-800"
            >
                <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-lg p-1 transition-colors hover:bg-white/20"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                    <div className="mb-2 flex items-center gap-3">
                        <Heart size={30} />
                        <h2 className="text-2xl font-bold">Todo esto es gratis</h2>
                    </div>
                    <p className="text-sm text-white/90">
                        Sin cuenta, sin plan, sin nada bloqueado.
                    </p>
                </div>

                <div className="space-y-4 p-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        El visor 3D, la vista diédrica, las láminas, la academia y todos los
                        ejercicios son gratis y lo serán.
                    </p>

                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        El asistente de IA es lo único que cuesta dinero de verdad: cada consulta se
                        paga a un proveedor. Por eso tiene un límite de{' '}
                        <b>{SUPPORT.freePerDay} consultas al día</b> por cuenta. No es un muro
                        publicitario: es la factura.
                    </p>

                    <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        Si quieres ayudar a pagar esa factura, puedes invitar a un café. Se agradece
                        de verdad, pero <b>no desbloquea nada</b>: no hay nada que desbloquear.
                    </p>

                    <a
                        href={SUPPORT.kofiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('support_kofi_click', { source: 'modal' })}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 font-bold text-white transition-opacity hover:opacity-90"
                    >
                        <Coffee size={18} /> Invitarme a un café <ExternalLink size={14} />
                    </a>

                    <button
                        onClick={onClose}
                        className="w-full rounded-xl py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Seguir dibujando
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
