import { useUserStore } from '../store/userStore';
import { ExternalLink } from 'lucide-react';

export default function AdBanner() {
    const { profile } = useUserStore();

    // Don't show ads to premium users
    if (profile?.is_premium) return null;

    return (
        <div className="w-full py-1.5 px-2 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            {/* Placeholder until Carbon Ads is approved */}
            <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-2 text-[10px]">
                    {/* Compact Icon */}
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-sm md:text-base">📢</span>
                    </div>

                    {/* Ad Content - Horizontal layout */}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                            Espacio publicitario
                        </p>
                    </div>

                    {/* CTA */}
                    <a
                        href="mailto:eloigperezz@gmail.com?subject=Publicidad en Diedrico Studio"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 whitespace-nowrap hidden sm:flex"
                    >
                        Anúnciate <ExternalLink size={10} />
                    </a>

                    {/* Carbon attribution */}
                    <span className="text-[8px] text-gray-400 dark:text-gray-500 hidden md:block">
                        ads via Carbon
                    </span>
                </div>
            </div>
        </div>
    );
}
