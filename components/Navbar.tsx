"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { useCreditsStore } from "@/store/useCreditsStore";
import { LoadingButton } from "@/components/ui/loading-button";
import { FeedbackDialog } from './FeedbackDialog';

export default function Navbar() {
  const { data: session } = useSession();
  const credits = useCreditsStore((state) => state.credits);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

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
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="text-xl sm:text-2xl font-semibold font-outfit tracking-tight"
              >
                IndieCaptions
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {session ? (
                <>
                  <div className="text-sm font-medium text-muted-foreground">
                    Credits: {credits}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFeedback(true)}
                    className="font-medium flex items-center gap-2"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    Feedback
                  </Button>
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
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="sm:hidden border-t border-gray-200">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {session ? (
                  <>
                    <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                      Credits: {credits}
                    </div>
                    <button
                      onClick={() => {
                        setShowFeedback(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted rounded-md flex items-center gap-2"
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                      Feedback
                    </button>
                    <Link
                      href="/pricing"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    >
                      Buy Credits
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-2">
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

      <FeedbackDialog 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        userEmail={session?.user?.email || ""}
      />
    </>
  );
}