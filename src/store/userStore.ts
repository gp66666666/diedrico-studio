import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    is_premium: boolean;
    role: 'user' | 'admin';
}

interface UserState {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;

    // Actions
    checkSession: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,

    checkSession: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                set({ user: session.user });
                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    set({ profile });
                } else {
                    // Create default profile if not exists
                    const newProfile = {
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: session.user.user_metadata.full_name,
                        avatar_url: session.user.user_metadata.avatar_url,
                        is_premium: false,
                        role: 'user'
                    };
                    // Ideally this is done via Postgres Triggers, but client-side fallback:
                    // await supabase.from('profiles').insert(newProfile);
                    set({ profile: newProfile as UserProfile });
                }
            }
        } catch (error) {
            console.error('Session check failed', error);
        } finally {
            set({ isLoading: false });
        }
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error('Login failed', error);
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    }
}));
