// Feature Flags Configuration
export const FEATURES = {
    AI_ASSISTANT: true, // Force enabled for now
    // AI_ASSISTANT: import.meta.env.VITE_ENABLE_AI === 'true',
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
