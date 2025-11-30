// AI Message Bubble Component
import { useState } from 'react';
import type { AIMessage } from '../types/ai.types';
import { User, Sparkles, Copy, Check } from 'lucide-react';

interface Props {
    message: AIMessage;
}

export default function AIMessageBubble({ message }: Props) {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
            <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                    {isUser ? <User size={16} className="text-white" /> : <Sparkles size={16} className="text-white" />}
                </div>

                {/* Content */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
                    <div className={`relative group rounded-2xl px-4 py-3 ${isUser
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700'
                        }`}>
                        {/* Copy Button (Visible on hover for assistant messages) */}
                        {!isUser && (
                            <button
                                onClick={handleCopy}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-700/50 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                                title="Copiar respuesta"
                            >
                                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                        )}

                        <div className="whitespace-pre-wrap text-sm leading-relaxed pr-6">
                            {message.content}
                        </div>
                    </div>

                    {/* Timestamp */}
                    <div className={`text-[10px] mt-1 px-1 ${isUser ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
