import { z } from "zod";

export const Tab = z.enum(["Cloud", "Favorites"]);
export type Tab = z.infer<typeof Tab>;
