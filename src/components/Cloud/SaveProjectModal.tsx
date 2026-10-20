import { useEffect, useState } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useGeometryStore } from '../../store/geometryStore';
import { useModalA11y } from '../../hooks/useModalA11y';
import { trackEvent } from '../../lib/analytics';
import { toast } from '../../lib/toast';

interface SaveProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SaveProjectModal({ isOpen, onClose }: SaveProjectModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const { saveProject, currentProjectId, currentProjectTitle } = useGeometryStore();
    const panelRef = useModalA11y(isOpen, onClose);

    // Al abrir, si ya hay un proyecto en curso, se precarga para actualizarlo
    useEffect(() => {
        if (isOpen) {
            setTitle(currentProjectTitle || '');
            setError('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title.trim()) {
            setError('El título es obligatorio');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            await saveProject(title, description);
            trackEvent('project_saved', { updated: !!currentProjectId });
            setDescription('');
            onClose();
            toast.success(currentProjectId ? 'Proyecto actualizado en la nube' : 'Proyecto guardado en la nube');
        } catch (err: any) {
            setError(err.message || 'Error al guardar el proyecto');
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Guardar proyecto"
                tabIndex={-1}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full outline-none"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Save size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {currentProjectId ? 'Actualizar proyecto' : 'Guardar proyecto'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentProjectId
                            ? `Se actualizará «${currentProjectTitle}». Para crear uno nuevo, usa "Limpiar" antes de guardar.`
                            : 'Se creará un proyecto nuevo en tu cuenta.'}
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Título *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Mi proyecto de geometría"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSaving}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción (opcional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción del proyecto..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            disabled={isSaving}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !title.trim()}
                        className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader size={16} className="animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                {currentProjectId ? 'Actualizar' : 'Guardar'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
