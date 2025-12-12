import { GeometryElement } from '../types';

export const getNextName = (elements: GeometryElement[], prefix: string): string => {
    let counter = 1;
    let name = `${prefix} ${counter}`;

    // Check if name exists, if so increment
    while (elements.some(e => e.name === name)) {
        counter++;
        name = `${prefix} ${counter}`;
    }

    return name;
};
