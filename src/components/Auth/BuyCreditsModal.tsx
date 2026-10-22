import { useEffect } from 'react';
import { X, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { createPortal } from 'react-dom';
import { CREDIT_PACKS, checkoutUrl, creditsEnabled } from '../../config/credits';
import { useUserStore } from '../../store/userStore';
import { useModalA11y } from '../../hooks/useModalA11y';
import { trackEvent } from '../../lib/analytics';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Compra de consultas. Solo se muestra si hay tienda configurada (si no, el
 * botón que abre este modal ni siquiera existe) y siempre explica que el cobro
 * lo hace Lemon Squeezy, no esta web.
 */
export default function BuyCreditsModal({ isOpen, onClose }: Props) {
    const { user, profile } = useUserStore();
    const panelRef = useModalA11y(isOpen, onClose);

    useEffect(() => {
        if (isOpen) trackEvent('credits_modal_open');
    }, [isOpen]);

    if (!isOpen || !creditsEnabled) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Comprar consultas"
                tabIndex={-1}
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl outline-none dark:bg-gray-800"
            >
                <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-lg p-1 transition-colors hover:bg-white/20"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                    <div className="mb-1 flex items-center gap-3">
                        <Sparkles size={28} />
                        <h2 className="text-2xl font-bold">Más consultas</h2>
                    </div>
                    <p className="text-sm text-white/90">
                        Las de regalo se renuevan cada día. Estas no caducan.
                    </p>
                </div>

                <div className="space-y-3 p-6">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                        Ahora mismo tienes <b>3 consultas gratis al día</b>
                        {profile?.credits ? ` y ${profile.credits} de saldo` : ''}. El saldo se gasta
                        solo cuando ya has usado las del día.
                    </div>

                    {CREDIT_PACKS.map((pack) => (
                        <a
                            key={pack.id}
                            href={user ? checkoutUrl(pack, { userId: user.id, email: user.email ?? undefined }) : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                                if (!user) return;
                                trackEvent('credits_checkout_click', { pack: pack.id });
                            }}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${user
                                ? 'border-violet-300 bg-violet-50 hover:bg-violet-100 dark:border-violet-500/40 dark:bg-violet-500/10 dark:hover:bg-violet-500/20'
                                : 'pointer-events-none border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-900/40'
                                }`}
                        >
                            <span>
                                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                                    {pack.credits} consultas
                                </span>
                                <span className="block text-xs text-gray-600 dark:text-gray-400">
                                    No caducan
                                </span>
                            </span>
                            <span className="flex items-center gap-2 text-sm font-bold text-violet-700 dark:text-violet-300">
                                {pack.priceLabel} <ExternalLink size={14} />
                            </span>
                        </a>
                    ))}

                    {!user && (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Inicia sesión para comprar: necesitamos saber a qué cuenta acreditar las
                            consultas.
                        </p>
                    )}

                    <p className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                        El cobro lo hace Lemon Squeezy (tarjeta o PayPal). Emite la factura con IVA y
                        gestiona el pago; esta web nunca ve los datos de tu tarjeta.
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full rounded-xl py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
