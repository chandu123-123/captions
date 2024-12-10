"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Coins } from 'lucide-react';
import { useCreditsStore } from '@/store/useCreditsStore';

export default function UserCredits() {
  const { data: session } = useSession();
  const { credits, setCredits } = useCreditsStore();

  useEffect(() => {
    async function fetchCredits() {
      if (session?.user) {
        try {
          const response = await fetch(`/api/credits?email=${session?.user.email}`,{
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          console.log(data)
          setCredits(data.credits);
        } catch (error) {
          console.error('Failed to fetch credits:', error);
        }
      }
    }

    fetchCredits();
  }, [session, setCredits]);

  if (!session) return null;

  return (
    <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-border/50">
      <Coins className="h-4 w-4 text-yellow-500" />
      <span className="text-sm font-medium">{credits} Credits</span>
    </div>
  );
}