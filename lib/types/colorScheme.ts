import { z } from "zod";

import { capitalize } from "../utils";

export const colorSchemeToLabel = (colorScheme: ColorScheme) => capitalize(colorScheme);

export const ColorScheme = z.enum(["system", "light", "dark"]);
export type ColorScheme = z.infer<typeof ColorScheme>;
