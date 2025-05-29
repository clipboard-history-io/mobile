import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import { tags } from "react-native-svg/lib/typescript/xmlTags";

import { db } from "~/auth/AuthProvider";
import { useSettings } from "~/lib/hooks/useSettings";
import { ClipboardItemProps } from "~/types/types";

import { cloudService } from "./cloud";
import { clipboardStorage } from "./storage";

const POLLING_INTERVAL = 2000;

export function useClipboardHistory(user: string | null) {
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItemProps[]>([]);
  const [lastDeletedText, setLastDeletedText] = useState<string | null>(null);
  const lastCopiedText = useRef<string | null>(null);
  const { settings } = useSettings();

  const { data } = db.useQuery({
    entries: {},
  });

  useEffect(() => {
    if (data?.entries) {
      setClipboardHistory((prevHistory) => {
        const cloudEntries = Object.values(data.entries).map(cloudService.transformCloudEntry);

        // Update existing items with cloud data
        const updatedHistory = prevHistory.map((item) => {
          const cloudItem = cloudEntries.find((cloudItem) => cloudItem.id === item.id);
          return cloudItem ? { ...cloudItem, isInCloud: true } : item;
        });

        return updatedHistory;
      });
    }
  }, [data?.entries]);

  const mergeHistories = (
    local: ClipboardItemProps[],
    cloud: ClipboardItemProps[],
  ): ClipboardItemProps[] => {
    const merged = [...local];
    const cloudMap = new Map(cloud.map((item) => [item.id, item]));

    for (let i = 0; i < merged.length; i++) {
      const cloudItem = cloudMap.get(merged[i].id);
      if (cloudItem) {
        merged[i] = { ...cloudItem, isInCloud: true };
        cloudMap.delete(merged[i].id);
      }
    }

    merged.push(...cloudMap.values());

    return merged;
  };

  const initializeHistory = async () => {
    try {
      const [localHistory, cloudEntries] = await Promise.all([
        clipboardStorage.load(user),
        data?.entries ? Object.values(data.entries).map(cloudService.transformCloudEntry) : [],
      ]);

      const allEntries = mergeHistories(localHistory, cloudEntries);
      setClipboardHistory(allEntries);
    } catch (error) {
      console.error("Error initializing clipboard history:", error);
    }
  };

  useEffect(() => {
    initializeHistory();
  }, [user, data]);

  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = (await Clipboard.getStringAsync()).trim();
        if (!text || text === lastCopiedText.current || text === lastDeletedText) return;
        if (!settings.allowBlankItems && !text.trim()) return;

        const newItem: ClipboardItemProps = {
          id: Date.now().toString(),
          text,
          charCount: text.length,
          favorite: false,
          tags: [],
          timestamp: new Date(),
          isInCloud: settings.storageLocation.value === "cloud",
        };

        setClipboardHistory((prev) => {
          if (prev.some((item) => item.text === text)) return prev;
          const updated = [newItem, ...prev];
          clipboardStorage.save(updated, user);
          return updated;
        });

        lastCopiedText.current = text;

        if (settings.storageLocation.value === "cloud" && user && user !== "guest") {
          await cloudService.add(newItem, user);
        }
      } catch (error) {
        console.error("Error monitoring clipboard:", error);
      }
    };

    const interval = setInterval(checkClipboard, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [lastDeletedText, settings, user]);

  const handlers = {
    async toggleCloud(id: string) {
      if (!user || user === "guest") return;

      const item = clipboardHistory.find((item) => item.id === id);
      if (!item) return;

      try {
        if (item.isInCloud) {
          await cloudService.remove(item, user);
        } else {
          await cloudService.add(item, user);
        }

        setClipboardHistory((items) => {
          const updated = items.map((item) =>
            item.id === id ? { ...item, isInCloud: !item.isInCloud } : item,
          );
          clipboardStorage.save(updated, user);
          return updated;
        });
      } catch (error) {
        console.error("Error toggling cloud status:", error);
      }
    },

    deleteClipboardItem(id: string) {
      setClipboardHistory((items) => {
        const item = items.find((item) => item.id === id);
        if (!item || item.favorite) return items;

        setLastDeletedText(item.text);
        const updated = items.filter((item) => item.id !== id);
        clipboardStorage.save(updated, user);
        return updated;
      });
    },

    toggleFavorite(id: string) {
      setClipboardHistory((items) => {
        const updated = items.map((item) =>
          item.id === id ? { ...item, favorite: !item.favorite } : item,
        );
        clipboardStorage.save(updated, user);
        return updated;
      });
    },

    updateTags(id: string, tags: string[]) {
      setClipboardHistory((items) => {
        const updated = items.map((item) => (item.id === id ? { ...item, tags } : item));
        clipboardStorage.save(updated, user);
        return updated;
      });
    },
  };

  return {
    clipboardHistory,
    initializeHistory,
    ...handlers,
  };
}
