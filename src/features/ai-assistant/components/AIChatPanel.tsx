// AI Chat Panel - Main UI Component - CON ARRASTRE CORREGIDO
import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, PlayCircle, StepForward, RotateCcw, X, ChevronDown, ChevronRight, Move, ClipboardCheck } from 'lucide-react';
import { useAIAssistant } from '../hooks/useAIAssistant';
import AIMessageBubble from './AIMessageBubble';
import AIStepsList from './AIStepsList';
import SupportModal from '../../../components/Auth/SupportModal';
import { SUPPORT } from '../../../config/support';
import { creditsEnabled } from '../../../config/credits';
import BuyCreditsModal from '../../../components/Auth/BuyCreditsModal';
import { useUserStore } from '../../../store/userStore';
import { useAIStore } from '../store/aiStore';
import { useGeometryStore } from '../../../store/geometryStore';
import { trackEvent } from '../../../lib/analytics';

interface AIChatPanelProps {
    isSidebarOpen?: boolean;
}

interface Position {
    x: number;
    y: number;
}

export default function AIChatPanel({ isSidebarOpen = false }: AIChatPanelProps) {
    const [input, setInput] = useState('');
    const [isMinimized, setIsMinimized] = useState(true);
    const [isStepsExpanded, setIsStepsExpanded] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showBuyCredits, setShowBuyCredits] = useState(false);

    // El asistente es función premium: el panel se ve, pero sin plan no gasta tokens.
    const { isPremium, profile, user, checkSession } = useUserStore();
    const credits = profile?.credits ?? 0;
    const elements = useGeometryStore((s) => s.elements);

    // Estados para arrastre
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const panelRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
    const [expandedOffset, setExpandedOffset] = useState<Position>({ x: 0, y: 0 });

    // Detectar si es móvil y calcular posición inicial UNA SOLA VEZ
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Si cambia el tamaño de la ventana, recolocar el botón dentro
    useEffect(() => {
        const handleResize = () => setPosition((p) => clampPosition(p));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /**
     * Mantiene el botón dentro de la pantalla. Sin esto, una posición guardada
     * en un monitor grande deja el asistente fuera de la vista al abrir el
     * portátil: el botón desaparece y no hay forma de recuperarlo.
     */
    const clampPosition = (p: Position): Position => {
        const buttonSize = 56;
        const margin = 8;
        const maxX = Math.max(margin, window.innerWidth - buttonSize - margin);
        const maxY = Math.max(margin, window.innerHeight - buttonSize - margin);
        return {
            x: Math.min(Math.max(p.x, margin), maxX),
            y: Math.min(Math.max(p.y, margin), maxY),
        };
    };

    // Inicializar posición DESPUÉS de que se detecte si es móvil
    useEffect(() => {
        if (!isInitialized) {
            const savedPosition = localStorage.getItem('aiChatPosition');

            if (savedPosition) {
                try {
                    const parsed = JSON.parse(savedPosition);
                    setPosition(clampPosition(parsed));
                } catch (e) {
                    console.log('Error loading saved position, using default');
                    // Si hay error, usar posición por defecto
                    setDefaultPosition();
                }
            } else {
                // Si no hay posición guardada, usar posición por defecto (derecha, centrado vertical)
                setDefaultPosition();
            }

            setIsInitialized(true);
        }
    }, [isInitialized]);

    // Función para establecer posición por defecto
    const setDefaultPosition = () => {
        const buttonSize = 56; // w-14 h-14 = 56px
        const margin = 20;

        // Derecha del todo con margen
        const initialX = window.innerWidth - buttonSize - margin;

        // Centrado verticalmente exacto
        const initialY = (window.innerHeight / 2) - (buttonSize / 2);

        setPosition({ x: initialX, y: initialY });
    };

    const {
        messages,
        isProcessing,
        currentStep,
        error,
        sendPrompt,
        generateStatement,
        reviewScene,
        executeSteps,
        executeNextStep,
        reset,
    } = useAIAssistant();

    // Modo del asistente: resolver un enunciado o inventar uno nuevo.
    const [mode, setMode] = useState<'solve' | 'generate'>('solve');

    // Consultas gratuitas al día. El servidor es quien manda y manda cuántas
    // quedan en cada respuesta (X-AI-Trial-Left); el contador local es solo la
    // primera estimación antes de hablar con él.
    const TRIAL = SUPPORT.freePerDay;
    const [trialUsed, setTrialUsed] = useState(() => {
        const raw = Number(localStorage.getItem('aiTrialUsed') || '0');
        return Number.isFinite(raw) ? raw : 0;
    });
    const trialLeft = typeof profile?.trialLeft === 'number'
        ? profile.trialLeft
        : Math.max(0, TRIAL - trialUsed);

    // Límite diario: no hay nada que comprar, así que solo se avisa.
    useEffect(() => {
        if (error && /consultas gratis de hoy|límite de hoy/i.test(error)) {
            trackEvent('ai_daily_limit');
            setTrialUsed(TRIAL);
            localStorage.setItem('aiTrialUsed', String(TRIAL));
            useUserStore.getState().setTrialLeft(0);
        }
    }, [error]);

    // Al volver de pagar (Lemon Squeezy abre otra pestaña), se refresca el perfil
    // para que el saldo aparezca sin recargar la página.
    useEffect(() => {
        if (!user) return;
        const onVisible = () => {
            if (document.visibilityState === 'visible') void checkSession();
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [user, checkSession]);

    // Guardar posición al cambiar
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('aiChatPosition', JSON.stringify(position));
        }
    }, [position, isInitialized]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || isProcessing) return;

        // Sin Premium se deja intentar: los 3 primeros mensajes son gratis.
        // A partir de ahí el servidor devuelve 402 y se abre el modal.
        if (mode === 'generate') {
            await generateStatement(input);
        } else {
            await sendPrompt(input);
        }

        if (!useAIStore.getState().error) {
            trackEvent('ai_message', { premium: isPremium });
        }

        // Solo se gasta prueba si quedaba: si el mensaje fue con saldo, el saldo
        // ya lo ha actualizado el proxy (cabecera X-AI-Credits).
        if (!isPremium && !useAIStore.getState().error && trialLeft > 0) {
            const used = Math.min(TRIAL, trialUsed + 1);
            setTrialUsed(used);
            localStorage.setItem('aiTrialUsed', String(used));
        }

        setInput('');
    };

    /** Desde una tarjeta de enunciado: cambia a resolver y lanza el ejercicio. */
    const handleSolveStatement = async (statement: string) => {
        setMode('solve');
        await sendPrompt(statement);
    };

    // FUNCIONES PARA ARRASTRE
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();

        // En modo expandido, prevenir arrastre en input, botón y textarea (excepto el de cerrar)
        if (!isMinimized) {
            const target = (e.target as HTMLElement);
            // Permitir arrastre desde el header del panel (área de título)
            const isHeader = target.closest('[data-drag-area="header"]');

            // Solo prevenir arrastre en elementos interactivos excepto en el header
            if (!isHeader && target.closest('input, button, textarea')) {
                return;
            }
        }

        setIsDragging(true);
        setHasMoved(false);

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        setStartPos({ x: clientX, y: clientY });

        // Calculamos el offset del drag relativo a la posición real en pantalla
        // En el nuevo sistema, la posición real de la esquina superior izquierda es:
        // position.x + expandedOffset.x
        const currentRealX = position.x + expandedOffset.x;
        const currentRealY = position.y + expandedOffset.y;

        setDragOffset({
            x: clientX - currentRealX,
            y: clientY - currentRealY
        });

        document.body.style.userSelect = 'none';
        document.body.style.touchAction = 'none';
    };


    const handleDrag = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        // Calcular distancia recorrida desde el inicio
        const distance = Math.sqrt(
            Math.pow(clientX - startPos.x, 2) +
            Math.pow(clientY - startPos.y, 2)
        );

        // Si se mueve más de 5px, marcar como movido
        if (distance > 5 && !hasMoved) {
            setHasMoved(true);
        }

        let newRealX = clientX - dragOffset.x;
        let newRealY = clientY - dragOffset.y;

        // Calcular límites para el panel real (ya sea 56px o 384px)
        const panelWidth = isMinimized ? 56 : (isMobile ? window.innerWidth - 20 : 384);
        const panelHeight = isMinimized ? 56 : (isMobile ? window.innerHeight - 100 : 600);

        const maxX = window.innerWidth - panelWidth;
        const maxY = window.innerHeight - panelHeight;

        // Limitar a los bordes con márgenes
        const margin = 10;
        newRealX = Math.max(margin, Math.min(newRealX, maxX - margin));
        newRealY = Math.max(margin, Math.min(newRealY, maxY - margin));

        // Actualizamos la posición base restando el offset actual
        // para que el anchor 'position' sea consistente
        setPosition({
            x: newRealX - expandedOffset.x,
            y: newRealY - expandedOffset.y
        });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        document.body.style.userSelect = '';
        document.body.style.touchAction = '';

        // Solo procesar el "snap" o ajustes de posición si realmente hubo movimiento (arrastre)
        // Esto evita que ocurra un salto al hacer un clic simple para abrir el panel
        if (hasMoved) {
            // Si estábamos arrastrando el panel expandido, ya absorbimos el offset en handleDragStart
            // o lo estamos haciendo aquí de forma implícita al dejar de arrastrar.

            // Snap a bordes (solo en desktop y solo para la burbuja minimizada)
            if (!isMobile && isMinimized) {
                const buttonSize = 56;
                const maxX = window.innerWidth - buttonSize;

                // Snap a derecha
                if (position.x > maxX - 50) {
                    setPosition(prev => ({ ...prev, x: maxX - 20 }));
                }
                // Snap a izquierda
                else if (position.x < 50) {
                    setPosition(prev => ({ ...prev, x: 20 }));
                }
            }
        }
    };

    // Event listeners para arrastre
    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (e: MouseEvent) => handleDrag(e);
            const handleTouchMove = (e: TouchEvent) => {
                e.preventDefault();
                handleDrag(e);
            };
            const handleMouseUp = () => handleDragEnd();
            const handleTouchEnd = () => handleDragEnd();

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchend', handleTouchEnd);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, dragOffset, position, isMinimized, isMobile]);

    // Ajustar posición cuando cambia el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            const buttonSize = 56;
            const margin = 20;
            const maxX = window.innerWidth - buttonSize - margin;
            const maxY = window.innerHeight - buttonSize - margin;

            setPosition(prev => ({
                x: Math.min(prev.x, maxX),
                y: Math.min(prev.y, maxY)
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const lastMessage = messages[messages.length - 1];
    const hasSteps = lastMessage?.steps && lastMessage.steps.length > 0;

    // No renderizar hasta tener la posición calculada
    if (!isInitialized) {
        return null;
    }

    return (
        <div
            ref={panelRef}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: '56px',
                height: '56px',
                zIndex: isMinimized ? 9999 : 9998,
                pointerEvents: 'none', // El contenedor anchor no bloquea, sus hijos sí
                overflow: 'visible'    // Permitir que el panel crezca fuera del área 56x56
            }}
            className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}
        >
            <div
                style={{
                    position: 'absolute',
                    left: `${expandedOffset.x}px`,
                    top: `${expandedOffset.y}px`,
                    width: isMinimized ? '56px' : (isMobile ? 'calc(100vw - 20px)' : '384px'),
                    height: isMinimized ? '56px' : (isMobile ? '80vh' : '600px'),
                    maxWidth: 'calc(100vw - 20px)',
                    zIndex: 2,
                    pointerEvents: 'auto',
                    cursor: isMinimized ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    transform: isMinimized ? (isDragging ? 'scale(1.1)' : 'scale(1)') : (isDragging ? 'scale(1.02)' : 'scale(1)'),
                    transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    touchAction: 'none',
                    borderRadius: isMinimized ? '9999px' : '0.5rem',
                }}
                className={isMinimized ? '' : 'bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col'}
                onMouseDown={isMinimized ? handleDragStart : undefined}
                onTouchStart={isMinimized ? handleDragStart : undefined}
            >
                {isMinimized ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!hasMoved) {
                                setIsMinimized(false);
                                const panelWidth = isMobile ? window.innerWidth - 20 : 384;
                                const panelHeight = isMobile ? window.innerHeight * 0.8 : 600;
                                const margin = 10;
                                let offsetX = 0;
                                let offsetY = 0;

                                // Calculamos el offset relativo al anchor (0,0)
                                if (position.x + panelWidth > window.innerWidth - margin) {
                                    offsetX = window.innerWidth - panelWidth - margin - position.x;
                                }
                                if (position.y + panelHeight > window.innerHeight - margin) {
                                    offsetY = window.innerHeight - panelHeight - margin - position.y;
                                }
                                if (position.x + offsetX < margin) offsetX = margin - position.x;
                                if (position.y + offsetY < margin) offsetY = margin - position.y;

                                setExpandedOffset({ x: offsetX, y: offsetY });
                            }
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            setIsMinimized(!isMinimized);
                        }}
                        className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl w-full h-full flex items-center justify-center border-none outline-none"
                        style={{
                            boxShadow: '0 10px 25px -5px rgba(147, 51, 234, 0.5), 0 10px 10px -5px rgba(147, 51, 234, 0.1)',
                        }}
                        aria-label="Abrir chat de IA"
                    >
                        <Sparkles size={24} className={isDragging ? 'opacity-80' : ''} />
                        {messages.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                {messages.length}
                            </span>
                        )}
                        {!isDragging && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-gray-800/30 text-white/60 p-0.5 rounded-full">
                                <Move size={8} />
                            </div>
                        )}
                    </button>
                ) : (
                    <>
                        {/* Header - Area de arrastre */}
                        <div
                            data-drag-area="header"
                            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg select-none"
                            style={{
                                cursor: isDragging ? 'grabbing' : 'grab',
                                touchAction: 'none'
                            }}
                            onMouseDown={handleDragStart}
                            onTouchStart={handleDragStart}
                        >
                            <div className="flex items-center gap-2">
                                <Move size={16} className="text-white/80" />
                                <Sparkles size={20} className="text-white" />
                                <h3 className="font-semibold text-white">Asistente IA</h3>
                            </div>
                            <div className="flex gap-2">
                                {messages.length > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            reset();
                                        }}
                                        className="text-white/80 hover:text-white transition-colors p-1"
                                        title="Reiniciar conversación"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMinimized(true);
                                        setExpandedOffset({ x: 0, y: 0 });
                                    }}
                                    className="text-white/80 hover:text-white transition-colors p-1"
                                    title="Minimizar"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: isMobile ? '50vh' : '400px' }}>
                            {messages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-sm">
                                        {mode === 'generate'
                                            ? 'Dime el tema y te planteo un ejercicio nuevo'
                                            : 'Escribe un ejercicio de geometría descriptiva'}
                                        <br />
                                        {mode === 'generate'
                                            ? 'y, si quieres, lo resolvemos y dibujamos'
                                            : 'y lo resolveré paso a paso'}
                                    </p>
                                    <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                                        <p>Ejemplo:</p>
                                        <p className="italic mt-1 text-[10px]">
                                            "Por el punto A(-1.4, 6.5, 7.2) hacer pasar un plano perpendicular a P(6.3, 2.8, 8.6)"
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <AIMessageBubble
                                        key={message.id}
                                        message={message}
                                        onSolveStatement={handleSolveStatement}
                                    />
                                ))
                            )}

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            {isProcessing && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                                    <span>Pensando...</span>
                                </div>
                            )}
                        </div>

                        {/* Steps Control */}
                        {hasSteps && (
                            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                                <button
                                    onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                                    className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                >
                                    <span>Pasos de Ejecución ({lastMessage.steps!.length})</span>
                                    {isStepsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>

                                {isStepsExpanded && (
                                    <div className="mb-3">
                                        <AIStepsList steps={lastMessage.steps!} currentStep={currentStep} />
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={executeSteps}
                                        disabled={isProcessing}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <PlayCircle size={18} />
                                        <span className="text-sm font-medium">Ejecutar Todo</span>
                                    </button>
                                    <button
                                        onClick={executeNextStep}
                                        disabled={isProcessing}
                                        className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        title="Siguiente paso"
                                    >
                                        <StepForward size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
                            {elements.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                                        void reviewScene(lastUser?.content || '');
                                    }}
                                    disabled={isProcessing}
                                    className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-500/30 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                                >
                                    <ClipboardCheck size={14} /> Revisar mi dibujo ({elements.length})
                                </button>
                            )}
                            <div className="mb-2 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 dark:bg-gray-700/50 p-1">
                                <button
                                    type="button"
                                    onClick={() => setMode('solve')}
                                    className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${mode === 'solve'
                                        ? 'bg-white text-purple-700 shadow-sm dark:bg-gray-600 dark:text-white'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300'
                                        }`}
                                >
                                    Resolver enunciado
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('generate')}
                                    className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${mode === 'generate'
                                        ? 'bg-white text-purple-700 shadow-sm dark:bg-gray-600 dark:text-white'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300'
                                        }`}
                                >
                                    Crear ejercicio
                                </button>
                            </div>
                            {user && creditsEnabled && (
                                <button
                                    type="button"
                                    onClick={() => setShowBuyCredits(true)}
                                    className="w-full mb-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-800 transition-colors hover:bg-violet-100 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                                >
                                    {trialLeft === 0 && credits === 0
                                        ? '¿Necesitas más hoy? Hay packs de consultas'
                                        : 'Comprar consultas (no caducan)'}
                                </button>
                            )}
                            {user ? (
                                <button
                                    type="button"
                                    onClick={() => setShowSupportModal(true)}
                                    className="w-full mb-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                                >
                                    <Sparkles size={13} />
                                    {trialLeft > 0
                                        ? `Gratis: te quedan ${trialLeft} de ${TRIAL} consultas hoy`
                                        : credits > 0
                                            ? `Saldo: ${credits} ${credits === 1 ? 'consulta' : 'consultas'}`
                                            : 'Has usado tus consultas de hoy · mañana hay más'}
                                </button>
                            ) : (
                                <div className="w-full mb-2 flex items-center justify-center gap-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 px-3 py-2 text-xs font-medium text-sky-800 dark:text-sky-300">
                                    <Sparkles size={13} />
                                    {SUPPORT.freeAnon} consulta de prueba · gratis con cuenta:
                                    {` ${TRIAL} al día`}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        trialLeft > 0 || credits > 0
                                            ? mode === 'generate'
                                                ? 'Ej: intersección de plano y recta'
                                                : 'Escribe un ejercicio...'
                                            : 'Vuelve mañana: 3 consultas cada día'
                                    }
                                    disabled={isProcessing}
                                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-gray-900 dark:text-white"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isProcessing}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    aria-label="Enviar"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                        <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
                        <BuyCreditsModal isOpen={showBuyCredits} onClose={() => setShowBuyCredits(false)} />
                    </>
                )}
            </div>
        </div>
    );
}