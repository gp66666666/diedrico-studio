// AI Chat Panel - Main UI Component - CON ARRASTRE CORREGIDO
import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, PlayCircle, StepForward, RotateCcw, X, ChevronDown, ChevronRight, Move } from 'lucide-react';
import { useAIAssistant } from '../hooks/useAIAssistant';
import AIMessageBubble from './AIMessageBubble';
import AIStepsList from './AIStepsList';

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

    // Inicializar posición DESPUÉS de que se detecte si es móvil
    useEffect(() => {
        if (!isInitialized) {
            const savedPosition = localStorage.getItem('aiChatPosition');

            if (savedPosition) {
                try {
                    const parsed = JSON.parse(savedPosition);
                    setPosition(parsed);
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
        executeSteps,
        executeNextStep,
        reset,
    } = useAIAssistant();

    // Guardar posición al cambiar
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('aiChatPosition', JSON.stringify(position));
        }
    }, [position, isInitialized]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || isProcessing) return;

        await sendPrompt(input);
        setInput('');
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
                                        Escribe un ejercicio de geometría descriptiva
                                        <br />
                                        y lo resolveré paso a paso
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
                                    <AIMessageBubble key={message.id} message={message} />
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
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Escribe un ejercicio..."
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
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}