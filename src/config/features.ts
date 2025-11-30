// Feature Flags Configuration
export const FEATURES = {
    AI_ASSISTANT: import.meta.env.VITE_ENABLE_AI === 'true',
} as const;

export const AI_CONFIG = {
    // Provider: 'gemini' or 'groq'
    provider: (import.meta.env.VITE_AI_PROVIDER || 'groq') as 'gemini' | 'groq',

    // Gemini config
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    geminiModel: 'gemini-1.5-pro-latest',

    // Groq config (más fácil de configurar)
    groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
    groqModel: 'llama-3.3-70b-versatile',

    // Common config
    maxTokens: 4096,
    temperature: 0.1,
    maxRetries: 3,
} as const;
