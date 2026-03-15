import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useMember } from '@/hooks/useMember';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface MemberProtectedRouteProps {
  children: ReactNode;
  messageToSignIn?: string;
  messageToLoading?: string;
}

export function MemberProtectedRoute({
  children,
  messageToLoading = "Loading...",
}: MemberProtectedRouteProps) {
  const { member, isLoading } = useMember();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner message={messageToLoading} />
      </div>
    );
  }

  if (!member) {
    return <Navigate to="/sign-in?redirect=/portal" replace />;
  }

  return <>{children}</>;
}