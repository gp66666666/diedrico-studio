#!/usr/bin/env node
/**
 * Catálogo de Paddle: crea (o comprueba) los 5 productos y sus precios.
 *
 * Es idempotente: cada producto y cada precio llevan `custom_data.catalog_key`,
 * así que si se ejecuta dos veces no duplica nada y devuelve los mismos IDs.
 *
 * Uso:
 *   set -a; . ~/.config/opencode/env.sh; set +a
 *   node scripts/paddle-catalog.mjs                 # sandbox (por defecto)
 *   PADDLE_ENV=live node scripts/paddle-catalog.mjs  # live (pide PADDLE_LIVE_API_KEY)
 *
 * No imprime la clave. Escribe los IDs en scripts/paddle-catalog-<env>.json.
 */
import { writeFileSync } from 'node:fs';

const ENV = process.env.PADDLE_ENV ?? 'sandbox';
const BASE = ENV === 'live' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';
const KEY = ENV === 'live' ? process.env.PADDLE_LIVE_API_KEY : process.env.PADDLE_SANDBOX_API_KEY;

if (!KEY) {
  console.error(`Falta la clave: ${ENV === 'live' ? 'PADDLE_LIVE_API_KEY' : 'PADDLE_SANDBOX_API_KEY'}`);
  process.exit(1);
}

/**
 * Precios en céntimos y con `tax_mode: internal` (el precio que ve el alumno ya
 * lleva el IVA dentro). `maximum: 1` evita que alguien compre 3 packs en una
 * misma transacción y el webhook acredite solo uno.
 */
const CATALOG = [
  {
    key: 'pack100',
    product: 'Pack 100 consultas',
    description: '100 consultas al asistente de IA. No caducan.',
    priceName: 'Pack 100 consultas',
    amount: '499',
    recurring: null,
    note: '100 consultas',
  },
  {
    key: 'pack300',
    product: 'Pack 300 consultas',
    description: '300 consultas al asistente de IA. No caducan.',
    priceName: 'Pack 300 consultas',
    amount: '1199',
    recurring: null,
    note: '300 consultas',
  },
  {
    key: 'monthly',
    product: 'Plan mensual',
    description: 'Consultas de IA mientras la suscripción esté activa (tope 1.500 al mes).',
    priceName: 'Mensual',
    amount: '1499',
    recurring: { interval: 'month', frequency: 1 },
    note: 'cada mes',
  },
  {
    key: 'profe-semestre',
    product: 'Pack Profesor · semestre',
    description: 'Código de clase para 40 alumnos durante 6 meses (150 consultas por alumno).',
    priceName: 'Profesor · semestre',
    amount: '2499',
    recurring: null,
    note: '6 meses',
  },
  {
    key: 'profe-curso',
    product: 'Pack Profesor · curso',
    description: 'Código de clase para 40 alumnos durante 12 meses (300 consultas por alumno).',
    priceName: 'Profesor · curso',
    amount: '3999',
    recurring: null,
    note: '12 meses',
  },
];

async function api(path, { method = 'GET', body } = {}, attempt = 0) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    // Paddle limita las peticiones: esperar lo que pida y reintentar.
    if (res.status === 429 && attempt < 2) {
      const wait = Math.min(Number(res.headers.get('retry-after') ?? 2), 10) * 1000;
      console.log(`   … límite de peticiones, espero ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
      return api(path, { method, body }, attempt + 1);
    }
    const err = json?.error ?? json;
    throw new Error(`${method} ${url} → HTTP ${res.status}: ${JSON.stringify(err)}`);
  }
  return json;
}

/** Recorre todas las páginas de un listado de Paddle. */
async function listAll(path) {
  const out = [];
  // `meta.pagination.next` ya viene como URL completa, pero cuando no hay más
  // páginas Paddle devuelve la MISMA url: hay que cortar o se queda en bucle.
  const seen = new Set();
  let url = `${path}?per_page=200`;
  while (url && !seen.has(url)) {
    seen.add(url);
    const page = await api(url);
    const data = page.data ?? [];
    out.push(...data);
    const next = page.meta?.pagination?.next ?? null;
    if (!next || next === url || data.length === 0) break;
    url = next;
    await new Promise((r) => setTimeout(r, 300));
  }
  return out;
}

const euro = (amount) => `${(Number(amount) / 100).toFixed(2)} €`;

async function main() {
  console.log(`Paddle ${ENV} · ${BASE}\n`);

  const products = await listAll('/products');
  const prices = await listAll('/prices');
  const rows = [];

  for (const item of CATALOG) {
    let product = products.find(
      (p) => p.status === 'active' && p.custom_data?.catalog_key === item.key
    );

    if (!product) {
      const created = await api('/products', {
        method: 'POST',
        body: {
          name: item.product,
          description: item.description,
          tax_category: 'saas',
          custom_data: { catalog_key: item.key },
        },
      });
      product = created.data;
      console.log(`+ producto ${product.id}  ${product.name}`);
    } else {
      console.log(`= producto ${product.id}  ${product.name}`);
    }

    let price = prices.find(
      (p) =>
        p.status === 'active' &&
        p.product_id === product.id &&
        p.custom_data?.catalog_key === item.key
    );

    if (!price) {
      const created = await api('/prices', {
        method: 'POST',
        body: {
          description: `${item.priceName} · ${item.recurring ? 'suscripción' : 'pago único'}`,
          name: item.priceName,
          product_id: product.id,
          unit_price: { amount: item.amount, currency_code: 'EUR' },
          tax_mode: 'internal',
          billing_cycle: item.recurring,
          quantity: { minimum: 1, maximum: 1 },
          custom_data: { catalog_key: item.key },
        },
      });
      price = created.data;
      console.log(`+ precio   ${price.id}  ${euro(item.amount)}${item.recurring ? ' / mes' : ''}`);
    } else {
      console.log(`= precio   ${price.id}  ${euro(item.amount)}${item.recurring ? ' / mes' : ''}`);
    }

    rows.push({
      key: item.key,
      productId: product.id,
      priceId: price.id,
      amount: item.amount,
      currency: 'EUR',
      taxMode: 'internal',
      recurring: item.recurring,
      note: item.note,
    });
  }

  console.log('\n| Qué | Precio | Producto | Precio (price_id) |');
  console.log('|---|---|---|---|');
  for (const r of rows) {
    console.log(
      `| ${r.key} | ${euro(r.amount)}${r.recurring ? ' / mes' : ''} | ${r.productId} | ${r.priceId} |`
    );
  }

  const file = `scripts/paddle-catalog-${ENV}.json`;
  writeFileSync(file, JSON.stringify({ environment: ENV, createdAt: new Date().toISOString(), prices: rows }, null, 2));
  console.log(`\nIDs guardados en ${file}`);
}

main().catch((err) => {
  console.error(`\nERROR: ${err.message}`);
  process.exit(1);
});
