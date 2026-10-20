import type { GeometryElement } from '../types';

/**
 * Compartir un ejercicio sin cuentas ni base de datos: el dibujo viaja
 * comprimido dentro del propio enlace.
 *
 * Formato: `?e=z<payload>` (z = deflate + base64url, j = JSON + base64url).
 * Con 20 elementos suele quedar en unos cientos de caracteres.
 */

export interface SharePayload {
    v: 1;
    title?: string;
    e: GeometryElement[];
}

const toBase64Url = (bytes: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (value: string): Uint8Array => {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
};

/** Deja solo lo necesario para reconstruir el dibujo (sin ids ni historial). */
const slim = (elements: GeometryElement[]): GeometryElement[] =>
    elements
        .filter((el) => el.type !== 'group')
        .map((el) => {
            const { ...rest } = el;
            return rest;
        });

export async function encodeScene(elements: GeometryElement[], title?: string): Promise<string> {
    const payload: SharePayload = { v: 1, title, e: slim(elements) };
    const bytes = new TextEncoder().encode(JSON.stringify(payload));

    if (typeof CompressionStream !== 'undefined') {
        try {
            const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
            const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
            return 'z' + toBase64Url(compressed);
        } catch {
            // navegador sin deflate-raw: se cae al JSON plano
        }
    }

    return 'j' + toBase64Url(bytes);
}

export async function decodeScene(value: string): Promise<SharePayload | null> {
    try {
        const kind = value[0];
        const bytes = fromBase64Url(value.slice(1));

        let json: string;
        if (kind === 'z') {
            if (typeof DecompressionStream === 'undefined') return null;
            const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
            json = await new Response(stream).text();
        } else {
            json = new TextDecoder().decode(bytes);
        }

        const parsed = JSON.parse(json) as SharePayload;
        if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.e)) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function buildShareUrl(payload: string): string {
    const base = `${window.location.origin}/`;
    return `${base}?e=${payload}`;
}
