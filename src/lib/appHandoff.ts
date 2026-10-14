import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '@/lib/firebase';

// Mints a one-time Firebase custom token from the createAppToken Cloud
// Function so the native app can sign the user in after the deep-link
// handoff. Returns '' on any failure (caller falls back to the old
// token-less deep link so the flow never breaks).
export async function fetchAppToken(): Promise<string> {
  try {
    const result = await httpsCallable(getFunctions(auth.app), 'createAppToken')({});
    return (result.data as { token?: string })?.token || '';
  } catch (e) {
    console.warn('[handoff] createAppToken failed, falling back without token', e);
    return '';
  }
}

// Builds the deep link back into the app, carrying the token when available.
export function buildAppDeepLink(token: string): string {
  const target = token ? `auth-callback?token=${encodeURIComponent(token)}` : 'auth-callback';
  const isAndroid = /android/i.test(navigator.userAgent);
  if (isAndroid) {
    return `intent://${target}#Intent;scheme=rayac-hymn;package=app.rork.ame_church_hymn_book;end`;
  }
  return `rayac-hymn://${target}`;
}

// Fetch a token and jump back to the native app.
export async function returnToApp(): Promise<void> {
  const token = await fetchAppToken();
  window.location.href = buildAppDeepLink(token);
}
