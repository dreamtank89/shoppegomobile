import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from './useAuth';

export function useDashboardData() {
    const { user } = useAuth();
    const [revenue, setRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // TODO: Get storeId from user profile or context
        // For now, we need to fetch user profile to get storeId, or assuming single store
        // This part requires fetching user profile first.
        // We will implement this once we have the user profile hook or context.

        setLoading(false);
    }, [user]);

    return { revenue, loading };
}
