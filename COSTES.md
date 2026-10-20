# Costes y punto de equilibrio

Objetivo: **0 € mientras haya pocos usuarios**, y que a partir del primer suscriptor el servicio
se pague solo. Nada de la app depende de un servicio de pago para funcionar.

## Lo que se usa hoy (todo en plan gratuito)

| Servicio | Para qué | Plan | Coste |
|---|---|---|---|
| Vercel | hosting del frontend | Hobby | 0 € |
| Supabase | base de datos, login, Edge Functions | Free | 0 € |
| Groq | modelo del asistente (solo Premium) | Free tier | 0 € |
| Ko-fi | cobro de membresías | Free (5 % + comisión de pago) | 0 € fijo |
| Dominio | opcional (`*.vercel.app` ya vale) | — | 0 € |

Límites gratuitos que nos afectan (aproximados, comprobar en cada panel):

- **Supabase Free**: 500 MB de base de datos, 5 GB de salida, 50.000 usuarios activos al mes,
  500.000 invocaciones de Edge Functions al mes. El proyecto se pausa tras una semana sin uso.
- **Vercel Hobby**: 100 GB de tráfico al mes. **Uso no comercial**: al cobrar suscripciones,
  Vercel pide plan Pro (~20 $/mes). Es la primera factura que aparecerá.
- **Groq Free**: límite de peticiones por minuto. El asistente es solo Premium y tiene topes
  (60/h por IP y 300/día por cuenta), así que con decenas de suscriptores sigue siendo gratis.
  Si se queda corto, el plan de pago se cobra por token y este uso cuesta céntimos.

## Por qué el diseño aguanta en gratis

- Las láminas se guardan como **un JSON por usuario** (`laminas_docs`), no como PDFs en Storage.
  1.000 usuarios con láminas ≈ unos pocos MB.
- Los proyectos usan `jsonb` en la misma base de datos: no hay ficheros ni CDN aparte.
- El asistente exige sesión y Premium: el coste de IA solo existe cuando ya hay ingresos.
- Topes: 60 peticiones/hora por IP y 300/día por cuenta. Un suscriptor no puede quemar el margen.

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

## Qué NO se ha metido a propósito

- Almacenamiento de ficheros (Storage) para PDFs o imágenes de usuario.
- Subidas de imágenes al asistente (visión): encarece y no aporta al temario.
- Historial de conversaciones en la nube: se pierde al recargar y no cuesta nada.

Si algún día se añade algo de esto, va detrás de Premium para que se pague solo.
