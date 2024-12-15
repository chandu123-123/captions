"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCreditsStore } from "@/store/useCreditsStore";

export default function ProtectedRoute({ 
  children,
  requireCredits = false 
}: { 
  children: React.ReactNode;
  requireCredits?: boolean;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const credits = useCreditsStore((state) => state.credits);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
    } else if (requireCredits && credits < 1) {
      router.push("/pricing");
    }
  }, [session, status, credits, requireCredits, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  if (requireCredits && credits < 1) {
    return null;
  }

  return <>{children}</>;
} 