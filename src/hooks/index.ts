import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Scheme, Resource } from '@/types';

/**
 * Hook to fetch all active schemes.
 * Returns { data, loading, error }.
 */
export function useActiveSchemes() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'schemes'), where('active', '==', true), orderBy('name'));
    const unsub = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Scheme));
        setSchemes(data);
        setLoading(false);
      },
      err => {
        setError(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  return { data: schemes, loading, error };
}

/**
 * Hook to fetch recent resources (published) limited by count.
 */
export function useRecentResources(count: number = 8) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'resources'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(count),
    );
    const unsub = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource));
        setResources(data);
        setLoading(false);
      },
      err => {
        setError(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [count]);

  return { data: resources, loading, error };
}

/**
 * Hook to fetch most popular (downloadCount) resources.
 */
export function usePopularResources(count: number = 6) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'resources'),
      where('status', '==', 'published'),
      orderBy('downloadCount', 'desc'),
      limit(count),
    );
    const unsub = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource));
        setResources(data);
        setLoading(false);
      },
      err => {
        setError(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [count]);

  return { data: resources, loading, error };
}
