import { Plane, Text } from '@react-three/drei';
import * as THREE from 'three';

export default function SystemPlanes() {
    const size = 40;
    const opacity = 0.1;
    const bisectorOpacity = 0.15;

    return (
        <group>
            {/* --- Projection Planes Extensions (Quadrants) --- */}

            {/* Horizontal Plane (XY) - Ground */}
            {/* Already partially covered by grid, but let's make it explicit for negative quadrants */}
            <Plane args={[size, size]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <meshBasicMaterial color="#a1a1aa" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
            </Plane>

            {/* Vertical Plane (XZ) - Wall */}
            {/* We need to visualize the negative part (below ground) too */}
            <Plane args={[size, size]} position={[0, 0, 0]}>
                <meshBasicMaterial color="#a1a1aa" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
            </Plane>


            {/* --- Bisectors --- */}

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

            {/* --- Quadrant Labels --- */}
            <Text position={[5, 5, 5]} fontSize={1} color="white" fillOpacity={0.3}>I</Text>
            <Text position={[5, 5, -5]} fontSize={1} color="white" fillOpacity={0.3}>II</Text>
            <Text position={[5, -5, -5]} fontSize={1} color="white" fillOpacity={0.3}>III</Text>
            <Text position={[5, -5, 5]} fontSize={1} color="white" fillOpacity={0.3}>IV</Text>

        </group>
    );
}
