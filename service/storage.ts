import AsyncStorage from "@react-native-async-storage/async-storage";

import { ClipboardItemProps } from "~/types/types";

const STORAGE_KEY = "clipboard_history";

export const clipboardStorage = {
  async load(user: string | null): Promise<ClipboardItemProps[]> {
    const key = `${STORAGE_KEY}_${user}`;
    const storedData = await AsyncStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : [];
  },

  async save(history: ClipboardItemProps[], user: string | null): Promise<void> {
    const key = `${STORAGE_KEY}_${user}`;
    await AsyncStorage.setItem(key, JSON.stringify(history));
  },
};
