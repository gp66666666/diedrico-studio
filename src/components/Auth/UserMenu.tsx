import { useEffect, useState } from 'react';
import { LogIn, LogOut, Crown, User as UserIcon, ChevronUp, ChevronDown, Info, Mail, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import PremiumModal from './PremiumModal';

export default function UserMenu() {
    const { user, profile, isLoading, checkSession, signInWithGoogle, signOut } = useUserStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
        checkSession();
    }, []);

    if (isLoading) {
        return <div className="h-8 w-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />;
    }

    if (!user) {
        return (
            <div className="flex flex-col gap-2 w-full">
                {/* Ultra-Compact Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <div className="flex items-center gap-1.5">
                        <UserIcon size={14} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">Usuario</span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </button>

                {/* Collapsible Content */}
                {isExpanded && (
                    <div className="flex flex-col gap-2 pl-2">
                        <button
                            onClick={signInWithGoogle}
                            className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-200"
                        >
                            <LogIn size={16} />
                            <span>Iniciar Sesión</span>
                        </button>

                        {/* Conócenos Section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 px-2">CONÓCENOS</p>
                            <div className="space-y-1">
                                <Link
                                    to="/about"
                                    className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-700 dark:text-gray-300"
                                >
                                    <Info size={14} />
                                    <span>Quiénes Somos</span>
                                </Link>
                                <Link
                                    to="/contact"
                                    className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-700 dark:text-gray-300"
                                >
                                    <Mail size={14} />
                                    <span>Contacto</span>
                                </Link>
                                <Link
                                    to="/privacy"
                                    className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-700 dark:text-gray-300"
                                >
                                    <Shield size={14} />
                                    <span>Privacidad</span>
                                </Link>
                                <Link
                                    to="/terms"
                                    className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-700 dark:text-gray-300"
                                >
                                    <FileText size={14} />
                                    <span>Términos</span>
                                </Link>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowPremiumModal(true)}
                            className="flex items-center justify-center gap-1.5 w-full p-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-md transition-all text-xs font-bold"
                        >
                            <Crown size={14} />
                            <span>Hacerse Premium</span>
                        </button>

                        <a
                            href="https://ko-fi.com/eloigperezzds"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/30 transition-colors text-xs font-medium"
                        >
                            <span>☕ Invítame a un café</span>
                        </a>
                    </div>
                )}

                <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 w-full border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            {/* Ultra-Compact Header when collapsed */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-center gap-1.5">
                    <UserIcon size={14} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">Usuario</span>
                    {profile?.is_premium && !isExpanded && (
                        <Crown size={10} className="text-yellow-500" />
                    )}
                </div>
                {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>

            {/* Collapsible Content - Shows full info when expanded */}
            {isExpanded && (
                <div className="flex flex-col gap-2 pl-2">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                <UserIcon size={16} />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                                {profile?.full_name || user.email}
                            </p>
                            {profile?.is_premium ? (
                                <span className="text-[10px] bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
                                    <Crown size={8} /> PREMIUM
                                </span>
                            ) : (
                                <span className="text-[10px] text-gray-500">Plan Gratuito</span>
                            )}
                        </div>
                    </div>

                    {!profile?.is_premium && (
                        <button className="flex items-center justify-center gap-1.5 w-full p-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-md transition-all text-xs font-bold">
                            <Crown size={14} />
                            <span>Hacerse Premium</span>
                        </button>
                    )}

                    <a
                        href="https://ko-fi.com/diedricostudio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/30 transition-colors text-xs font-medium"
                    >
                        <span>☕ Invítame a un café</span>
                    </a>

                    {/* Conócenos Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 px-2">CONÓCENOS</p>
                        <div className="space-y-1">
                            <Link
                                to="/about"
                                className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-700 dark:text-gray-300"
                            >
                                <Info size={14} />
                                <span>Quiénes Somos</span>
                            </Link>
                            <Link
                                to="/contact"
                                className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-700 dark:text-gray-300"
                            >
                                <Mail size={14} />
                                <span>Contacto</span>
                            </Link>
                            <Link
                                to="/privacy"
                                className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-700 dark:text-gray-300"
                            >
                                <Shield size={14} />
                                <span>Privacidad</span>
                            </Link>
                            <Link
                                to="/terms"
                                className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-700 dark:text-gray-300"
                            >
                                <FileText size={14} />
                                <span>Términos</span>
                            </Link>
                        </div>
                    </div>

                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors text-xs text-gray-500"
                    >
                        <LogOut size={14} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            )}
        </div>
    );
}
