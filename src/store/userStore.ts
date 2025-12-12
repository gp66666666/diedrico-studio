import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    is_premium: boolean;
    completed_exercises?: string[]; // Array of Exercise IDs
    completed_topics?: string[]; // Array of Topic IDs (Lessons)
    role: 'user' | 'admin';
}

interface UserState {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isPremium: boolean; // Derived helper


    // Actions
    checkSession: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    markExerciseComplete: (id: string) => Promise<void>;
    markTopicComplete: (id: string, completed: boolean) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,
    isPremium: false,

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
                    set({ profile, isPremium: profile.is_premium });
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
                    set({ profile: newProfile as UserProfile, isPremium: false });
                }
            } else {
                // GUEST MODE: Load from LocalStorage
                const guestProfile: UserProfile = {
                    id: 'guest',
                    email: 'guest@local',
                    is_premium: false,
                    role: 'user',
                    completed_topics: JSON.parse(localStorage.getItem('guest_completed_topics') || '[]'),
                    completed_exercises: JSON.parse(localStorage.getItem('guest_completed_exercises') || '[]')
                };
                set({ profile: guestProfile, isPremium: false });
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
        // Clear user but keep guest profile or reset it? 
        // Better to reload guest profile or just null (which triggers reload on next session check)
        // We'll set a fresh guest profile
        const guestProfile: UserProfile = {
            id: 'guest',
            email: 'guest@local',
            is_premium: false,
            role: 'user',
            completed_topics: JSON.parse(localStorage.getItem('guest_completed_topics') || '[]'),
            completed_exercises: JSON.parse(localStorage.getItem('guest_completed_exercises') || '[]')
        };
        set({ user: null, profile: guestProfile });
    },

    markExerciseComplete: async (id: string) => {
        const { user, profile } = get();
        if (!profile) return; // Allow null user (guest)

        // Optimistic update
        const currentCompleted = profile.completed_exercises || [];
        if (currentCompleted.includes(id)) return;

        const newCompleted = [...currentCompleted, id];

        set({
            profile: { ...profile, completed_exercises: newCompleted }
        });

        // Persist
        if (user) {
            // DB
            try {
                await supabase
                    .from('profiles')
                    .update({ completed_exercises: newCompleted })
                    .eq('id', user.id);
            } catch (error) {
                console.error('Failed to save progress', error);
            }
        } else {
            // LocalStorage
            localStorage.setItem('guest_completed_exercises', JSON.stringify(newCompleted));
        }
    },

    markTopicComplete: async (id: string, completed: boolean) => {
        const { user, profile } = get();
        if (!profile) return; // Allow null user (guest)

        const currentCompleted = profile.completed_topics || [];
        let newCompleted = [...currentCompleted];

        if (completed) {
            if (!newCompleted.includes(id)) newCompleted.push(id);
        } else {
            newCompleted = newCompleted.filter(tid => tid !== id);
        }

        // Optimistic update
        set({ profile: { ...profile, completed_topics: newCompleted } });

        // Persist
        if (user) {
            // DB
            try {
                await supabase
                    .from('profiles')
                    .update({ completed_topics: newCompleted })
                    .eq('id', user.id);
            } catch (error) {
                console.error('Error updating topic progress:', error);
            }
        } else {
            // LocalStorage
            localStorage.setItem('guest_completed_topics', JSON.stringify(newCompleted));
        }
    }
}));
