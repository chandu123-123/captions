"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useCreditsStore } from "@/store/useCreditsStore";
import { LoadingButton } from "@/components/ui/loading-button";

export default function Navbar() {
  const { data: session } = useSession();
  const credits = useCreditsStore((state) => state.credits);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn("google");
    } catch (error) {
      console.error("Sign in error:", error);
    }
    setIsSigningIn(false);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-xl sm:text-2xl font-semibold font-outfit tracking-tight"
            >
              CaptionGen
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {session ? (
              <>
                <div className="text-sm font-medium text-muted-foreground">
                  Credits: {credits}
                </div>
                <div>
                  <Link href="/pricing" className="inline-block">
                    <Button variant="outline" size="sm" className="font-medium">
                      Buy Credits
                    </Button>
                  </Link>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="font-medium"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <LoadingButton
                variant="default"
                size="sm"
                onClick={handleSignIn}
                loading={isSigningIn}
                className="font-medium"
              >
                Sign In
              </LoadingButton>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden">
            <div
              onClick={toggleMenu}
              className="p-2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="space-y-2 pb-3 pt-2">
              {session ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                    Credits: {credits}
                  </div>
                  <div className="w-full text-center">
                    <Link 
                      href="/pricing" 
                      className="block px-4 py-2.5 text-sm font-medium hover:bg-muted rounded-md"
                      onClick={toggleMenu}
                    >
                      Buy Credits
                    </Link>
                  </div>
                  <div
                    onClick={() => {
                      signOut();
                      toggleMenu();
                    }}
                    className="w-full text-center px-4 py-2.5 text-sm font-medium hover:bg-muted rounded-md cursor-pointer"
                  >
                    Sign Out
                  </div>
                </div>
              ) : (
                <div className="px-4 py-2 text-center">
                  <LoadingButton
                    variant="default"
                    size="sm"
                    onClick={handleSignIn}
                    loading={isSigningIn}
                    className="w-full font-medium"
                  >
                    Sign In
                  </LoadingButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}