import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { LineElement, PlaneElement, PointElement } from '../../types';

export default function ParallelismTool() {
    const { activeTool, elements, addElement, setActiveTool, selectForDistance, selectedForDistance } = useGeometryStore();

    useEffect(() => {
        // Handle element selection via selectedForDistance
        if (!activeTool || (!activeTool.startsWith('parallel-') && !activeTool.startsWith('perp-') && !activeTool.startsWith('plane-') && !activeTool.startsWith('line-'))) return;

        // Determine required count based on tool
        let requiredCount = 2;
        if (['plane-perp-2-planes', 'line-parallel-2-planes', 'plane-parallel-2-lines'].includes(activeTool)) {
            requiredCount = 3;
        }

        console.log(`[ParallelismTool] activeTool=${activeTool}, selected=${selectedForDistance.length}/${requiredCount}`);

        // Check if we have enough elements
        if (selectedForDistance.length === requiredCount) {
            console.log(`[ParallelismTool] Triggering creation...`);
            createParallelOrPerpendicular();
        }
    }, [selectedForDistance, activeTool]);

    const createParallelOrPerpendicular = () => {
        try {
            switch (activeTool) {
                case 'parallel-line-line':
                    createParallelLineToLine();
                    break;
                case 'perp-line-plane':
                    createPerpLineToPlane();
                    break;
                case 'perp-plane-line':
                    createPerpPlaneToLine();
                    break;
                case 'perp-line-line':
                    createPerpLineToLine();
                    break;
                case 'plane-parallel-plane':
                    createPlaneParallelToPlane();
                    break;
                case 'plane-perp-2-planes':
                    createPlanePerpTo2Planes();
                    break;
                case 'line-parallel-2-planes':
                    createLineParallelTo2Planes();
                    break;
                case 'plane-parallel-2-lines':
                    createPlaneParallelTo2Lines();
                    break;
            }
        } catch (error) {
            console.error('Parallelism/Perpendicularity error:', error);
            alert('Error al crear el elemento paralelo/perpendicular.');
        }

        setActiveTool('none');
    };

    const createParallelLineToLine = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        let refLine: LineElement | undefined;
        let point: PointElement | undefined;

        if (el1?.type === 'line' && el2?.type === 'point') {
            refLine = el1 as LineElement;
            point = el2 as PointElement;
        } else if (el1?.type === 'point' && el2?.type === 'line') {
            point = el1 as PointElement;
            refLine = el2 as LineElement;
        } else {
            alert('Selecciona una recta y un punto.');
            return;
        }

        const pointCoords = point.coords;
        const direction = refLine.direction;

        // Create p2 for visualization
        const p2 = {
            x: pointCoords.x + direction.x * 10,
            y: pointCoords.y + direction.y * 10,
            z: pointCoords.z + direction.z * 10
        };

        addElement({
            type: 'line',
            name: `r∥${refLine.name}`,
            point: pointCoords,
            p2: p2,
            direction: direction,
            color: '#00FF00', // Green for parallel
            visible: true
        } as any);

        console.log(`Created parallel line to ${refLine.name}`);
    };

    const createPerpLineToPlane = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        let plane: PlaneElement | undefined;
        let pointEl: PointElement | undefined;

        if (el1?.type === 'plane' && el2?.type === 'point') {
            plane = el1 as PlaneElement;
            pointEl = el2 as PointElement;
        } else if (el1?.type === 'point' && el2?.type === 'plane') {
            pointEl = el1 as PointElement;
            plane = el2 as PlaneElement;
        } else {
            alert('Selecciona un plano y un punto.');
            return;
        }

        const pointCoords = pointEl.coords;
        const direction = plane.normal;

        const p2 = {
            x: pointCoords.x + direction.x * 10,
            y: pointCoords.y + direction.y * 10,
            z: pointCoords.z + direction.z * 10
        };

        addElement({
            type: 'line',
            name: `r⊥${plane.name}`,
            point: pointCoords,
            p2: p2,
            direction: direction,
            color: '#FF00FF', // Magenta for perpendicular
            visible: true
        } as any);

        console.log(`Created perpendicular line to ${plane.name}`);
    };

    const createPerpPlaneToLine = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        let line: LineElement | undefined;
        let pointEl: PointElement | undefined;

        if (el1?.type === 'line' && el2?.type === 'point') {
            line = el1 as LineElement;
            pointEl = el2 as PointElement;
        } else if (el1?.type === 'point' && el2?.type === 'line') {
            pointEl = el1 as PointElement;
            line = el2 as LineElement;
        } else {
            alert('Selecciona una recta y un punto.');
            return;
        }

        const pointCoords = pointEl.coords;
        const normal = line.direction;
        const constant = normal.x * pointCoords.x + normal.y * pointCoords.y + normal.z * pointCoords.z;

        addElement({
            type: 'plane',
            name: `α⊥${line.name}`,
            normal: normal,
            constant: constant,
            color: '#FF00FF', // Magenta for perpendicular
            visible: true
        } as any);

        console.log(`Created perpendicular plane to ${line.name}`);
    };

    const createPerpLineToLine = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        let refLine: LineElement | undefined;
        let point: PointElement | undefined;

        if (el1?.type === 'line' && el2?.type === 'point') {
            refLine = el1 as LineElement;
            point = el2 as PointElement;
        } else if (el1?.type === 'point' && el2?.type === 'line') {
            point = el1 as PointElement;
            refLine = el2 as LineElement;
        } else {
            alert('Selecciona una recta y un punto.');
            return;
        }

        const P = point.coords;
        const L0 = refLine.point;
        const d = refLine.direction;

        // Vector from L0 to P
        const w = { x: P.x - L0.x, y: P.y - L0.y, z: P.z - L0.z };

        // Project w onto d: t = (w·d)/(d·d)
        const dotWD = w.x * d.x + w.y * d.y + w.z * d.z;
        const dotDD = d.x * d.x + d.y * d.y + d.z * d.z;
        const t = dotWD / dotDD;

        // Foot of perpendicular
        const F = {
            x: L0.x + t * d.x,
            y: L0.y + t * d.y,
            z: L0.z + t * d.z
        };

        // Direction from P to F
        const direction = {
            x: F.x - P.x,
            y: F.y - P.y,
            z: F.z - P.z
        };

        addElement({
            type: 'line',
            name: `r⊥${refLine.name}`,
            point: P,
            p2: F,
            direction: direction,
            color: '#FF00FF', // Magenta
            visible: true
        } as any);

        console.log(`Created perpendicular line to ${refLine.name} from point`);
    };

    const createPlaneParallelToPlane = () => {
        const [id1, id2] = selectedForDistance;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        let plane: PlaneElement | undefined;
        let point: PointElement | undefined;

        if (el1?.type === 'plane' && el2?.type === 'point') {
            plane = el1 as PlaneElement;
            point = el2 as PointElement;
        } else if (el1?.type === 'point' && el2?.type === 'plane') {
            point = el1 as PointElement;
            plane = el2 as PlaneElement;
        } else {
            alert('Selecciona un plano y un punto.');
            return;
        }

        const normal = plane.normal;
        const P = point.coords;
        // Ax + By + Cz + D = 0 => D = -(Ax + By + Cz)
        const constant = -(normal.x * P.x + normal.y * P.y + normal.z * P.z);

        addElement({
            type: 'plane',
            name: `α∥${plane.name}`,
            normal: normal,
            constant: constant,
            color: '#00FF00',
            visible: true
        } as any);
    };

    const createPlanePerpTo2Planes = () => {
        const [id1, id2, id3] = selectedForDistance;
        const els = [elements.find(e => e.id === id1), elements.find(e => e.id === id2), elements.find(e => e.id === id3)];

        const point = els.find(e => e?.type === 'point') as PointElement;
        const planes = els.filter(e => e?.type === 'plane') as PlaneElement[];

        if (!point || planes.length !== 2) {
            alert('Selecciona un punto y dos planos.');
            return;
        }

        const n1 = planes[0].normal;
        const n2 = planes[1].normal;

        // Cross product of normals
        const n3 = {
            x: n1.y * n2.z - n1.z * n2.y,
            y: n1.z * n2.x - n1.x * n2.z,
            z: n1.x * n2.y - n1.y * n2.x
        };

        const P = point.coords;
        const constant = -(n3.x * P.x + n3.y * P.y + n3.z * P.z);

        addElement({
            type: 'plane',
            name: `α⊥(${planes[0].name},${planes[1].name})`,
            normal: n3,
            constant: constant,
            color: '#FF00FF',
            visible: true
        } as any);
    };

    const createLineParallelTo2Planes = () => {
        const [id1, id2, id3] = selectedForDistance;
        const els = [elements.find(e => e.id === id1), elements.find(e => e.id === id2), elements.find(e => e.id === id3)];

        const point = els.find(e => e?.type === 'point') as PointElement;
        const planes = els.filter(e => e?.type === 'plane') as PlaneElement[];

        if (!point || planes.length !== 2) {
            alert('Selecciona un punto y dos planos.');
            return;
        }

        const n1 = planes[0].normal;
        const n2 = planes[1].normal;

        // Direction is cross product of normals (intersection direction)
        const dir = {
            x: n1.y * n2.z - n1.z * n2.y,
            y: n1.z * n2.x - n1.x * n2.z,
            z: n1.x * n2.y - n1.y * n2.x
        };

        const P = point.coords;
        const p2 = {
            x: P.x + dir.x * 10,
            y: P.y + dir.y * 10,
            z: P.z + dir.z * 10
        };

        addElement({
            type: 'line',
            name: `r∥(${planes[0].name},${planes[1].name})`,
            point: P,
            p2: p2,
            direction: dir,
            color: '#00FF00',
            visible: true
        } as any);
    };

    const createPlaneParallelTo2Lines = () => {
        const [id1, id2, id3] = selectedForDistance;
        const els = [elements.find(e => e.id === id1), elements.find(e => e.id === id2), elements.find(e => e.id === id3)];

        const point = els.find(e => e?.type === 'point') as PointElement;
        const lines = els.filter(e => e?.type === 'line') as LineElement[];

        if (!point || lines.length !== 2) {
            alert('Selecciona un punto y dos rectas.');
            return;
        }

        const d1 = lines[0].direction;
        const d2 = lines[1].direction;

        // Normal is cross product of directions
        const normal = {
            x: d1.y * d2.z - d1.z * d2.y,
            y: d1.z * d2.x - d1.x * d2.z,
            z: d1.x * d2.y - d1.y * d2.x
        };

        const P = point.coords;
        const constant = -(normal.x * P.x + normal.y * P.y + normal.z * P.z);

        addElement({
            type: 'plane',
            name: `α∥(${lines[0].name},${lines[1].name})`,
            normal: normal,
            constant: constant,
            color: '#00FF00',
            visible: true
        } as any);
    };

    return null;
}
