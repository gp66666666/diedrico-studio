// Utility to detect and merge coincident text labels

const PROXIMITY_THRESHOLD = 15; // pixels - labels closer than this are considered coincident

export interface TextLabel {
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize?: number;
    elementId: string;
}

export function mergeCoincidentLabels(labels: TextLabel[]): TextLabel[] {
    if (labels.length === 0) return [];

    const merged: TextLabel[] = [];
    const processed = new Set<number>();

    for (let i = 0; i < labels.length; i++) {
        if (processed.has(i)) continue;

        const current = labels[i];
        const coincident: TextLabel[] = [current];

        // Find all labels near this one
        for (let j = i + 1; j < labels.length; j++) {
            if (processed.has(j)) continue;

            const other = labels[j];
            const distance = Math.sqrt(
                Math.pow(current.x - other.x, 2) + Math.pow(current.y - other.y, 2)
            );

            if (distance < PROXIMITY_THRESHOLD) {
                coincident.push(other);
                processed.add(j);
            }
        }

        processed.add(i);

        // Merge coincident labels
        if (coincident.length > 1) {
            // Sort by text to ensure consistent order (e.g., V' before V'')
            coincident.sort((a, b) => {
                // Simple sort: single prime before double prime
                const aPrimes = (a.text.match(/'/g) || []).length;
                const bPrimes = (b.text.match(/'/g) || []).length;
                return aPrimes - bPrimes;
            });

            merged.push({
                ...current,
                text: coincident.map(l => l.text).join('-'),
                elementId: coincident.map(l => l.elementId).join(',')
            });
        } else {
            merged.push(current);
        }
    }

    return merged;
}

// Extract text labels from Point2D element
export function extractPointLabels(element: any, SCALE: number): TextLabel[] {
    const px = element.coords.x * SCALE;
    const py_h = element.coords.y * SCALE;
    const py_v = -element.coords.z * SCALE;

    return [
        {
            x: px + 5,
            y: py_v - 5,
            text: `${element.name}''`,
            color: element.color,
            fontSize: 12,
            elementId: element.id
        },
        {
            x: px + 5,
            y: py_h + 15,
            text: `${element.name}'`,
            color: element.color,
            fontSize: 12,
            elementId: element.id
        }
    ];
}
