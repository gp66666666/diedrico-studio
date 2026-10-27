/**
 * IndexNow: avisa a Bing (y a los buscadores que lo aceptan) de las URLs del
 * sitemap justo después de desplegar. No sustituye a Search Console, pero
 * acelera la indexación de las páginas nuevas.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const HOST = 'diedricostudio.com';
const KEY = '220e338db744f375db54db05e1ebc2dc';
const KEY_FILE = path.resolve('dist/' + KEY + '.txt');
const SITEMAP = path.resolve('dist/sitemap.xml');

const key = (await readFile(KEY_FILE, 'utf8')).trim();
const xml = await readFile(SITEMAP, 'utf8');
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (key !== KEY) {
    console.error('[indexnow] la clave del archivo no coincide');
    process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList,
    }),
});

console.log(`[indexnow] ${res.status} · ${urlList.length} URLs`);
if (!res.ok && res.status !== 202) {
    console.error(await res.text());
    process.exit(1);
}
