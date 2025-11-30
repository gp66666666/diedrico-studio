// Color Manager for AI Steps
// Automatically assigns colors to construction steps

const STEP_COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
];

export class ColorManager {
    private colorIndex = 0;

    getNextColor(): string {
        const color = STEP_COLORS[this.colorIndex % STEP_COLORS.length];
        this.colorIndex++;
        return color;
    }

    reset(): void {
        this.colorIndex = 0;
    }

    getColorForStep(stepNumber: number): string {
        return STEP_COLORS[(stepNumber - 1) % STEP_COLORS.length];
    }
}

export const colorManager = new ColorManager();
