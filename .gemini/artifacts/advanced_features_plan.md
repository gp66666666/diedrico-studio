# Plan de Funcionalidades Avanzadas - Diédrico Studio

## Índice
1. [Distancias](#1-distancias)
2. [Abatimientos](#2-abatimientos)
3. [Giros](#3-giros)
4. [Cambios de Plano](#4-cambios-de-plano)
5. [Sólidos](#5-sólidos)
6. [Priorización y Roadmap](#6-priorización-y-roadmap)

---

## 1. DISTANCIAS

### 1.1 Distancia entre Puntos
**Funcionalidad**: Calcular la distancia real entre dos puntos en el espacio.

**Métodos de Cálculo**:
- **Directo 3D**: `d = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]`
- **Mediante proyecciones**: Usando diferencias de alejamiento y cota
- **Triángulo característico**: Visualizar el triángulo rectángulo con las diferencias

**UI/UX**:
- Botón "Calcular Distancia" en toolbar
- Selector interactivo: click en dos puntos
- Mostrar resultado numérico en panel
- Dibujar línea de conexión con medida
- Opción para mostrar/ocultar el triángulo característico

**Visualización 2D**:
- Línea conectando las proyecciones
- Triángulo característico con cotas
- Etiqueta con la distancia real

**Visualización 3D**:
- Línea directa entre los puntos
- Segmentos auxiliares mostrando diferencias en cada eje

---

### 1.2 Distancia Punto-Recta
**Funcionalidad**: Calcular la distancia mínima de un punto a una recta.

**Métodos de Cálculo**:
- **Perpendicular común**: Trazar perpendicular desde el punto a la recta
- **Producto vectorial**: `d = ||(P-A) × v|| / ||v||` donde v es director de la recta
- **Proyección**: Proyectar el punto sobre la recta

**UI/UX**:
- Modo "Distancia P-L" en toolbar
- Seleccionar punto + recta
- Mostrar resultado numérico
- Dibujar perpendicular y destacar punto más cercano

**Visualización**:
- Segmento perpendicular en ambas proyecciones
- Punto de intersección (pie de la perpendicular)
- Medida de la distancia

---

### 1.3 Distancia Punto-Plano
**Funcionalidad**: Calcular la distancia de un punto a un plano.

**Métodos**:
- **Perpendicular al plano**: Trazar desde el punto
- **Fórmula directa**: `d = |ax + by + cz + d| / √(a² + b² + c²)`

**Casos Especiales**:
- Plano Horizontal: distancia = |cota|
- Plano Frontal: distancia = |alejamiento|
- Plano Vertical: distancia = |apartamiento|

**Visualización**:
- Perpendicular al plano
- Punto de intersección con el plano
- Medida de la distancia

---

### 1.4 Distancia entre Rectas
**Funcionalidad**: Calcular distancia mínima entre dos rectas (paralelas o que se cruzan).

**Casos**:
- **Rectas que se cortan**: distancia = 0
- **Rectas paralelas**: distancia constante
- **Rectas que se cruzan**: perpendicular común

**Métodos**:
- Perpendicular común (para rectas que se cruzan)
- Distancia de un punto a la otra recta (para paralelas)

**Visualización**:
- Segmento de perpendicular común
- Indicación si se cortan o son paralelas

---

### 1.5 Distancia Recta-Plano y Plano-Plano
**Funcionalidad**: Distancias para casos especiales.

**Casos**:
- **Recta-Plano paralelos**: distancia constante
- **Recta corta Plano**: distancia = 0
- **Planos paralelos**: distancia constante
- **Planos que se cortan**: distancia = 0

---

## 2. ABATIMIENTOS

### 2.1 Abatimiento sobre Plano Horizontal (PH)
**Funcionalidad**: Girar un plano sobre su traza horizontal (h-h) para verlo en verdadera magnitud.

**Proceso**:
1. Identificar la traza horizontal (charnela)
2. Girar 90° alrededor de h-h
3. Los puntos del plano se abaten sobre el PH
4. Visualizar posición abatida con notación especial (p₀, r₀)

**UI/UX**:
- Botón "Abatir sobre PH"
- Seleccionar plano o elementos a abatir
- Mostrar posición abatida con color/estilo diferente
- Opción para mostrar arcos de abatimiento
- Toggle para mostrar/ocultar elementos abatidos

**Visualización**:
- Elementos abatidos en proyección horizontal
- Arcos circulares mostrando el recorrido del abatimiento
- Líneas perpendiculares a la charnela
- Notación: p₀, A₀, r₀

**Aplicaciones**:
- Ver ángulos reales entre rectas en un plano
- Medir distancias verdaderas
- Resolver problemas de perpendicularidad

---

### 2.2 Abatimiento sobre Plano Vertical (PV)
**Funcionalidad**: Similar al anterior pero girando sobre la traza vertical (v-v).

**Proceso**:
1. Identificar la traza vertical (charnela)
2. Girar 90° alrededor de v-v
3. Los puntos se abaten sobre el PV
4. Visualizar en proyección vertical

**Notación**: Elementos con subíndice 0 o círculo

---

### 2.3 Abatimiento sobre Traza del Plano
**Funcionalidad**: Abatir figuras contenidas en un plano oblicuo.

**Casos de Uso**:
- Polígonos en planos oblicuos
- Figuras planas para ver verdadera forma
- Cálculo de áreas reales

**Visualización**:
- Figura original y abatida
- Trayectorias de abatimiento
- Medidas verdaderas

---

### 2.4 Desabatimiento
**Funcionalidad**: Proceso inverso, construir elemento en posición real desde su abatimiento.

**Uso**:
- Construir figuras con medidas conocidas
- Resolver problemas geométricos

---

## 3. GIROS

### 3.1 Giro alrededor de Eje Vertical
**Funcionalidad**: Rotar elementos alrededor de un eje perpendicular al PH.

**Características**:
- Las cotas (z) no cambian
- Los alejamientos (y) cambian según el ángulo
- Las proyecciones verticales describen círculos

**UI/UX**:
- Modo "Giro Vertical"
- Seleccionar elementos y eje
- Input de ángulo de giro (slider + input numérico)
- Preview del giro en tiempo real
- Opción para crear copia girada o mover original

**Visualización**:
- Círculos de giro en proyección horizontal
- Radios desde el eje
- Posiciones inicial y final
- Ángulo de giro visible

---

### 3.2 Giro alrededor de Eje de Punta
**Funcionalidad**: Rotar alrededor de eje perpendicular al PV.

**Características**:
- Los alejamientos (y) no cambian
- Las cotas (z) cambian según el ángulo
- Las proyecciones horizontales describen círculos

---

### 3.3 Giro alrededor de Eje Paralelo a LT
**Funcionalidad**: Rotar alrededor de eje paralelo a la línea de tierra.

**Características**:
- Tanto alejamiento como cota cambian
- Más complejo, requiere ambas proyecciones

---

### 3.4 Giro alrededor de Eje Cualquiera
**Funcionalidad**: Giro genérico alrededor de cualquier recta.

**Método**:
- Cambio de plano para convertir el eje en vertical
- Realizar giro
- Deshacer cambio de plano

---

### 3.5 Aplicaciones de Giros
**Casos de Uso**:
- Situar rectas en posiciones particulares (vertical, de punta, paralela a LT)
- Resolver problemas angulares
- Determinar verdaderas magnitudes

---

## 4. CAMBIOS DE PLANO

### 4.1 Cambio de Plano Vertical (mantener PH)
**Funcionalidad**: Sustituir el PV por uno nuevo, manteniendo el PH.

**Nueva LT**: Nueva línea de referencia LT₁

**Proceso**:
1. Definir nueva orientación del PV
2. Trazar nueva LT₁
3. Calcular nuevas proyecciones verticales
4. Los alejamientos se mantienen, las cotas cambian

**UI/UX**:
- Modo "Cambio de PV"
- Definir nueva LT mediante línea o ángulo
- Mostrar ambos sistemas simultáneamente
- Toggle entre sistemas antiguo y nuevo

**Aplicaciones**:
- Convertir recta oblicua en de punta
- Simplificar problemas
- Ver planos en posiciones particulares

---

### 4.2 Cambio de Plano Horizontal (mantener PV)
**Funcionalidad**: Sustituir el PH por uno nuevo.

**Proceso**:
1. Definir nueva orientación del PH
2. Nueva LT₁
3. Nuevas proyecciones horizontales
4. Las cotas se mantienen, los alejamientos cambian

---

### 4.3 Doble Cambio de Plano
**Funcionalidad**: Realizar dos cambios sucesivos.

**Aplicaciones**:
- Convertir recta cualquiera en paralela a LT (verdadera magnitud)
- Convertir plano oblicuo en proyectante

**Proceso**:
1. Primer cambio: recta de punta (o plano proyectante)
2. Segundo cambio: recta paralela a LT (o plano paralelo a plano de proyección)

---

### 4.4 Sistema de Referencias
**UI/UX**:
- Gestión de múltiples sistemas de proyección
- Nomenclatura clara: P, P₁, P₂ para puntos en diferentes sistemas
- LT, LT₁, LT₂ para líneas de tierra
- Colores diferentes por sistema

---

## 5. SÓLIDOS

### 5.1 Poliedros Regulares
**Funcionalidad**: Crear y visualizar poliedros.

**Tipos**:
- **Tetraedro**: 4 caras triangulares
- **Cubo/Hexaedro**: 6 caras cuadradas
- **Octaedro**: 8 caras triangulares
- **Dodecaedro**: 12 caras pentagonales
- **Icosaedro**: 20 caras triangulares

**Parámetros**:
- Posición del centro
- Tamaño (arista o radio)
- Orientación

**UI/UX**:
- Panel "Sólidos" en sidebar
- Selector de tipo de poliedro
- Inputs para parámetros
- Preview en tiempo real

**Visualización 2D**:
- Proyecciones de aristas visibles (continuas)
- Proyecciones de aristas ocultas (discontinuas)
- Contorno aparente

**Visualización 3D**:
- Renderizado completo del sólido
- Transparencia opcional
- Wireframe mode

---

### 5.2 Prismas
**Funcionalidad**: Prismas de base poligonal.

**Parámetros**:
- Forma de la base (triángulo, cuadrado, pentágono, hexágono, etc.)
- Dimensiones de la base
- Altura
- Orientación del eje
- Posición de la base

**Tipos**:
- **Prisma Recto**: Aristas laterales perpendiculares a la base
- **Prisma Oblicuo**: Aristas laterales oblicuas

**Casos Especiales**:
- Prisma con base en PH (aristas verticales)
- Prisma con eje de punta
- Prisma con aristas paralelas a LT

---

### 5.3 Pirámides
**Funcionalidad**: Pirámides de base poligonal.

**Parámetros**:
- Forma de la base
- Dimensiones
- Altura (posición del vértice)
- Posición de la base

**Tipos**:
- **Pirámide Recta**: Vértice sobre el centro de la base
- **Pirámide Oblicua**: Vértice desplazado

---

### 5.4 Cilindros
**Funcionalidad**: Cilindros de revolución.

**Parámetros**:
- Radio
- Altura
- Posición del eje
- Orientación del eje

**Visualización**:
- Generatrices visibles y ocultas
- Contorno aparente (elipses en proyecciones)
- Bases circulares

---

### 5.5 Conos
**Funcionalidad**: Conos de revolución.

**Parámetros**:
- Radio de la base
- Altura (posición del vértice)
- Posición del eje
- Orientación

**Visualización**:
- Generatrices límite del contorno
- Base circular
- Vértice

---

### 5.6 Esferas
**Funcionalidad**: Esferas.

**Parámetros**:
- Centro
- Radio

**Visualización**:
- Contorno aparente (siempre círculo en ambas proyecciones)
- Círculos horizontales y verticales
- Ecuador y meridianos

---

### 5.7 Secciones Planas
**Funcionalidad**: Cortar sólidos con planos para obtener secciones.

**Proceso**:
1. Seleccionar sólido
2. Definir plano secante
3. Calcular curva/polígono de intersección
4. Mostrar sección en verdadera magnitud (abatimiento)

**Aplicaciones**:
- Obtener desarrollo de superficies
- Estudiar secciones cónicas
- Resolver problemas de intersección

---

### 5.8 Intersecciones entre Sólidos
**Funcionalidad**: Curvas de penetración entre dos sólidos.

**Casos Típicos**:
- Cilindro-Cilindro
- Cilindro-Prisma
- Cono-Cilindro
- Esfera-Cilindro

**Método**:
- Planos auxiliares secantes
- Generatrices auxiliares
- Python/Rectas auxiliares

---

### 5.9 Desarrollos
**Funcionalidad**: Obtener el desarrollo (plantilla) de superficies.

**Aplicable a**:
- Poliedros
- Prismas
- Pirámides
- Cilindros
- Conos

**No desarrollables**:
- Esferas (se aproxima)

**UI/UX**:
- Botón "Desarrollar"
- Mostrar desarrollo en vista 2D
- Opción para exportar como SVG/PDF
- Mostrar líneas de plegado

---

## 6. PRIORIZACIÓN Y ROADMAP

### Fase 1: Distancias y Medidas (Prioritario)
**Duración estimada**: 2-3 semanas

- ✅ Distancia entre puntos
- ✅ Distancia punto-recta
- ✅ Distancia punto-plano
- ✅ Panel de resultados numéricos
- ✅ Visualización de elementos auxiliares

**Justificación**: Son operaciones fundamentales y frecuentes. Mejoran utilidad inmediata.

---

### Fase 2: Abatimientos (Alta prioridad)
**Duración estimada**: 2-3 semanas

- ✅ Abatimiento sobre PH
- ✅ Abatimiento sobre PV
- ✅ Visualización de arcos y trayectorias
- ✅ Notación correcta (subíndice 0)
- ✅ Toggle mostrar/ocultar abatidos

**Justificación**: Esencial para ver verdaderas magnitudes. Muy usado en problemas.

---

### Fase 3: Giros (Media-Alta prioridad)
**Duración estimada**: 2-3 semanas

- ✅ Giro alrededor de eje vertical
- ✅ Giro alrededor de eje de punta
- ✅ UI con slider de ángulo
- ✅ Preview en tiempo real
- 🔄 Giro alrededor de eje paralelo a LT
- 🔄 Giro alrededor de eje cualquiera (avanzado)

**Justificación**: Técnica complementaria a abatimientos. Útil para posicionamiento.

---

### Fase 4: Cambios de Plano (Media prioridad)
**Duración estimada**: 3-4 semanas

- 🔄 Cambio de PV
- 🔄 Cambio de PH
- 🔄 Gestión de múltiples sistemas
- 🔄 Doble cambio de plano
- 🔄 UI para gestionar LT₁, LT₂, etc.

**Justificación**: Método sistemático y potente. Requiere más desarrollo de UI.

---

### Fase 5: Sólidos Básicos (Media-Baja prioridad)
**Duración estimada**: 4-5 semanas

- 🔄 Prismas (recto y oblicuo)
- 🔄 Pirámides
- 🔄 Cilindros
- 🔄 Conos
- 🔄 Visualización aristas ocultas
- 🔄 Panel de creación de sólidos

**Justificación**: Funcionalidad avanzada. Requiere motor de renderizado mejorado.

---

### Fase 6: Sólidos Avanzados (Baja prioridad)
**Duración estimada**: 3-4 semanas

- 🔄 Poliedros regulares
- 🔄 Esferas
- 🔄 Secciones planas
- 🔄 Desarrollos

**Justificación**: Casos especiales. Requieren algoritmos complejos.

---

### Fase 7: Intersecciones (Opcional/Avanzado)
**Duración estimada**: 4-6 semanas

- 🔄 Intersección poliedro-poliedro
- 🔄 Intersección cuerpo revolución - cuerpo revolución
- 🔄 Métodos auxiliares (planos, generatrices)

**Justificación**: Muy avanzado. Requiere matemáticas complejas.

---

## ARQUITECTURA PROPUESTA

### Nuevos Módulos

```
src/
├── utils/
│   ├── distances.ts         # Cálculos de distancias
│   ├── transformations.ts   # Abatimientos, giros, cambios de plano
│   ├── solids.ts           # Geometría de sólidos
│   └── intersections.ts    # Intersecciones avanzadas
│
├── components/
│   ├── Tools/
│   │   ├── DistanceTool.tsx
│   │   ├── AbatimientoTool.tsx
│   │   ├── GiroTool.tsx
│   │   ├── CambioPlanoTool.tsx
│   │   └── SolidCreator.tsx
│   │
│   ├── 2D/
│   │   ├── AbatimientoVisualization.tsx
│   │   ├── GiroVisualization.tsx
│   │   └── SolidProjection2D.tsx
│   │
│   └── 3D/
│       ├── SolidObject.tsx
│       └── SectionPlane.tsx
│
└── store/
    ├── distancesStore.ts
    ├── transformationsStore.ts
    └── solidsStore.ts
```

### Tipos TypeScript

```typescript
// Distancias
interface DistanceResult {
    value: number;
    points?: Vec3[];  // Puntos auxiliares (pies de perpendicular, etc.)
    auxiliaryLines?: Line[];
}

// Abatimientos
interface Abatimiento {
    id: string;
    type: 'PH' | 'PV' | 'custom';
    charnela: Line;  // Eje de giro
    elements: string[];  // IDs de elementos abatidos
    angle: number;
}

// Giros
interface Giro {
    id: string;
    axis: Line;
    angle: number;  // En grados
    elements: string[];
    keepOriginal: boolean;
}

// Cambios de Plano
interface CambioPlano {
    id: string;
    newLT: Line;
    type: 'PV' | 'PH';
    previousSystem?: string;
}

// Sólidos
interface Solid {
    id: string;
    type: 'prism' | 'pyramid' | 'cylinder' | 'cone' | 'sphere' | 'polyhedron';
    position: Vec3;
    dimensions: any;  // Específico por tipo
    orientation: Vec3;
    visible: boolean;
    color: string;
}
```

---

## CONSIDERACIONES TÉCNICAS

### Rendimiento
- Los sólidos con muchas caras pueden afectar rendimiento
- Implementar LOD (Level of Detail) para sólidos complejos
- Optimizar cálculo de visibilidad de aristas

### Precisión Numérica
- Usar epsilon apropiado para comparaciones flotantes
- Validar resultados de cálculos complejos
- Manejo de casos degenerados

### UX
- Feedback visual inmediato
- Tooltips explicativos
- Tutoriales integrados para cada herramienta
- Atajos de teclado

### Exportación
- SVG para proyecciones 2D
- PDF para documentación
- STL para modelos 3D
- Notas y anotaciones

---

## RESUMEN EJECUTIVO

**Total de Funcionalidades**: ~40 características nuevas
**Tiempo Estimado Total**: 20-30 semanas de desarrollo
**Complejidad**: Media-Alta

**Recomendación**: Comenzar con Fase 1 (Distancias) ya que:
1. Es fundamental y muy utilizado
2. Complejidad manejable
3. Gran impacto en utilidad
4. Sirve de base para otras funcionalidades

**Next Steps**:
1. Revisar y aprobar este plan
2. Crear issues/tasks en sistema de seguimiento
3. Comenzar desarrollo de Fase 1
4. Iterar basado en feedback de usuarios
