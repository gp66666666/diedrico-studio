# Costes y punto de equilibrio

Objetivo: **0 € mientras haya pocos usuarios**, y que a partir del primer suscriptor el servicio
se pague solo. Nada de la app depende de un servicio de pago para funcionar.

## Lo que se usa hoy (todo en plan gratuito)

| Servicio | Para qué | Plan | Coste |
|---|---|---|---|
| Vercel | hosting del frontend | Hobby | 0 € |
| Supabase | base de datos, login, Edge Functions | Free | 0 € |
| DeepSeek | modelo del asistente (prueba, créditos y Premium) | pago por uso | ~0,0007 $/mensaje |
| Groq | respaldo si DeepSeek falla | Free tier | 0 € |
| Ko-fi | cobro de membresías | Free (5 % + comisión de pago) | 0 € fijo |
| Dominio | opcional (`*.vercel.app` ya vale) | — | 0 € |

Límites gratuitos que nos afectan (aproximados, comprobar en cada panel):

- **Supabase Free**: 500 MB de base de datos, 5 GB de salida, 50.000 usuarios activos al mes,
  500.000 invocaciones de Edge Functions al mes. El proyecto se pausa tras una semana sin uso.
- **Vercel Hobby**: 100 GB de tráfico al mes. **Uso no comercial**: al cobrar suscripciones,
  Vercel pide plan Pro (~20 $/mes). Es la primera factura que aparecerá.
- **Groq Free**: límite de peticiones por minuto. El asistente es solo Premium y tiene topes
  (60/h por IP y 120/día por cuenta), así que con decenas de suscriptores sigue siendo gratis.
  Si se queda corto, el plan de pago se cobra por token y este uso cuesta céntimos.

## Por qué el diseño aguanta en gratis

- Las láminas se guardan como **un JSON por usuario** (`laminas_docs`), no como PDFs en Storage.
  1.000 usuarios con láminas ≈ unos pocos MB.
- Los proyectos usan `jsonb` en la misma base de datos: no hay ficheros ni CDN aparte.
- El asistente exige sesión y Premium: el coste de IA solo existe cuando ya hay ingresos.
- Topes: 60 peticiones/hora por IP y 120/día por cuenta. Un suscriptor no puede quemar el margen.

## Punto de equilibrio

Con **4,99 €/mes** por suscriptor, Ko-fi se lleva el 5 % y el procesador ~2,9 % + 0,30 €:

```
4,99 − 0,25 (Ko-fi) − 0,44 (pasarela) ≈ 4,30 € netos por suscriptor y mes
```

| Factura | Cuándo aparece | Suscriptores que la cubren |
|---|---|---|
| Vercel Pro (~18,50 €) | al vender (uso comercial) | 5 |
| Supabase Pro (~23 €) | al pasar de 500 MB o querer backups | 6 |
| Groq de pago (~2-5 €) | con mucho uso de IA | 1-2 |

- **0-4 suscriptores**: 0 € de infraestructura (seguimos en Hobby + Free).
- **5 suscriptores**: paga Vercel Pro.
- **11 suscriptores**: paga todo y empieza a sobrar.
- A partir de ahí, cada suscriptor son ~4,30 € de margen.

Recomendación: no subir a planes de pago hasta que el ingreso del mes los cubra. El único que
conviene adelantar es Vercel Pro en cuanto se cobre, por las condiciones del plan Hobby.

## Créditos de consultas (prepago)

Alternativa al Premium para quien solo quiere el asistente. El saldo vive en
`profiles.credits` y cada movimiento en `credit_movements` (compra, consumo, devolución,
ajuste). El panel de IA muestra el saldo cuando es mayor que 0; **no anuncia la compra**
hasta que exista la pasarela.

Precio propuesto: **100 consultas = 4,99 €** (0,05 € por consulta).

```
4,99 €  cobro
−0,32   Stripe (1,5 % + 0,25 €)
−0,87   IVA 21 % (servicio digital B2C, incluido en el precio)
─────
 3,80 € netos
−0,30   coste real de 100 consultas (≈0,003 € cada una)
─────
 3,50 € de margen  (≈92 %)
```

La reserva para la API no hace falta apartarla: los créditos se cobran **antes** de gastarse,
así que el dinero ya está dentro. Para verlo, `select * from public.credit_snapshot()` (solo
admin) devuelve vendidos, gastados, saldo vivo, ingresos, reserva y margen.

La prueba gratuita de 3 mensajes cuesta **~0,06 céntimos por cuenta** (medido con
`deepseek-flash`, ver abajo). El riesgo real no es el coste, es el abuso: la prueba
va por cuenta (no por IP) y el tope diario por cuenta es de 120 mensajes.

Con `deepseek-flash` (0,30 $/M entrada sin caché, 1,20 $/M salida en hora punta) y los topes
del proxy (24.000 caracteres de entrada y 1.000 tokens de salida sin Premium), el mensaje más
caro posible cuesta **0,0033 $ ≈ 0,30 céntimos**: los 3 de prueba nunca pasan de ~0,9 céntimos
por usuario, aunque nadie repita prompt. Si se activa el modo razonamiento de DeepSeek hay que
contarlo como salida: el proxy lo manda apagado a propósito (con él, la respuesta llegaba vacía
porque los tokens de pensamiento consumían `max_tokens`).

### Medición real (2026-10-22, 11 ejercicios de la biblioteca)

| | Medido |
|---|---|
| Entrada | 4.440 tokens (4.224 en caché + 216 nuevos) |
| Salida | 495-570 tokens |
| Latencia | 2,7-4,7 s (3,0 s de media) |
| **Coste** | **0,06-0,18 céntimos por mensaje** (con caché caliente, ~0,07) |
| 3 mensajes de prueba | ~0,2-0,5 céntimos por cuenta |

El prompt de sistema (4.400 tokens) es lo que domina la entrada, y DeepSeek lo cachea: a partir
del segundo mensaje de la misma sesión el 95 % de la entrada va por caché (0,006 $/M). El coste
real de una consulta es, por tanto, **una décima parte** del techo teórico. Los logs de la Edge
Function imprimen `ai_usage` (modelo, tokens en caché y de salida) para poder cuadrar la factura.

## Qué NO se ha metido a propósito

- Almacenamiento de ficheros (Storage) para PDFs o imágenes de usuario.
- Subidas de imágenes al asistente (visión): encarece y no aporta al temario.
- Historial de conversaciones en la nube: se pierde al recargar y no cuesta nada.

Si algún día se añade algo de esto, va detrás de Premium para que se pague solo.
