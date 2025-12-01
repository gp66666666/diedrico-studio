import { useState, useEffect } from 'react';
import { X, FolderOpen, Loader, Trash2, Calendar } from 'lucide-react';
import { useGeometryStore } from '../../store/geometryStore';

interface LoadProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoadProjectModal({ isOpen, onClose }: LoadProjectModalProps) {
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { loadProject, getUserProjects } = useGeometryStore();

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen]);

    const fetchProjects = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getUserProjects();
            setProjects(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar proyectos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoad = async (projectId: string) => {
        try {
            await loadProject(projectId);
            onClose();
            alert('✅ Proyecto cargado correctamente');
        } catch (err: any) {
            setError(err.message || 'Error al cargar el proyecto');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <FolderOpen size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Cargar Proyecto</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader size={32} className="animate-spin text-blue-600" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600 dark:text-gray-400">No tienes proyectos guardados</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                Guarda tu primer proyecto desde el botón "Guardar"
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                                    onClick={() => handleLoad(project.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                            {project.title}
                                        </h4>
                                        {project.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 dark:text-gray-500">
                                            <Calendar size={10} />
                                            {new Date(project.updated_at).toLocaleDateString('es-ES')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLoad(project.id);
                                        }}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        Cargar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
