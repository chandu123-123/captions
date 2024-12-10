import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignInButton } from "@/components/auth/SignInButton";

export const metadata: Metadata = {
  title: "Sign In | Caption Generator",
  description: "Sign in to your Caption Generator account",
};

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your Caption Generator account
            </p>
          </div>
          <SignInButton />
        </div>
      </Card>
    </div>
  );
}