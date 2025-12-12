import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGeometryStore } from '../store/geometryStore';
import { getNextName } from '../utils/namingUtils';

export default function LineCreator() {
    const { elements, addElement } = useGeometryStore();
    const [point1, setPoint1] = useState('');
    const [point2, setPoint2] = useState('');
    const [lineName, setLineName] = useState('');

    const points = elements.filter(el => el.type === 'point');

    const handleCreateLine = () => {
        if (!point1 || !point2) {
            alert('Selecciona ambos puntos');
            return;
        }

        if (point1 === point2) {
            alert('Los puntos deben ser diferentes');
            return;
        }

        const p1 = points.find(p => p.id === point1);
        const p2 = points.find(p => p.id === point2);

        if (!p1 || !p2) {
            alert('Puntos no encontrados');
            return;
        }

        // Calculate direction vector
        const direction = {
            x: p2.coords.x - p1.coords.x,
            y: p2.coords.y - p1.coords.y,
            z: p2.coords.z - p1.coords.z,
        };

        // Normalize
        const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
            direction.z /= length;
        }

        const defaultName = getNextName(elements, 'recta');

        const lineElement: Omit<import('../types').LineElement, 'id' | 'visible'> = {
            type: 'line',
            name: lineName || defaultName,
            color: '#ef4444',
            point: p1.coords,
            direction,
            p2: p2.coords
        };

        addElement(lineElement as any);

        // Reset form
        setPoint1('');
        setPoint2('');
        setLineName('');
    };

    if (points.length < 2) {
        return (
            <div className="text-xs text-gray-500 dark:text-gray-400 p-2">
                Necesitas al menos 2 puntos para crear una recta
            </div>
        );
    }

    return (
        <div className="space-y-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Crear Recta por Puntos
            </label>

            <input
                type="text"
                value={lineName}
                onChange={(e) => setLineName(e.target.value)}
                placeholder="Nombre (ej: r)"
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <select
                value={point1}
                onChange={(e) => setPoint1(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
                <option value="">Punto 1</option>
                {points.map(p => (
                    <option key={p.id} value={p.id}>
                        {p.name} ({p.coords.x}, {p.coords.y}, {p.coords.z})
                    </option>
                ))}
            </select>

            <select
                value={point2}
                onChange={(e) => setPoint2(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
                <option value="">Punto 2</option>
                {points.map(p => (
                    <option key={p.id} value={p.id} disabled={p.id === point1}>
                        {p.name} ({p.coords.x}, {p.coords.y}, {p.coords.z})
                    </option>
                ))}
            </select>

            <button
                onClick={handleCreateLine}
                disabled={!point1 || !point2}
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
            >
                <Plus size={14} />
                Crear Recta
            </button>
        </div>
    );
}
