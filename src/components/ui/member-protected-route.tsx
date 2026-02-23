import { ReactNode, useState, useEffect } from 'react';
import { SignIn } from '@/components/ui/sign-in';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface MemberProtectedRouteProps {
  children: ReactNode;
  isAuthenticated?: boolean; // optionally pass in auth state
  isLoading?: boolean; // optionally pass in loading state
  messageToSignIn?: string;
  messageToLoading?: string;
  signInTitle?: string;
  signInClassName?: string;
  loadingClassName?: string;
}

export function MemberProtectedRoute({
  children,
  isAuthenticated = false,
  isLoading = false,
  messageToSignIn = "Please sign in to access this page.",
  messageToLoading = "Loading page...",
  signInTitle = "Sign In Required",
  signInClassName = "",
  loadingClassName = "",
}: MemberProtectedRouteProps) {

  // Optional: simulate loading state for demo
  const [loading, setLoading] = useState(isLoading);
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner message={messageToLoading} className={loadingClassName} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SignIn title={signInTitle} message={messageToSignIn} className={signInClassName} />
      </div>
    );
  }

  return <>{children}</>;
}
