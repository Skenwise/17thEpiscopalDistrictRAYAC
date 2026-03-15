// src/hooks/useMember.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface Member {
  userId: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  conference?: string;
  district?: string;
  localChurch?: string;
  premiumUnlocked: boolean;
  memberSince?: number;
  createdAt?: any;
}

export function useMember() {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setMember({
              userId: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              ...userDoc.data(),
            } as Member);
          } else {
            setMember({
              userId: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              premiumUnlocked: false,
            });
          }
        } catch (error) {
          console.error('Failed to load member:', error);
        }
      } else {
        setMember(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { member, isLoading };
}