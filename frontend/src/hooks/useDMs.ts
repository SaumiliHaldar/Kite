import { useState, useEffect, useCallback } from 'react';
import {
  listDMs,
  startDM as apiStart,
  getUserById,
  type KiteConversation,
  type KiteUser,
} from '../api';

export interface EnrichedDM extends KiteConversation {
  otherUser?: KiteUser;
}

export function useDMs(myClerkId: string | null) {
  const [dms, setDMs] = useState<EnrichedDM[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDMs = useCallback(async () => {
    if (!myClerkId) return;
    setIsLoading(true);
    try {
      const raw = await listDMs();
      // Enrich each DM with the other user's profile
      const enriched = await Promise.all(
        raw.map(async (dm) => {
          const otherId = dm.participants.find((p) => p !== myClerkId);
          if (!otherId) return dm as EnrichedDM;
          try {
            const otherUser = await getUserById(otherId);
            return { ...dm, otherUser } as EnrichedDM;
          } catch {
            return dm as EnrichedDM;
          }
        })
      );
      // Sort by most recent
      enriched.sort(
        (a, b) =>
          new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
      setDMs(enriched);
    } catch (err) {
      console.error('Failed to fetch DMs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [myClerkId]);

  useEffect(() => {
    fetchDMs();
  }, [fetchDMs]);

  const startDM = useCallback(
    async (targetId: string) => {
      const dm = await apiStart(targetId);
      const otherId = dm.participants.find((p) => p !== myClerkId);
      let enriched: EnrichedDM = dm;
      if (otherId) {
        try {
          const otherUser = await getUserById(otherId);
          enriched = { ...dm, otherUser };
        } catch {
          // proceed without enrichment
        }
      }
      setDMs((prev) => {
        const exists = prev.some((d) => d.id === dm.id);
        return exists ? prev : [enriched, ...prev];
      });
      return enriched;
    },
    [myClerkId]
  );

  return { dms, isLoading, startDM, refetch: fetchDMs };
}
