import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const ADMIN_EMAILS = ['pgilbertmwanza@gmail.com', 'sage.kona.dev@gmail.com'];

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && ADMIN_EMAILS.includes(user.email || '')) {
        setIsAdmin(true);
        setAdminEmail(user.email);
      } else {
        setIsAdmin(false);
        setAdminEmail(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { isAdmin, isLoading, adminEmail };
}