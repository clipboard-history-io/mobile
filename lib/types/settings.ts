import { z } from "zod";

import { ColorScheme } from "./colorScheme";
import { ItemSortOption } from "./itemSortOption";

// DO NOT REUSE DEPRECATED FIELDS.
export const defaultSettings = {
  sortItemsBy: ItemSortOption.Enum.DateLastCopied,
  theme: "system",
} as const;

export const Settings = z
  .object({
    sortItemsBy: ItemSortOption.default(defaultSettings.sortItemsBy),
    theme: ColorScheme.default(defaultSettings.theme),
  })
  .default(defaultSettings);
export type Settings = z.infer<typeof Settings>;
