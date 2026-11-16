import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { getClosetItems } from "@/services/closet-storage";
import { ClosetItem } from "@/types/clothing";

export function useCloset() {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Runs every time the screen comes into focus, so a new item saved in the
  // modal shows up as soon as you land back on the Closet tab.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const load = async () => {
        try {
          setError(null);
          const data = await getClosetItems();
          if (!cancelled) setItems(data);
        } catch (e) {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : "Failed to load closet");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      load();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  return { items, loading, error };
}