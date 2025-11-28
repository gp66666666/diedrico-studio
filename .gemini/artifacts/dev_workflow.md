# Workflow de Desarrollo - Diédrico Studio

## 🔄 Proceso Automático de Deploy

Cada vez que hacemos cambios en el código:

1. **Editamos archivos** en VS Code
2. **Guardamos en Git**:
   ```powershell
   git add .
   git commit -m "feat: descripción del cambio"
   git push
   ```
3. **Vercel despliega automáticamente** (1-2 min)
4. **Cambios visibles** en https://diedrico-studio.vercel.app

## 📋 Comandos Útiles

### Guardar cambios
```powershell
# Ver qué archivos cambiaron
git status

# Añadir todos los cambios al staging
git add .

# O añadir archivos específicos
git add src/components/Sidebar.tsx

# Hacer commit con mensaje descriptivo
git commit -m "feat: añadir distancias punto-punto"

# Subir a GitHub (trigger deploy automático)
git push
```

### Ver estado del deploy
1. Ve a https://vercel.com/dashboard
2. Click en tu proyecto "diedrico-studio"
3. Verás el historial de deploys
4. Cada push crea un nuevo deploy

### Tipos de commits recomendados
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `refactor:` - Refactorización de código
- `style:` - Cambios de estilo/formato
- `docs:` - Documentación
- `chore:` - Tareas de mantenimiento

## 🎯 Ventajas

✅ **Deploy automático** - No más pasos manuales
✅ **Preview URLs** - Cada branch tiene su propia URL de preview
✅ **Rollback fácil** - Puedes volver a cualquier versión anterior
✅ **Logs en tiempo real** - Ve qué está pasando durante el build
✅ **Siempre actualizado** - GitHub → Vercel → Online

## 🌿 Trabajar con Branches (Opcional pero recomendado)

Para desarrollar nuevas features sin afectar la versión principal:

```powershell
# Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# Hacer cambios...
git add .
git commit -m "feat: implementar nueva funcionalidad"
git push -u origin feature/nueva-funcionalidad
```

**Vercel creará automáticamente una URL de preview:**
```
https://diedrico-studio-git-feature-nueva-funcionalidad-gp66666666.vercel.app
```

Así puedes probar sin tocar la versión principal.

Cuando esté lista:
```powershell
# Volver a main
git checkout main

# Fusionar los cambios
git merge feature/nueva-funcionalidad

# Subir
git push
```

Y la versión principal se actualiza.

## 🚨 ¿Qué pasa si el build falla?

1. **Vercel te envía un email** notificándote
2. **La versión anterior sigue online** (no se rompe nada)
3. **Ves los errores en el dashboard** de Vercel
4. **Corriges localmente** y vuelves a hacer push

## 📊 Monitoreo

En el Dashboard de Vercel puedes ver:
- 📈 **Analytics** - Visitas, rendimiento
- 🌍 **Dominios** - Gestionar URLs
- ⚙️ **Settings** - Configuración, variables de entorno
- 📝 **Deployments** - Historial completo
- 🔍 **Logs** - Logs de cada deploy

## 💡 Resumen

**DE AHORA EN ADELANTE:**
```
Código → Git Push → Vercel Deploy → Online
   ⏱️ 30 seg   ⏱️ 1-2 min     ✅ Listo
```

**¡COMPLETAMENTE AUTOMÁTICO!** 🚀
