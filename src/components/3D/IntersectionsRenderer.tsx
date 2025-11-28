import { useMemo } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { intersectLinePlane, intersectPlanePlane, intersectLineLine } from '../../utils/mathUtils';
import { Sphere, Line, Text } from '@react-three/drei';
import type { GeometryElement, LineElement, PlaneElement } from '../../types';

export default function IntersectionsRenderer() {
    const { elements, showIntersections } = useGeometryStore();

    const intersections = useMemo(() => {
        if (!showIntersections) return [];

        const results: JSX.Element[] = [];
        let key = 0;

        // Compare every pair of elements
        for (let i = 0; i < elements.length; i++) {
            for (let j = i + 1; j < elements.length; j++) {
                const el1 = elements[i];
                const el2 = elements[j];

                if (!el1.visible || !el2.visible) continue;

                // Line - Plane
                if ((el1.type === 'line' && el2.type === 'plane') || (el1.type === 'plane' && el2.type === 'line')) {
                    const line = (el1.type === 'line' ? el1 : el2) as LineElement;
                    const plane = (el1.type === 'plane' ? el1 : el2) as PlaneElement;

                    const intersection = intersectLinePlane(line.point, line.direction, plane.normal, plane.constant);

                    if (intersection) {
                        results.push(
                            <group key={`int-${key++}`} position={[intersection.x, intersection.y, intersection.z]}>
                                <Sphere args={[0.2]}>
                                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
                                </Sphere>
                                <Text position={[0, 0.5, 0]} fontSize={0.25} color="#fbbf24">
                                    I ({line.name} ∩ {plane.name})
                                </Text>
                            </group>
                        );
                    }
                }

                // Plane - Plane
                if (el1.type === 'plane' && el2.type === 'plane') {
                    const p1 = el1 as PlaneElement;
                    const p2 = el2 as PlaneElement;

                    const intersection = intersectPlanePlane(p1.normal, p1.constant, p2.normal, p2.constant);

                    if (intersection) {
                        const start = {
                            x: intersection.point.x - intersection.direction.x * 50,
                            y: intersection.point.y - intersection.direction.y * 50,
                            z: intersection.point.z - intersection.direction.z * 50,
                        };
                        const end = {
                            x: intersection.point.x + intersection.direction.x * 50,
                            y: intersection.point.y + intersection.direction.y * 50,
                            z: intersection.point.z + intersection.direction.z * 50,
                        };

                        results.push(
                            <group key={`int-${key++}`}>
                                <Line
                                    points={[[start.x, start.y, start.z], [end.x, end.y, end.z]]}
                                    color="#fbbf24"
                                    lineWidth={3}
                                    dashed
                                    dashScale={2}
                                    dashSize={1}
                                    gapSize={0.5}
                                />
                                <Text position={[intersection.point.x, intersection.point.y + 1, intersection.point.z]} fontSize={0.3} color="#fbbf24">
                                    Recta Int. ({p1.name} ∩ {p2.name})
                                </Text>
                            </group>
                        );
                    }
                }

                // Line - Line
                if (el1.type === 'line' && el2.type === 'line') {
                    const l1 = el1 as LineElement;
                    const l2 = el2 as LineElement;

                    const intersection = intersectLineLine(l1.point, l1.direction, l2.point, l2.direction);

                    if (intersection) {
                        results.push(
                            <group key={`int-${key++}`} position={[intersection.x, intersection.y, intersection.z]}>
                                <Sphere args={[0.2]}>
                                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
                                </Sphere>
                                <Text position={[0, 0.5, 0]} fontSize={0.25} color="#ef4444">
                                    I ({l1.name} ∩ {l2.name})
                                </Text>
                            </group>
                        );
                    }
                }
            }
        }

        return results;
    }, [elements, showIntersections]);

    return <>{intersections}</>;
}
