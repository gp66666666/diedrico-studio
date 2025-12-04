# Diédrico Studio - Herramienta para Estudiantes

Aplicación web interactiva para visualizar y resolver problemas de geometría analítica 3D y sistema diédrico, con asistente IA.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar API de Gemini (opcional pero recomendado)

1. Ve a [https://ai.google.dev/](https://ai.google.dev/)
2. Haz clic en "Get API Key" 
3. Crea un proyecto (si no tienes)
4. Copia la API key

5. Crea un archivo `.env` en la raíz del proyecto:
```bash
VITE_GEMINI_API_KEY=tu_clave_aqui
```

### 3. Ejecutar
```bash
npm run dev
```

## ✨ Características

### Manual
- ➕ Añadir puntos, rectas y planos manualmente
- 🎯 Múltiples modos de entrada:
  - **Puntos**: Coordenadas (x, y, z)
  - **Rectas**: 2 puntos o punto + dirección
  - **Planos**: 3 puntos, normal+punto, ecuación general, o **simple (z=5, x=3, etc.)**
- 👁️ Mostrar/ocultar elementos
- 🗑️ Eliminar elementos

### Asistente IA (Gemini)
- 💬 Chat conversacional
- 🧮 Resuelve problemas de geometría automáticamente
- 🎨 Añade elementos a la escena directamente
- 📝 Explicaciones paso a paso

**Ejemplos de comandos:**
- "Encuentra la intersección de la recta por (0,0,0) con dirección (1,1,1) y el plano z=10"
- "Dibuja un triángulo con vértices en (0,0,0), (5,0,0) y (0,5,0)"
- "Crea un plano perpendicular al eje Y en y=3"

### Visualización 3D
- 🎨 Renderizado 3D con Three.js
- 🔴 Ejes coloreados correctamente: Rojo (X), Verde (Y), Azul (Z)
- 📐 Grid oscuro no intrusivo
- 🌈 Elementos con colores automáticos
- 🏷️ Etiquetas en 3D
- 🔄 Controles de cámara orbital

## 🎓 Para Estudiantes

Esta herramienta es perfecta para:
- Visualizar problemas de dibujo técnico
- Entender intersecciones de geometría 3D
- Practicar sistema diédrico
- Verificar soluciones de ejercicios

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **3D**: Three.js + React Three Fiber
- **IA**: Google Gemini Flash (gratis)
- **Estado**: Zustand
- **Estilos**: Tailwind CSS

## 📝 Notas

- La API de Gemini es **gratuita** (60 peticiones/minuto)
- Sin API key, el chat mostrará instrucciones para obtener una
- Los inputs manuales funcionan siempre, con o sin API key

## 🔗 Enlaces Útiles

- [Documentación Gemini AI](https://ai.google.dev/docs)
- [Three.js Docs](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
