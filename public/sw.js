/*
 * Service worker "suicida" (solo migración, 2026-10-29).
 *
 * Las versiones antiguas de la app precacheaban el index.html y lo servían
 * siempre: quien ya la tenía abierta seguía viendo la versión vieja tras cada
 * despliegue, y la versión vieja no podía avisar de que había una nueva.
 *
 * Este script sustituye a /sw.js una sola vez:
 *   1. borra las cachés antiguas,
 *   2. se desregistra a sí mismo,
 *   3. recarga las pestañas abiertas (ya sin service worker, van a la red).
 *
 * La app nueva registra el service worker real en /sw2.js (ver vite.config.ts).
 * Si por lo que sea /sw.js volviera a registrarse, la marca en IndexedDB evita
 * que recargue otra vez en bucle: solo limpia y se desregistra.
 */

const FLAG_DB = 'sw-kill-flag';
const FLAG_STORE = 'flags';
const FLAG_KEY = 'cleaned';

function openFlagDb() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(FLAG_DB, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(FLAG_STORE)) {
          req.result.createObjectStore(FLAG_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function readFlag() {
  return openFlagDb().then(
    (db) =>
      new Promise((resolve) => {
        if (!db) return resolve(false);
        try {
          const tx = db.transaction(FLAG_STORE, 'readonly');
          const get = tx.objectStore(FLAG_STORE).get(FLAG_KEY);
          get.onsuccess = () => resolve(Boolean(get.result));
          get.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      })
  );
}

function writeFlag() {
  return openFlagDb().then(
    (db) =>
      new Promise((resolve) => {
        if (!db) return resolve();
        try {
          const tx = db.transaction(FLAG_STORE, 'readwrite');
          tx.objectStore(FLAG_STORE).put(Date.now(), FLAG_KEY);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      })
  );
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const alreadyCleaned = await readFlag();

      // Reclamar las pestañas abiertas: sin esto, `navigate()` puede no
      // aplicarse a clientes que nunca estuvieron controlados por este worker.
      try {
        await self.clients.claim();
      } catch {
        /* sin clientes */
      }

      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch {
        /* sin cachés que borrar */
      }

      try {
        await self.registration.unregister();
      } catch {
        /* ya no estaba registrado */
      }

      // Solo recargamos una vez: si /sw.js se volviera a registrar, no habría bucle.
      if (alreadyCleaned) return;
      await writeFlag();

      try {
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        await Promise.all(
          clients.map((client) => client.navigate(client.url).catch(() => undefined))
        );
      } catch {
        /* sin pestañas que recargar */
      }
    })()
  );
});
