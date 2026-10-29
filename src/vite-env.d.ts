/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

/** Identificador del build (lo inyecta vite.config.ts). */
declare const __BUILD_ID__: string;

interface ImportMetaEnv {
    readonly VITE_ENABLE_AI: string
    readonly VITE_AI_PROVIDER: string
    readonly VITE_GROQ_API_KEY: string
    readonly VITE_GEMINI_API_KEY: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
