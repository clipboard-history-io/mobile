import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { useEffect } from "react";

import { useSubscriptionsQuery } from "./useSubscriptionsQuery";

export const useClipboardContentQuery = () => {
  const subscriptionsQuery = useSubscriptionsQuery();

  const query = useQuery({
    queryKey: ["clipboardContent"],
    queryFn: async () => {
      if (!subscriptionsQuery.data?.subscriptions.length) {
        return "";
      }

      return await Clipboard.getStringAsync();
    },
  });

  useEffect(() => {
    query.refetch();
  }, [subscriptionsQuery.data]);

  return query;
};
