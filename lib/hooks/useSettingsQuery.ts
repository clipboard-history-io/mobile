import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { defaultSettings, Settings } from "../types/settings";
import { useColorScheme } from "./useColorScheme";

export const useSettingsQuery = () => {
  const { setColorScheme } = useColorScheme();

  const query = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const item = await AsyncStorage.getItem("settings");
      const parsed = Settings.safeParse(item && JSON.parse(item));

      if (parsed.success) {
        return parsed.data;
      }

      return defaultSettings;
    },
  });

  useEffect(() => {
    if (query.isPending || query.isError) {
      return;
    }

    setColorScheme(query.data.theme);
  }, [query.isPending, query.isError, query.data?.theme]);

  return query;
};
