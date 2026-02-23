import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SignInProps {
  title?: string;
  message?: string;
  className?: string;
  cardClassName?: string;
  buttonClassName?: string;
  buttonText?: string;
}

export function SignIn({
  title = "Sign In Required",
  message = "Please sign in to access this content.",
  className = "min-h-screen flex items-center justify-center px-4",
  cardClassName = "w-fit max-w-xl mx-auto text-foreground",
  buttonClassName = "w-full h-10 max-w-sm mx-auto",
  buttonText = "Sign In"
}: SignInProps) {

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include"
      });

      if (!res.ok) throw new Error("Login failed");

      window.location.reload();
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Card className={cardClassName}>
        <CardHeader className="text-center space-y-4 py-10 px-10">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>

        <CardContent className="text-center px-10 pb-10">
          <Button
            onClick={handleLogin}
            className={buttonClassName}
            disabled={loading}
          >
            {loading ? "Signing In..." : buttonText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
