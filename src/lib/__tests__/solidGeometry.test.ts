import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
    buildSolidMesh,
    getProjectedEdges,
    rotateStorePoint,
    applyMat3,
    storeEulerToMatrix,
    matrixToStoreEuler,
    multiplyMat3,
    axisAngleToMatrix,
    transformVertex,
} from '../solidGeometry';

const vertexCount = (subtype: string, size = 3) => buildSolidMesh(subtype, { x: size, y: size, z: size }).vertices.length;
const faceSizes = (subtype: string) => {
    const mesh = buildSolidMesh(subtype, { x: 3, y: 3, z: 3 });
    return mesh.faces.map((f) => f.length);
};

describe('malla de sólidos', () => {
    it('el cubo tiene 8 vértices y 6 caras de 4 lados', () => {
        expect(vertexCount('cube')).toBe(8);
        expect(faceSizes('cube')).toEqual([4, 4, 4, 4, 4, 4]);
    });

    it('el cubo mantiene el lado histórico (1.5 × radio)', () => {
        const mesh = buildSolidMesh('cube', { x: 4, y: 4, z: 4 });
        const xs = mesh.vertices.map((v) => v.x);
        expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(6, 5); // 1.5 * 4
    });

    it('dodecaedro: 20 vértices y 12 caras pentagonales', () => {
        expect(vertexCount('dodecahedron')).toBe(20);
        expect(faceSizes('dodecahedron')).toEqual(Array(12).fill(5));
    });

    it('icosaedro: 12 vértices y 20 caras triangulares', () => {
        expect(vertexCount('icosahedron')).toBe(12);
        expect(faceSizes('icosahedron')).toEqual(Array(20).fill(3));
    });

    it('la pirámide tiene base cuadrada de 4 lados y 4 triángulos', () => {
        const mesh = buildSolidMesh('pyramid', { x: 3, y: 6, z: 3 });
        expect(mesh.vertices.length).toBe(5);
        expect(mesh.faces).toHaveLength(5);
    });

    it('la esfera es convexa: todos los vértices a la misma distancia del centro', () => {
        const mesh = buildSolidMesh('sphere', { x: 5, y: 5, z: 5 });
        for (const v of mesh.vertices) {
            expect(Math.hypot(v.x, v.y, v.z)).toBeCloseTo(5, 4);
        }
    });
});

describe('rotación coherente con Three.js', () => {
    const cases = [
        { x: 0.3, y: 0.7, z: 0 },
        { x: 0, y: 0.4, z: 1.1 },
        { x: 0.9, y: 0.2, z: 0.6 },
    ];

    it.each(cases)('rotateStorePoint coincide con el grupo de Three (%o)', (rot) => {
        // El grupo 3D se monta con rotation=[rx, rz, ry] (Y de Three = Z del store)
        const euler = new THREE.Euler(rot.x, rot.z, rot.y, 'XYZ');
        const matrix = new THREE.Matrix4().makeRotationFromEuler(euler);

        const points = [
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 },
            { x: 0, y: 0, z: 1 },
            { x: 0.5, y: -1.2, z: 2.3 },
        ];

        for (const p of points) {
            const ours = rotateStorePoint(p, rot);
            const v = new THREE.Vector3(p.x, p.z, p.y).applyMatrix4(matrix);
            expect(ours.x).toBeCloseTo(v.x, 6);
            expect(ours.z).toBeCloseTo(v.y, 6);
            expect(ours.y).toBeCloseTo(v.z, 6);
        }
    });

    it('girar un cubo 45° en Z agranda su planta √2', () => {
        const mesh = buildSolidMesh('cube', { x: 4, y: 4, z: 4 }); // lado 6
        const rotated = mesh.vertices.map((v) => rotateStorePoint(v, { x: 0, y: 0, z: Math.PI / 4 }));
        const xs = rotated.map((v) => v.x);
        const width = Math.max(...xs) - Math.min(...xs);
        expect(width).toBeCloseTo(6 * Math.SQRT2, 4);
    });

    it('la matriz de Euler del store se puede deshacer', () => {
        const rot = { x: 0.4, y: 0.8, z: 0.2 };
        const back = matrixToStoreEuler(storeEulerToMatrix(rot));
        const a = rotateStorePoint({ x: 1, y: 2, z: 3 }, rot);
        const b = rotateStorePoint({ x: 1, y: 2, z: 3 }, back);
        expect(b.x).toBeCloseTo(a.x, 6);
        expect(b.y).toBeCloseTo(a.y, 6);
        expect(b.z).toBeCloseTo(a.z, 6);
    });

    it('componer un giro de eje equivale a aplicar la matriz del eje', () => {
        const axis = { x: 0, y: 0, z: 1 };
        const angle = Math.PI / 3;
        const current = { x: 0, y: 0, z: Math.PI / 6 };
        const composed = matrixToStoreEuler(multiplyMat3(axisAngleToMatrix(axis, angle), storeEulerToMatrix(current)));

        const p = { x: 2, y: 1, z: 0 };
        // Giro del eje (Rodrigues, el mismo que usa calculateRotatedPoint en RotationTool)
        // aplicado después de la orientación actual
        const manual = applyMat3(axisAngleToMatrix(axis, angle), rotateStorePoint(p, current));
        const viaMatrix = rotateStorePoint(p, composed);

        expect(viaMatrix.x).toBeCloseTo(manual.x, 6);
        expect(viaMatrix.y).toBeCloseTo(manual.y, 6);
        expect(viaMatrix.z).toBeCloseTo(manual.z, 6);
    });

    it('transformVertex aplica rotación y traslación', () => {
        const out = transformVertex({ x: 1, y: 0, z: 0 }, { x: 10, y: 20, z: 30 }, { x: 0, y: Math.PI / 2, z: 0 });
        // Girar (1,0,0) 90° alrededor del alejamiento (Y del store): pasa a (0,0,1)
        expect(out.x).toBeCloseTo(10, 6);
        expect(out.y).toBeCloseTo(20, 6);
        expect(out.z).toBeCloseTo(31, 6);
    });
});

describe('aristas que se dibujan en diédrico', () => {
    it('el cubo dibuja sus 12 aristas', () => {
        const mesh = buildSolidMesh('cube', { x: 3, y: 3, z: 3 });
        const edges = getProjectedEdges(mesh);
        expect(edges).toHaveLength(12);
    });

    it('el cilindro no dibuja el wireframe de 32 caras (solo contorno y tapas)', () => {
        const mesh = buildSolidMesh('cylinder', { x: 3, y: 6, z: 3 });
        const edges = getProjectedEdges(mesh);
        // 32 aristas por tapa + 2 siluetas; mucho menos que las 32*2+32 del mallado
        expect(edges.length).toBeGreaterThan(60);
        expect(edges.length).toBeLessThan(80);
    });

    it('la esfera solo dibuja el contorno aparente', () => {
        const mesh = buildSolidMesh('sphere', { x: 3, y: 3, z: 3 });
        const edges = getProjectedEdges(mesh);
        expect(edges.length).toBeGreaterThan(20); // contorno de 36 segmentos (visible + oculto)
        expect(edges.length).toBeLessThan(80);
    });
});
