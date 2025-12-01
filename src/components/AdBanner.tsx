import { useState } from 'react';
import { X } from 'lucide-react';
import { useUserStore } from '../store/userStore';

export default function AdBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const { profile } = useUserStore();

    // Don't show banner to premium users or if user closed it
    if (!isVisible || profile?.is_premium) {
        return null;
    }

    return (
        <div className="relative w-full bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* Close Button */}
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
                aria-label="Cerrar anuncio"
            >
                <X size={16} className="text-gray-600 dark:text-gray-400" />
            </button>

            {/* AdSense Container - Responsive */}
            <div className="w-full h-[50px] md:h-[90px] flex items-center justify-center overflow-hidden">
                {/* Google AdSense Placeholder */}
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                    {/* Replace this div with actual AdSense script when approved */}
                    <div className="text-center">
                        <p className="font-medium">Google AdSense</p>
                        <p className="text-[10px] opacity-70">Espacio publicitario</p>
                    </div>
                    {/* 
                    When AdSense is approved, replace the above div with:
                    <ins className="adsbygoogle"
                         style={{ display: 'block' }}
                         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                         data-ad-slot="XXXXXXXXXX"
                         data-ad-format="auto"
                         data-full-width-responsive="true">
                    </ins>
                    */}
                </div>
            </div>
        </div>
    );
}
