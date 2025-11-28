import { X } from 'lucide-react';

interface HelpGuideProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
}

export default function HelpGuide({ isOpen, onClose, isDark }: HelpGuideProps) {
    if (!isOpen) return null;

    const bgClass = isDark ? 'bg-gray-900 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-gray-200';
    const headerClass = isDark ? 'border-gray-700' : 'border-gray-200';
    const itemClass = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';

    const tools = [
        {
            name: "Seleccionar / Mover",
            desc: "Herramienta principal. Haz clic para seleccionar objetos. Arrastra para mover puntos, líneas o figuras completas. Haz clic en el fondo para deseleccionar."
        },
        {
            name: "Punto",
            desc: "Haz clic en cualquier lugar del lienzo para crear un punto."
        },
        {
            name: "Segmento",
            desc: "Clic 1: Punto inicial. Clic 2: Punto final. Crea una línea finita entre dos puntos."
        },
        {
            name: "Semirrecta",
            desc: "Clic 1: Origen. Clic 2: Dirección. Crea una línea que empieza en un punto y se extiende al infinito en una dirección."
        },
        {
            name: "Recta Infinita",
            desc: "Clic 1: Primer punto de paso. Clic 2: Segundo punto de paso. Crea una línea infinita en ambas direcciones."
        },
        {
            name: "Circunferencia",
            desc: "Clic 1: Centro. Mueve el ratón para definir el radio. Clic 2: Fija el radio."
        },
        {
            name: "Arco",
            desc: "Clic 1: Centro. Clic 2: Punto de inicio del arco. Clic 3: Punto final del arco."
        },
        {
            name: "Polígono Regular",
            desc: "Clic 1: Centro. Clic 2: Vértice (define el radio). Luego introduce el número de lados deseado."
        },
        {
            name: "Mediatriz",
            desc: "Clic 1: Primer punto. Clic 2: Segundo punto. Crea automáticamente una recta perpendicular que pasa por el punto medio de ambos."
        },
        {
            name: "Bisectriz",
            desc: "Clic 1: Punto en un lado. Clic 2: Vértice del ángulo. Clic 3: Punto en el otro lado. Crea la semirrecta que divide el ángulo en dos partes iguales."
        },
        {
            name: "Tangentes",
            desc: "Selecciona dos objetos (Punto-Circunferencia o Circunferencia-Circunferencia) para crear automáticamente todas las rectas tangentes posibles entre ellos."
        },
        {
            name: "Texto",
            desc: "Haz clic donde quieras colocar el texto. Aparecerá un cuadro para que escribas el contenido."
        },
        {
            name: "Rotar (3 Puntos)",
            desc: "1. Selecciona la herramienta. 2. Clic para definir el Centro de Rotación (Pivote). 3. Clic para definir el inicio del ángulo (palanca). 4. Mueve el ratón para rotar la figura seleccionada y haz clic para fijar."
        },
        {
            name: "Escalar (Homotecia)",
            desc: "1. Selecciona la herramienta. 2. Clic para definir el Centro de Escala. 3. Arrastra el ratón alejándote o acercándote al centro para agrandar o reducir la figura seleccionada."
        },
        {
            name: "Borrador",
            desc: "Haz clic sobre cualquier elemento (línea, punto, texto, etc.) para eliminarlo permanentemente."
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl shadow-2xl border ${bgClass}`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${headerClass}`}>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        📖 Guía de Herramientas
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-500/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <p className="opacity-80 mb-4">
                        Bienvenido al modo Boceto. Aquí tienes una explicación detallada de cómo usar cada herramienta disponible en la barra lateral.
                    </p>

                    <div className="grid gap-3">
                        {tools.map((tool, index) => (
                            <div key={index} className={`p-3 rounded-lg border transition-colors ${headerClass} ${itemClass}`}>
                                <h3 className="font-bold text-blue-500 mb-1">{tool.name}</h3>
                                <p className="text-sm opacity-90 leading-relaxed">
                                    {tool.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t text-xs opacity-50 text-center ${headerClass}`}>
                    Diedrico 3D - Manual de Usuario v1.0
                </div>
            </div>
        </div>
    );
}
