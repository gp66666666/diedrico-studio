// Feature Flags Configuration
export const FEATURES = {
    // El panel existe siempre (así se puede explicar qué pasa), pero el
    // asistente se puede pausar: `VITE_AI_ENABLED=false` lo deja en aviso y el
    // servidor (ai-proxy, secreto AI_ENABLED) es quien corta de verdad.
    AI_ASSISTANT: true,
    AI_ENABLED: (import.meta.env.VITE_AI_ENABLED ?? 'true') === 'true',
} as const;

export const AI_CONFIG = {
    // Proveedor activo. La clave NO está en el cliente: ver supabase/functions/ai-proxy.
    provider: (import.meta.env.VITE_AI_PROVIDER || 'groq') as 'gemini' | 'groq',

    // Gemini (legacy, sin clave en el cliente)
    geminiModel: 'gemini-1.5-pro-latest',

    // Groq (se llama a través del proxy; el modelo real lo fija la Edge Function)
    groqModel: 'openai/gpt-oss-120b',

    // Common config
    maxTokens: 4096,
    temperature: 0.1,
    maxRetries: 3,
} as const;
