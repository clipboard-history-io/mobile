import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";

export const useClipboardContentQuery = () => {
  const query = useQuery({
    queryKey: ["clipboardContent"],
    queryFn: () => Clipboard.getStringAsync(),
  });

  return query;
};
