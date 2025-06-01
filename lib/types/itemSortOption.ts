import { match } from "ts-pattern";
import { z } from "zod";

export const itemSortOptionToLabel = (itemSortOption: ItemSortOption) =>
  match(itemSortOption)
    .with(ItemSortOption.Enum.DateCreated, () => "Date Created")
    .with(ItemSortOption.Enum.DateLastCopied, () => "Date Last Copied")
    .exhaustive();

export const ItemSortOption = z.enum(["DateCreated", "DateLastCopied"]);
export type ItemSortOption = z.infer<typeof ItemSortOption>;
