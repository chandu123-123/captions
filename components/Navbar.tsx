"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserCredits from "@/components/UserCredits";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-10">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Caption Generator
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <UserCredits />
              <Button
                variant="ghost"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={() => signIn("google")}
            >
              Sign In with Google
            </Button>
          )}
          <Link href="/pricing">
            <Button variant="outline">Pricing</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}