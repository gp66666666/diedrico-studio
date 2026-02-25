import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { PlaneElement, GeometryElement } from '../../types';

export default function AbatimientoTool() {
    const { activeTool, elements, addElement, setActiveTool, selectedForDistance, clearDistanceTool, removeElement } = useGeometryStore();
    const hasExecuted = useRef(false);

    useEffect(() => {
        // Reset execution flag if tool is not active
        if (!activeTool || (!activeTool.startsWith('abatir'))) {
            hasExecuted.current = false;
            return;
        }

        if (activeTool === 'abatir-ph') {
            if (hasExecuted.current) return;

            // Requerimos que se hayan seleccionado 2 elementos
            if (selectedForDistance.length === 2) {
                const el1 = elements.find(e => e.id === selectedForDistance[0]);
                const el2 = elements.find(e => e.id === selectedForDistance[1]);

                // Identificar cuál es el plano y cuál es el punto
                const planeEl = (el1?.type === 'plane' ? el1 : (el2?.type === 'plane' ? el2 : null)) as PlaneElement | null;
                const pointEl = (el1?.type === 'point' ? el1 : (el2?.type === 'point' ? el2 : null)) as import('../../types').PointElement | null;

                if (planeEl && pointEl) {
                    hasExecuted.current = true;
                    executeUniversalAbatimiento(planeEl, pointEl);
                    setActiveTool('none');
                    clearDistanceTool();
                } else {
                    // Si seleccionan algo inválido, reseteamos la herramienta
                    alert('Debes seleccionar un PLANO y un PUNTO para abatir.');
                    setActiveTool('none');
                    clearDistanceTool();
                }
            }
        }
    }, [activeTool, selectedForDistance, elements]);

    const executeUniversalAbatimiento = (plane: PlaneElement, pt: import('../../types').PointElement) => {
        const A = plane.normal.x;
        const B = plane.normal.y;
        const C_plane = plane.normal.z;
        const D = plane.constant;

        const lenN = Math.sqrt(A * A + B * B + C_plane * C_plane);
        const distToPlane = Math.abs(A * pt.coords.x + B * pt.coords.y + C_plane * pt.coords.z + D) / lenN;

        if (distToPlane > 0.1) {
            alert(`El punto ${pt.name} no pertenece al plano ${plane.name}. No se puede abatir.`);
            return;
        }

        const flatName = `(${pt.name})`;
        if (elements.some(e => e.name === flatName)) {
            alert(`El punto ${pt.name} ya está abatido.`);
            return; // Ya abatido
        }

        // --- Algoritmo Universal de Abatimiento sobre PH (z=0) ---
        let flatPoint = { x: pt.coords.x, y: pt.coords.y, z: 0 };

        // Comprobar si es un plano horizontal (A=0, B=0)
        const isHorizontal = Math.abs(A) < 1e-6 && Math.abs(B) < 1e-6;

        if (isHorizontal) {
            // El abatimiento es su propia proyección horizontal
            flatPoint = { x: pt.coords.x, y: pt.coords.y, z: 0 };
        } else {
            // Recta charnela (Traza horizontal P): Ax + By + D = 0, en Z=0
            // Proyección horizontal del punto P: (px, py)
            const px = pt.coords.x;
            const py = pt.coords.y;

            // Distancia en 2D desde (px, py) a la recta Ax + By + D = 0
            const num = Math.abs(A * px + B * py + D);
            const den = Math.sqrt(A * A + B * B);

            // Proyección del punto sobre la charnela en Z=0 (Centro de giro O)
            // La dirección perpendicular a la traza en 2D es (A, B)
            // Necesitamos saber si sumamos o restamos, por lo que usamos - (Ax+By+D)/(A^2+B^2)
            const t = -(A * px + B * py + D) / (A * A + B * B);
            const Ox = px + A * t;
            const Oy = py + B * t;

            // d es la distancia proyectada al eje (alejamiento relativo)
            const d = Math.sqrt((px - Ox) ** 2 + (py - Oy) ** 2);
            const pz = pt.coords.z;

            // Radio de abatimiento (Verdadera magnitud en 3D)
            const R = Math.sqrt(d * d + pz * pz);

            // Vector unitario u desde O hacia Pxy (para saber a qué lado abatir)
            let ux = 0, uy = 0;
            if (d > 1e-6) {
                ux = (px - Ox) / d;
                uy = (py - Oy) / d;
            } else {
                // Caso en el que el punto está MISMAMENTE en la traza. (rara vez pero posible si z != 0 en planos peculiares, aunque d=0 suele implicar z=0 o plano de perfil/etc)
                // Usamos la normal 2D para un lado arbitrario convencional.
                ux = A / den;
                uy = B / den;
            }

            // Convención: si z > 0 (por encima del PH), y estamos en el primer diedro, el abatimiento suele "estirarse" hacia afuera.
            // Para mantener consistencia con dibujos técnicos donde todo se abre a la derecha/abajo:
            // Multiplicamos por el vector perpendicular.
            flatPoint.x = Ox + R * ux;
            flatPoint.y = Oy + R * uy;
        }

        // Añadir el punto abatido
        addElement({
            type: 'point',
            name: flatName,
            coords: flatPoint,
            color: plane.color,
            visible: true,
            isDependent: true
        } as any);

        // Visualizar Traza Inversa (Charnela secundaria abatida - Ej: traza vertical abatida)
        // Esto es un plus visual, trazaremos la otra traza abatida para dar contexto del plano abatido entero.
        if (!isHorizontal) {
            const traceName = `(v_${plane.name.toLowerCase()})`;
            if (!elements.some(e => e.name === traceName)) {
                // Hallar el vértice V (corte de trazas con LT)
                let Vx, Vy = 0, Vz = 0;
                if (Math.abs(A) > 1e-6) {
                    Vx = -D / A; // Intersección con el eje X (como LT)
                } else {
                    Vx = 0; // Planes paralelos a LT no cortan (V en infinito)
                }

                // Generar un punto arbitrario de la traza vertical para abatir
                let PtV: { x: number, y: number, z: number } | null = null;
                if (Math.abs(C_plane) > 1e-6) {
                    // Plano corta al PV (Ax + Cz + D = 0 => y=0)
                    const testX = (Math.abs(A) > 1e-6) ? Vx + 10 : 0; // Si es paralelo a LT (A=0), x=0 cualq
                    const testZ = (-D - A * testX) / C_plane;
                    PtV = { x: testX, y: 0, z: testZ };
                }

                if (PtV) {
                    const tvX = PtV.x;
                    const tvY = PtV.y;
                    const tvZ = PtV.z;

                    // Abatir este PtV con la misma lógica
                    const t_tv = -(A * tvX + B * tvY + D) / (A * A + B * B);
                    const OtvX = tvX + A * t_tv;
                    const OtvY = tvY + B * t_tv;
                    const d_tv = Math.sqrt((tvX - OtvX) ** 2 + (tvY - OtvY) ** 2);
                    const R_tv = Math.sqrt(d_tv * d_tv + tvZ * tvZ);

                    let utvX = 0, utvY = 0;
                    if (d_tv > 1e-6) {
                        utvX = (tvX - OtvX) / d_tv;
                        utvY = (tvY - OtvY) / d_tv;
                    } else {
                        const den = Math.sqrt(A * A + B * B);
                        utvX = A / den;
                        utvY = B / den;
                    }

                    const flatPtV = { x: OtvX + R_tv * utvX, y: OtvY + R_tv * utvY, z: 0 };

                    addElement({
                        type: 'line',
                        name: traceName,
                        point: { x: Vx, y: 0, z: 0 },
                        direction: { x: flatPtV.x - Vx, y: flatPtV.y - 0, z: 0 },
                        color: plane.color,
                        visible: true,
                        isInfinite: true,
                    } as any);
                }
            }
        }
    };

    return null;
}
