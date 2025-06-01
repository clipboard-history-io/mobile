import { InstaQLEntity } from "@instantdb/react-native";
import { clsx, type ClassValue } from "clsx";
import { differenceInSeconds, format } from "date-fns";
import { timeAgo } from "short-time-ago";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";

import { AppSchema } from "~/instant.schema";

import { ItemSortOption } from "./types/itemSortOption";
import { Settings } from "./types/settings";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const capitalize = (s: string) =>
  s.slice(0, 1).toUpperCase().concat(s.slice(1).toLowerCase());

export const getEntryCopiedAt = (entry: InstaQLEntity<AppSchema, "entries">) =>
  entry.copiedAt || entry.createdAt;

export const getEntryTimestamp = (entry: InstaQLEntity<AppSchema, "entries">, settings: Settings) =>
  match(settings.sortItemsBy)
    .with(ItemSortOption.Enum.DateCreated, () => entry.createdAt)
    .with(ItemSortOption.Enum.DateLastCopied, () => getEntryCopiedAt(entry))
    .exhaustive();

export const badgeDateFormatter = (now: Date, d: Date) => {
  const seconds = differenceInSeconds(now, d);

  if (seconds > 86400) {
    return format(d, "PP");
  }

  return timeAgo(d, now);
};
