import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

export const useOnboardingIsCompletedQuery = () => {
  return useQuery({
    queryKey: ["onboardingIsCompleted"],
    queryFn: async () => {
      const value = await AsyncStorage.getItem("onboardingIsCompleted");
      return value === "true";
    },
  });
};
