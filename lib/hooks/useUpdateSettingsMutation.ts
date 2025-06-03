import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Settings } from "../types/settings";

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (settings: Settings) => {
      await AsyncStorage.setItem("settings", JSON.stringify(settings));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      }),
  });

  return mutation;
};
