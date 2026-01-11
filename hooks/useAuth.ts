import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useRouter, useSegments } from 'expo-router';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [initialized, setInitialized] = useState(false);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setInitialized(true);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!initialized) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (user && (inAuthGroup || segments.length === 0)) {
            router.replace('/(tabs)/dashboard');
        }
    }, [user, segments, initialized]);

    return { user, initialized };
}
