import { lookup } from "@instantdb/core";
import * as Crypto from "expo-crypto";

import { db } from "~/auth/AuthProvider";
import { ClipboardItemProps, CloudEntry } from "~/types/types";

export const cloudService = {
  async add(item: ClipboardItemProps, user: string): Promise<void> {
    const contentHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      item.text,
    );

    await db.transact(
      db.tx.entries[lookup("emailContentHash", `${user}+${contentHash}`)]!.update({
        createdAt: Date.now(),
        content: item.text,
        isFavorited: item.favorite,
        tags: item.tags.join(","),
      }).link({ $user: lookup("email", user) }),
    );
  },

  async remove(item: ClipboardItemProps, user: string): Promise<void> {
    const contentHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      item.text,
    );

    await db.transact(db.tx.entries[lookup("emailContentHash", `${user}+${contentHash}`)].delete());
  },

  transformCloudEntry(entry: CloudEntry): ClipboardItemProps {
    // console.log('Transforming cloud entry:', {
    //   rawTags: entry.tags,
    //   parsedTags: entry.tags ? entry.tags.split(',') : []
    // });
    const transformed = {
      id: entry.emailContentHash.split("+")[1],
      text: entry.content,
      charCount: entry.content.length,
      favorite: entry.isFavorited || false,
      tags: entry.tags ? entry.tags.split(",") : [],
      timestamp: new Date(entry.createdAt),
      isInCloud: true,
    };

    // console.log('Transformed entry:', {
    //   id: transformed.id,
    //   tagsLength: transformed.tags.length,
    //   tags: transformed.tags
    // });

    return transformed;
  },
};
