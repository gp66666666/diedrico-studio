import { useEffect, useState } from 'react';
import { LogIn, LogOut, Crown, User as UserIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

export default function UserMenu() {
    const { user, profile, isLoading, checkSession, signInWithGoogle, signOut } = useUserStore();
    const [isExpanded, setIsExpanded] = useState(false);

                    <a
                        href="https://ko-fi.com/diedricostudio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/30 transition-colors text-xs font-medium"
                    >
                        <span>☕ Invítame a un café</span>
                    </a>

                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors text-xs text-gray-500"
                    >
                        <LogOut size={14} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div >
            )
}
        </div >
    );
}
