/**
 * Paddle.js: abre el pago encima de la app (overlay).
 *
 * Paddle devuelve una URL del tipo `https://diedricostudio.com?_ptxn=txn_...`.
 * Esa URL sola no cobra nada: quien abre el checkout es Paddle.js, que necesita
 * un **token de cliente** (público, va en el bundle) y el ID de la transacción
 * que ha creado el servidor.
 *
 * El token se crea en Paddle: My account > Settings > Authentication >
 * Client-side tokens. En sandbox empieza por `test_`; en live, por `live_`.
 */

declare global {
    interface Window {
        Paddle?: {
            Environment: { set: (env: 'sandbox' | 'production') => void };
            Initialize: (options: Record<string, unknown>) => void;
            Checkout: { open: (options: Record<string, unknown>) => void };
        };
    }
}

const CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
const PADDLE_ENV = (import.meta.env.VITE_PADDLE_ENV ?? 'sandbox') as 'sandbox' | 'live';

/** ¿Se puede abrir el overlay? Si no hay token, la compra no se anuncia. */
export const paddleReady = Boolean(CLIENT_TOKEN);

let loading: Promise<NonNullable<Window['Paddle']>> | null = null;

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Paddle.js no se ha cargado')), {
                once: true,
            });
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Paddle.js no se ha cargado'));
        document.head.appendChild(script);
    });
}

/** Carga Paddle.js una sola vez y lo configura (Initialize solo se puede llamar una vez). */
export async function getPaddle(): Promise<NonNullable<Window['Paddle']>> {
    if (!CLIENT_TOKEN) throw new Error('Faltan los pagos por configurar');
    if (!loading) {
        loading = (async () => {
            await loadScript('https://cdn.paddle.com/paddle/v2/paddle.js');
            const paddle = window.Paddle;
            if (!paddle) throw new Error('Paddle.js no se ha cargado');
            if (PADDLE_ENV === 'sandbox') paddle.Environment.set('sandbox');
            paddle.Initialize({
                token: CLIENT_TOKEN,
                // Aviso al resto de la app: al terminar, que refresque el saldo.
                eventCallback: (event: { name?: string }) => {
                    if (event?.name === 'checkout.completed') {
                        window.dispatchEvent(new CustomEvent('paddle:completed'));
                    }
                },
                checkout: {
                    settings: {
                        displayMode: 'overlay',
                        locale: 'es',
                        theme: 'light',
                    },
                },
            });
            return paddle;
        })();
    }
    return loading;
}

/** Abre el pago de una transacción ya creada por `paddle-checkout`. */
export async function openPaddleCheckout(transactionId: string): Promise<void> {
    const paddle = await getPaddle();
    paddle.Checkout.open({ transactionId });
}
