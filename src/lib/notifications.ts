import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function sendNotification(
  userId: string,
  type: 'rsvp' | 'training' | 'volunteer' | 'prayer' | 'resource',
  title: string,
  message: string
) {
  try {
    await addDoc(collection(db, 'notifications', userId, 'items'), {
      type,
      title,
      message,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}