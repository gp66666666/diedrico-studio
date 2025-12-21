import { useRef } from 'react';
import type { SolidElement } from '../../types';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import { useGeometryStore } from '../../store/geometryStore';

interface SolidObjectProps {
    element: SolidElement;
}

export default function SolidObject({ element }: SolidObjectProps) {
    const { selectElement, selectedElementId } = useGeometryStore();
    const meshRef = useRef<THREE.Mesh>(null);
    const { id, subtype, position, size, color, opacity = 0.5 } = element;
    const isSelected = selectedElementId === id;

    // Convert coordinates: Z is up in 3D Store? 
    // In geometryStore: x, y is horizontal plane, z is height (vertical).
    // In THREE.js: Y is usually up.
    // So we map: x -> x, y -> z, z -> y

    // Wait, let's verify PointObject.tsx or similar to be sure.
    // Viewing Scene.tsx, lines 113-114: [p1.x, p1.z, p1.y] where Y is up.
    const pos: [number, number, number] = [position.x, position.z, position.y];

    // Geometry selection
    // Size.x = radius or side length
    // Size.y = height (for prisms/cones)

    // Polyhedrons usually take a radius
    const radius = size.x;
    const height = size.y;

    let geometry;

    switch (subtype) {
        case 'tetrahedron':
            geometry = <tetrahedronGeometry args={[radius, 0]} />;
            break;
        case 'cube':
            geometry = <boxGeometry args={[radius * 1.5, radius * 1.5, radius * 1.5]} />; // Side length
            break;
        case 'octahedron':
            geometry = <octahedronGeometry args={[radius, 0]} />;
            break;
        case 'dodecahedron':
            geometry = <dodecahedronGeometry args={[radius, 0]} />;
            break;
        case 'icosahedron':
            geometry = <icosahedronGeometry args={[radius, 0]} />;
            break;
        case 'sphere':
            geometry = <sphereGeometry args={[radius, 32, 32]} />;
            break;
        case 'cone':
            // radius, height, radialSegments
            geometry = <coneGeometry args={[radius, height, 32]} />;
            break;
        case 'cylinder':
            // radiusTop, radiusBottom, height, radialSegments
            geometry = <cylinderGeometry args={[radius, radius, height, 32]} />;
            break;
        case 'prism':
            // Hexagonal prism by default? or Square? Let's say Hexagonal (6)
            geometry = <cylinderGeometry args={[radius, radius, height, 6]} />;
            break;
        case 'pyramid':
            // Square pyramid (4 segments)
            geometry = <coneGeometry args={[radius, height, 4]} />;
            break;
        default:
            geometry = <boxGeometry args={[radius, radius, radius]} />;
    }

    // Rotation: x, y, z usually refers to Diédrico system.
    // In THREE.js (Y-up), if we want to rotate around vertical axis, we rotate around Y.
    // In our store, 'z' is often the height/vertical.
    // Let's use Euler rotation [x, z, y] to match our pos mapping.
    const rot: [number, number, number] = element.rotation
        ? [element.rotation.x, element.rotation.z, element.rotation.y]
        : [0, 0, 0];

    return (
        <group position={pos} rotation={rot}>
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    selectElement(id);
                }}
            >
                {geometry}
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={opacity}
                    side={THREE.DoubleSide}
                    roughness={0.1}
                    metalness={0.1}
                />
                <Edges color="white" threshold={15} />
            </mesh>

            {/* Optional: Add a label or specific markers? */}
        </group>
    );
}
