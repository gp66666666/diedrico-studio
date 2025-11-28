# Guía de Despliegue - Diédrico Studio

## Objetivo
Publicar la aplicación en internet para que sea accesible públicamente mientras sigues desarrollando.

---

## Opción Recomendada: Vercel

### ¿Por qué Vercel?
- ✅ **Gratis** para proyectos personales
- ✅ **Deploy automático** al hacer push a GitHub
- ✅ **Previews** de cada cambio antes de publicar
- ✅ **HTTPS** (SSL) automático
- ✅ **CDN global** (carga rápida en todo el mundo)
- ✅ **Dominio personalizado** gratis (.vercel.app)

---

## Paso 1: Preparar el Proyecto

### 1.1. Inicializar Git (si no lo has hecho)

```powershell
# En la carpeta del proyecto
cd "d:\Portfolio\Eloi García\diedrico-3d"

# Inicializar Git
git init

# Añadir todo al staging
git add .

# Primer commit
git commit -m "feat: initial commit - Diédrico Studio"
```

### 1.2. Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com) y haz login
2. Click en el botón **"+" → "New repository"**
3. Nombre: `diedrico-3d` o `diedrico-studio`
4. Descripción: "Sistema Diédrico 3D Interactivo - Herramienta educativa"
5. **Público** o **Privado** (ambos funcionan con Vercel)
6. **NO** marques "Initialize with README" (ya tienes archivos)
7. Click **"Create repository"**

### 1.3. Conectar tu Proyecto Local con GitHub

GitHub te mostrará comandos. Usa estos:

```powershell
# Añadir el remote (sustituye TU_USUARIO por tu username de GitHub)
git remote add origin https://github.com/TU_USUARIO/diedrico-3d.git

# Cambiar rama a main (si estás en master)
git branch -M main

# Push inicial
git push -u origin main
```

---

## Paso 2: Desplegar en Vercel

### 2.1. Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Sign Up"**
3. **Importante**: Registrate con tu cuenta de GitHub (opción "Continue with GitHub")
4. Autoriza a Vercel para acceder a tus repositorios

### 2.2. Importar el Proyecto

1. En el Dashboard de Vercel, click **"Add New..." → "Project"**
2. Busca tu repositorio `diedrico-3d`
3. Click **"Import"**

### 2.3. Configurar el Deploy

Vercel detectará automáticamente que es un proyecto Vite. Verifica la configuración:

**Framework Preset**: `Vite`

**Build Command**: 
```
npm run build
```

**Output Directory**: 
```
dist
```

**Install Command**: 
```
npm install
```

**Root Directory**: 
```
./
```

4. Click **"Deploy"** 🚀

### 2.4. Esperar el Deploy

- Primera vez: ~2-3 minutos
- Verás un progreso en tiempo real
- Al terminar, verás confeti 🎉 y tu URL

---

## Paso 3: Acceder a tu Aplicación

Tu app estará en:
```
https://diedrico-3d-TU_USUARIO.vercel.app
```

O similar. Vercel te dará la URL exacta.

---

## Paso 4: Workflow de Desarrollo Continuo

### Cada vez que hagas cambios:

```powershell
# 1. Hacer cambios en el código
# ... editas archivos ...

# 2. Guardar cambios en Git
git add .
git commit -m "feat: descripción de los cambios"

# 3. Subir a GitHub
git push

# 4. Vercel despliega AUTOMÁTICAMENTE
# En ~1-2 minutos, los cambios están online
```

**¡Eso es todo!** No necesitas hacer nada más. Vercel detecta el push y redespliega.

---

## Paso 5: Ver el Estado del Deploy

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click en tu proyecto
3. Verás todos los deploys
4. Cada deploy tiene:
   - ✅ Estado (Building, Ready, Error)
   - 🔗 URL de preview
   - 📝 Logs del build
   - ⏱️ Tiempo de deploy

---

## Dominios y URLs

### URL Automática
Vercel te da gratis:
```
https://diedrico-3d.vercel.app
https://diedrico-3d-git-main-TU_USUARIO.vercel.app
```

### Dominio Personalizado (Opcional)

Si quieres algo como `diedrico.com`:

1. Compra un dominio en Namecheap, GoDaddy, etc.
2. En Vercel → Settings → Domains
3. Añade tu dominio
4. Configura los DNS según las instrucciones
5. ¡Listo!

Pero con `.vercel.app` ya es totalmente funcional y profesional.

---

## Variables de Entorno (Si las necesitas)

Si en el futuro necesitas API keys u otras variables:

