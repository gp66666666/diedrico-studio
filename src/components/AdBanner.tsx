import { useUserStore } from '../store/userStore';
import { ExternalLink } from 'lucide-react';

export default function AdBanner() {
    const { profile } = useUserStore();

    // Don't show ads to premium users
    if (profile?.is_premium) return null;

    return (
        <div className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-t border-gray-200 dark:border-gray-700">
            {/* Placeholder until Carbon Ads is approved */}
            <div className="max-w-sm mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                        {/* Placeholder Image */}
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl">📢</span>
                        </div>

                        {/* Ad Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                                Espacio publicitario disponible
                            </p>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                                Aquí aparecerán anuncios relevantes para estudiantes y profesionales de ingeniería.
                            </p>
                            <div className="flex items-center gap-2">
                                <a
                                    href="mailto:eloigperezz@gmail.com?subject=Publicidad en Diedrico Studio"
                                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    Anúnciate aquí <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Carbon Ads attribution style */}
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-2 text-center">
                        ads via Carbon
                    </p>
                </div>
            </div>
        </div>
    );
}
