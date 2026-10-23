import { useEffect, useState } from 'react';
import { X, Sparkles, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { CREDIT_PACKS, creditsEnabled, startCheckout, type CreditPack } from '../../config/credits';
import { useUserStore } from '../../store/userStore';
import { useModalA11y } from '../../hooks/useModalA11y';
import { trackEvent } from '../../lib/analytics';
import { supabase } from '../../lib/supabase';
import { openPaddleCheckout, paddleReady } from '../../lib/paddlejs';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Compra de consultas. Solo se muestra si hay tienda configurada (si no, el
 * botón que abre este modal ni siquiera existe) y siempre explica que el cobro
 * lo hace Paddle, no esta web.
 *
 * El precio y los créditos no viajan desde aquí: se piden a `paddle-checkout`,
 * que los resuelve con su catálogo. Esta pantalla solo manda qué pack quiere.
 */
export default function BuyCreditsModal({ isOpen, onClose }: Props) {
    const { user, profile } = useUserStore();
    const panelRef = useModalA11y(isOpen, onClose);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) trackEvent('credits_modal_open');
        else {
            setBusy(null);
            setError(null);
        }
    }, [isOpen]);

    const buy = async (pack: CreditPack) => {
        if (!user) return;
        setBusy(pack.id);
        setError(null);
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) throw new Error('Vuelve a iniciar sesión para comprar.');

            trackEvent('credits_checkout_click', { pack: pack.id });
            const { transactionId, checkoutUrl } = await startCheckout(pack, { accessToken: token });

            if (transactionId && paddleReady) {
                // Overlay de Paddle encima de la app: aquí nunca se ven los
                // datos de la tarjeta.
                await openPaddleCheckout(transactionId);
                setBusy(null);
                return;
            }
            if (checkoutUrl && !paddleReady) {
                throw new Error(
                    'Los pagos no están configurados en esta web (falta el token de Paddle).'
                );
            }
            window.location.href = checkoutUrl!;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se ha podido abrir el pago.');
            setBusy(null);
        }
    };

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
                        <button
                            key={pack.id}
                            type="button"
                            disabled={!user || busy !== null}
                            onClick={() => void buy(pack)}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${user
                                ? 'border-violet-300 bg-violet-50 hover:bg-violet-100 disabled:opacity-60 dark:border-violet-500/40 dark:bg-violet-500/10 dark:hover:bg-violet-500/20'
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
                                {busy === pack.id ? (
                                    <>
                                        Abriendo pago… <Loader2 size={14} className="animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        {pack.priceLabel} <ExternalLink size={14} />
                                    </>
                                )}
                            </span>
                        </button>
                    ))}

                    {error && (
                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                            {error}
                        </p>
                    )}

                    {!user && (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Inicia sesión para comprar: necesitamos saber a qué cuenta acreditar las
                            consultas.
                        </p>
                    )}

                    <p className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                        El cobro lo hace Paddle (tarjeta o PayPal). Emite la factura con IVA y
                        gestiona el pago; esta web nunca ve los datos de tu tarjeta. Al terminar
                        vuelves aquí y el saldo aparece en unos segundos.
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
