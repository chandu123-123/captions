import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication Error | Caption Generator",
  description: "An error occurred during authentication",
};

export default function AuthErrorPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-destructive">Authentication Error</h1>
            <p className="text-muted-foreground">
              An error occurred during the authentication process. Please try again.
            </p>
          </div>
          <Button asChild>
            <Link href="/auth/signin">Return to Sign In</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}