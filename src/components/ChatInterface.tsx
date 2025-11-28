import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, X, Loader2 } from 'lucide-react';
import { solveGeometryProblem } from '../services/geminiService';
import { useGeometryStore } from '../store/geometryStore';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

interface Props {
    onClose: () => void;
}

export default function ChatInterface({ onClose }: Props) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            text: '👋 ¡Hola! Soy tu asistente de geometría con IA.\n\nEscribe problemas como:\n• "Encuentra la intersección de la recta por (0,0,0) dirección (1,1,1) con el plano z=10"\n• "Dibuja un triángulo con vértices en (0,0,0), (5,0,0) y (0,5,0)"\n• "Crea un plano perpendicular al eje Z en z=5"'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const addElement = useGeometryStore((state) => state.addElement);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await solveGeometryProblem(input);

            if (response.error) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: `❌ Error:\n\n${response.error}`
                }]);
            } else {
                // Add elements to the scene
                response.elements.forEach(el => addElement(el));

                // Show explanation
                const responseText = `✅ ¡Hecho! He añadido ${response.elements.length} elemento(s) a la escena.\n\n${response.explanation}`;
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: responseText
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: '❌ Error al procesar tu mensaje. Por favor, intenta de nuevo.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute bottom-4 right-4 w-96 h-[560px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden z-50">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-yellow-300 animate-pulse" />
                    <div>
                        <h3 className="font-bold">Asistente IA</h3>
                        <p className="text-xs text-purple-100">Gemini Flash</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/80">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-700'
                            }`}>
                            {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm max-w-[75%] whitespace-pre-line ${msg.role === 'assistant'
                                ? 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none'
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-purple-100 text-purple-600">
                            <Loader2 size={16} className="animate-spin" />
                        </div>
                        <div className="p-3 rounded-2xl text-sm bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none">
                            <span className="text-purple-600">Pensando...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder="Describe el problema..."
                        disabled={isLoading}
                        className="flex-1 px-3 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-purple-500 border rounded-xl text-sm outline-none transition-all disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
