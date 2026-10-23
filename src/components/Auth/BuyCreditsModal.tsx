import { useEffect, useState } from 'react';
import { X, Sparkles, ExternalLink, ShieldCheck, Loader2, BookOpen } from 'lucide-react';
import { createPortal } from 'react-dom';
import {
    GROUP_TITLES,
    PLANS,
    creditsEnabled,
    startCheckout,
    type CreditPlan,
    type PlanGroup,
} from '../../config/credits';
import { useUserStore } from '../../store/userStore';
import { useModalA11y } from '../../hooks/useModalA11y';
import { trackEvent } from '../../lib/analytics';
import { supabase } from '../../lib/supabase';
import { openPaddleCheckout, paddleReady } from '../../lib/paddlejs';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const GROUP_ORDER: PlanGroup[] = ['packs', 'suscripcion', 'profesor'];

/**
 * Planes y compra de consultas.
 *
 * Solo se muestra si hay tienda configurada (bandera + token de Paddle); si no,
 * el botón que abre este modal ni siquiera existe. El precio y los créditos NO
 * viajan desde aquí: la función `paddle-checkout` los resuelve con su catálogo.
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

    const buy = async (plan: CreditPlan) => {
        if (!user) return;
        setBusy(plan.id);
        setError(null);
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) throw new Error('Vuelve a iniciar sesión para comprar.');

            trackEvent('credits_checkout_click', { plan: plan.id, kind: plan.kind });
            const { transactionId, checkoutUrl } = await startCheckout(plan, { accessToken: token });

            if (transactionId && paddleReady) {
                // Overlay de Paddle encima de la app: aquí nunca se ven los
                // datos de la tarjeta. Al pagar, Paddle vuelve a /?pago=ok.
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Comprar consultas"
                tabIndex={-1}
                className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none dark:bg-gray-800"
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
                        <Sparkles size={26} />
                        <h2 className="text-2xl font-bold">Consultas para el asistente</h2>
                    </div>
                    <p className="text-sm text-white/90">
                        Las 3 del día se renuevan solas. Lo que compras va aparte y se gasta
                        cuando ya has usado las gratis.
                    </p>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                        {user ? (
                            <>
                                Ahora mismo tienes{' '}
                                <b>{profile?.credits ?? 0} de saldo</b> y{' '}
                                <b>3 consultas gratis al día</b>.
                                {profile?.credits ? ' El saldo no caduca.' : ''}
                            </>
                        ) : (
                            <>Inicia sesión para comprar: necesitamos saber a qué cuenta acreditar las consultas.</>
                        )}
                    </div>

                    {GROUP_ORDER.map((group) => (
                        <section key={group} className="space-y-2">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                {GROUP_TITLES[group]}
                            </h3>
                            {PLANS.filter((plan) => plan.group === group).map((plan) => (
                                <button
                                    key={plan.id}
                                    type="button"
                                    disabled={!user || busy !== null}
                                    onClick={() => void buy(plan)}
                                    className={`flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                                        user
                                            ? 'border-violet-300 bg-violet-50 hover:bg-violet-100 disabled:opacity-60 dark:border-violet-500/40 dark:bg-violet-500/10 dark:hover:bg-violet-500/20'
                                            : 'pointer-events-none border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-900/40'
                                    }`}
                                >
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                            {plan.title}
                                            {plan.popular && (
                                                <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                                    el más pedido
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-0.5 block text-xs leading-snug text-gray-600 dark:text-gray-400">
                                            {plan.detail}
                                        </span>
                                    </span>
                                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-violet-700 dark:text-violet-300">
                                        {busy === plan.id ? (
                                            <>
                                                Abriendo… <Loader2 size={14} className="animate-spin" />
                                            </>
                                        ) : (
                                            <>
                                                {plan.price} <ExternalLink size={14} />
                                            </>
                                        )}
                                    </span>
                                </button>
                            ))}
                            {group === 'profesor' && (
                                <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                                    <BookOpen size={13} className="mt-0.5 shrink-0" />
                                    Al pagar recibes un código en «Mi clase»: se lo pasas a tus alumnos y cada
                                    uno lo canjea una vez.
                                </p>
                            )}
                        </section>
                    ))}

                    {error && (
                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                            {error}
                        </p>
                    )}

                    <p className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                        El cobro lo hace Paddle (tarjeta o PayPal). Emite la factura con IVA y gestiona el
                        pago; esta web nunca ve los datos de tu tarjeta. Al terminar vuelves aquí y el saldo
                        aparece en unos segundos.
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
