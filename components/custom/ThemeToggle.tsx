import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { useColorScheme } from "~/lib/hooks/useColorScheme";

type Option = { label: string; value: "light" | "dark" | "system" };

const options: Option[] = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "System", value: "system" },
];

export function ThemeToggle() {
  const [selectedTheme, setSelectedTheme] = useState(options[2]);
  const { colorScheme, setColorScheme } = useColorScheme();

  function handleThemeChange(value: Option) {
    setColorScheme(value.value);
    setSelectedTheme(value);

    // need to fix this and uncomment
    // setAndroidNavigationBar(value.value);
  }

  return (
    <Select value={selectedTheme} onValueChange={(value) => handleThemeChange(value as Option)}>
      <SelectTrigger className="w-32 bg-background">
        <SelectValue
          className="text-foreground text-sm native:text-lg"
          placeholder="Select Theme"
        />
      </SelectTrigger>
      <SelectContent className="w-36 bg-background">
        <SelectGroup>
          <SelectItem label="Light" value="light" />
          <SelectItem label="Dark" value="dark" />
          <SelectItem label="System" value="system" />
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
