import { Plane, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '../../store/geometryStore';

export default function SystemPlanes({ showBisectors }: { showBisectors: boolean }) {
    const { theme } = useGeometryStore();
    const isDark = theme === 'dark';

    const size = 40;
    // Dark Mode: Opacity 0.1 (Original), Color #c55dc5ff (Original)
    // Light Mode: Opacity 0.3 (Higher), Color #4c1d95 (Deep Violet)
    const opacity = isDark ? 0.1 : 0.3;
    const planeColor = isDark ? "#c55dc5ff" : "#4c1d95";
    const gridColor = isDark ? "white" : "black";
    const bisectorOpacity = 0.15;

    return (
        <group>
            {/* --- Projection Planes Extensions (Quadrants) --- */}

            {/* Horizontal Plane (XY) - Ground */}
            {/* Already partially covered by grid, but let's make it explicit for negative quadrants */}
            {/* Horizontal Plane (XY) - Ground */}
            {/* Offset slightly to avoid Z-fighting with the grid */}
            <Plane args={[size, size]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                <meshBasicMaterial color={planeColor} transparent opacity={isDark ? 0.3 : 0.1} side={THREE.DoubleSide} depthWrite={false} />
            </Plane>

            {/* Vertical Plane (XZ) - Wall */}
            {/* We need to visualize the negative part (below ground) too */}
            {/* Vertical Plane (XZ) - Wall */}
            {/* Offset slightly to avoid Z-fighting */}
            <Plane args={[size, size]} position={[0, 0, -0.02]}>
                <meshBasicMaterial color={planeColor} transparent opacity={isDark ? 0.3 : 0.1} side={THREE.DoubleSide} depthWrite={false} />
            </Plane>


            {/* --- Bisectors --- */}
            {showBisectors && (
                <>
                    {/* First Bisector (y = z) - Passes through 1st and 3rd Quadrants */}
                    {/* Rotated 45 degrees around X axis */}
                    <group rotation={[Math.PI / 4, 0, 0]}>
                        <Plane args={[size, size]}>
                            <meshBasicMaterial color="#f97316" transparent opacity={bisectorOpacity} side={THREE.DoubleSide} depthWrite={false} />
                        </Plane>
                        {/* Label */}
                        <Text position={[size / 2 - 2, 2, 0]} fontSize={0.8} color="#f97316" anchorX="right">
                            1er Bisector
                        </Text>
                    </group>

                    {/* Second Bisector (y = -z) - Passes through 2nd and 4th Quadrants */}
                    {/* Rotated -45 degrees around X axis */}
                    <group rotation={[-Math.PI / 4, 0, 0]}>
                        <Plane args={[size, size]}>
                            <meshBasicMaterial color="#10b981" transparent opacity={bisectorOpacity} side={THREE.DoubleSide} depthWrite={false} />
                        </Plane>
                        {/* Label */}
                        <Text position={[size / 2 - 2, 2, 0]} fontSize={0.8} color="#10b981" anchorX="right">
                            2do Bisector
                        </Text>
                    </group>
                </>
            )}

            {/* --- Quadrant Labels --- */}
            <Text position={[5, 5, 5]} fontSize={1} color={gridColor} fillOpacity={0.5}>I Cuadrante</Text>
            <Text position={[5, 5, -5]} fontSize={1} color={gridColor} fillOpacity={0.5}>II Cuadrante</Text>
            <Text position={[5, -5, -5]} fontSize={1} color={gridColor} fillOpacity={0.5}>III Cuadrante</Text>
            <Text position={[5, -5, 5]} fontSize={1} color={gridColor} fillOpacity={0.5}>IV Cuadrante</Text>

        </group>
    );
}