1. Vercel Dashboard → Tu proyecto → Settings → Environment Variables
2. Añadir variables (ej: `VITE_API_KEY`)
3. Redeploy para que se apliquen

---

## Preview Deployments

**Súper útil para pruebas:**

1. Crea una rama en Git:
   ```powershell
   git checkout -b feature/nueva-funcionalidad
   ```

2. Haz cambios y push:
   ```powershell
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push -u origin feature/nueva-funcionalidad
   ```

3. Vercel crea un **preview deployment** con URL única
4. Pruebas sin afectar la versión principal
5. Si todo va bien, fusionas a main:
   ```powershell
   git checkout main
   git merge feature/nueva-funcionalidad
   git push
   ```

---

## Troubleshooting

### Build Falla

**Problema**: Build error en Vercel

**Solución**: 
1. Verifica que compila localmente:
   ```powershell
   npm run build
   ```
2. Si funciona local pero no en Vercel, revisa los logs en el dashboard
3. Problemas comunes:
   - Falta alguna dependencia en `package.json`
   - Errores de TypeScript
   - Variables de entorno

### Cambios No se Reflejan

**Problema**: Hice push pero no veo cambios

**Solución**:
1. Verifica que el deploy terminó (check en Vercel dashboard)
2. Limpia caché del navegador (Ctrl+F5)
3. Espera ~30 segundos para CDN

---

## Comandos Útiles Git

```powershell
# Ver estado de cambios
git status

# Ver historial
git log --oneline

# Deshacer último commit (mantiene cambios)
git reset --soft HEAD~1

# Ver ramas
git branch

# Cambiar de rama
git checkout nombre-rama

# Crear y cambiar a nueva rama
git checkout -b nombre-nueva-rama
```

---

## Alternativas a Vercel

Si prefieres otras opciones:

### Netlify
- Similar a Vercel
- También muy bueno
- [netlify.com](https://netlify.com)

### GitHub Pages
- Gratis pero más limitado
- Requiere configuración extra para SPAs
- URL: `username.github.io/diedrico-3d`

### Render
- También buena opción
- [render.com](https://render.com)

---

## Resumen: Checklist Rápido

- [ ] 1. Inicializar Git en el proyecto
- [ ] 2. Crear repositorio en GitHub
- [ ] 3. Conectar local con GitHub y hacer push
- [ ] 4. Crear cuenta en Vercel (con GitHub)
- [ ] 5. Importar proyecto desde GitHub
- [ ] 6. Deploy automático
- [ ] 7. Acceder a tu URL `.vercel.app`
- [ ] 8. Workflow: Editar → Commit → Push → Auto-deploy

---

## Compartir con Amigos

Tu URL será algo como:
```
https://diedrico-studio.vercel.app
```

Puedes compartirla directamente. La web será:
- ✅ Accesible desde cualquier dispositivo
- ✅ HTTPS seguro
- ✅ Rápida (CDN)
- ✅ Buscable en Google (tras unos días de indexación)

---

## SEO (Opcional)

Para que Google la encuentre más rápido:

### Añadir Meta Tags

Crea o edita `index.html`:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- SEO Meta Tags -->
  <meta name="description" content="Diédrico Studio - Sistema interactivo 3D para aprendizaje de geometría descriptiva y sistema diédrico" />
  <meta name="keywords" content="diedrico, geometria descriptiva, dibujo tecnico, educacion, 3D, proyecciones" />
  <meta name="author" content="Eloi García" />
  
  <!-- Open Graph (para compartir en redes) -->
  <meta property="og:title" content="Diédrico Studio" />
  <meta property="og:description" content="Sistema interactivo 3D para geometría descriptiva" />
  <meta property="og:type" content="website" />
  
  <title>Diédrico Studio - Sistema 3D Interactivo</title>
</head>
```

### Google Search Console (Opcional)

1. Ve a [search.google.com/search-console](https://search.google.com/search-console)
2. Añade tu dominio Vercel
3. Verifica propiedad
4. Solicita indexación

Pero Google encontrará tu site automáticamente después de unos días/semanas.

---

## ¡Listo!

Ahora tienes tu aplicación:
- 🌐 **Online** y accesible
- 🔄 **Auto-actualizable** con cada push
- 📱 **Responsive** en todos dispositivos  
- 🚀 **Rápida** con CDN global
- 🔒 **Segura** con HTTPS

**Workflow diario:**
```
Código → Git Commit → Git Push → Deploy Automático ✨
```

¿Problemas? Revisa los logs en Vercel o consulta la documentación oficial.
