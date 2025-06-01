import { ScrollView, View } from "react-native";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Text } from "~/components/ui/text";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { useColorScheme } from "~/lib/hooks/useColorScheme";
import { useSettings } from "~/lib/hooks/useSettings";
import { StorageOption, TabOption, ThemeOption } from "~/types/types";

const storageOptions: StorageOption[] = [
  { label: "Local", value: "local" },
  { label: "Cloud", value: "cloud" },
];

const tabOptions: TabOption[] = [
  { label: "All", value: "all" },
  { label: "Favorites", value: "favorites" },
  { label: "Cloud", value: "cloud" },
];

const themeOptions: ThemeOption[] = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "System", value: "system" },
];

export default function Settings() {
  const {
    settings,
    setAllowBlankItems,
    setStorageLocation,
    setAllowDeletingCloudItems,
    setAllowDeletingFavorites,
    setDefaultTab,
    setTheme,
  } = useSettings();
  const { setColorScheme } = useColorScheme();

  function handleThemeChange(value: ThemeOption) {
    setColorScheme(value.value);
    setTheme(value);
    // need to fix this
    // setAndroidNavigationBar(value.value);
  }

  return (
    /* used scrollview instead of flatlist here, hopefully no problems
since the items will be fixed and few */
    <ScrollView className="flex-1">
      {/* Theme Toggle */}
      <View className="flex-1 p-4 mb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-medium">Theme Toggle</Text>
          <Text className="text-sm text-muted-foreground">Toggle light/dark mode</Text>
        </View>
        <Select
          value={settings.theme}
          onValueChange={(value) => handleThemeChange(value as ThemeOption)}
        >
          <SelectTrigger className="w-32 bg-background">
            <SelectValue
              className="text-foreground text-sm native:text-lg"
              placeholder="Select Theme"
            />
          </SelectTrigger>
          <SelectContent className="w-36 bg-background">
            <SelectGroup>
              {themeOptions.map((option) => (
                <SelectItem key={option.value} label={option.label} value={option.value} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="h-[1px] bg-border w-full my-1" />

      {/* Storage Location Toggle */}
      <View className="flex-1 p-4 mb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-medium">Default Storage Location</Text>
          <Text className="text-sm text-muted-foreground">Select where new items are stored</Text>
        </View>
        <Select
          value={settings.storageLocation}
          onValueChange={(option) => setStorageLocation(option as StorageOption)}
        >
          <SelectTrigger className="w-32 bg-background">
            <SelectValue className="text-foreground text-sm native:text-lg" placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="w-36 bg-background">
            <SelectGroup>
              {storageOptions.map((option) => (
                <SelectItem key={option.value} label={option.label} value={option.value} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="h-[1px] bg-border w-full my-1" />

      {/* Allow blank items */}
      <View className="flex-1 p-4 mb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-medium">Allow Blank Items</Text>
          <Text className="text-sm text-muted-foreground">Enable or disable blank items</Text>
        </View>
        <Switch
          checked={settings.allowBlankItems}
          onCheckedChange={setAllowBlankItems}
          className=""
        />
      </View>
      <View className="h-[1px] bg-border w-full my-1" />

      {/* Allow deleting favorited items */}
      <View className="flex-1 p-4 mb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-medium">Allow Deleting Favorites</Text>
          <Text className="text-sm text-muted-foreground">
            Enable or disable deleting favorite items
          </Text>
        </View>
        <Switch
          checked={settings.allowDeletingFavorites}
          onCheckedChange={setAllowDeletingFavorites}
          className=""
        />
      </View>
      <View className="h-[1px] bg-border w-full my-1" />

      {/* Allow deleting cloud items */}
      <View className="flex-1 p-4 mb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-medium">Allow Deleting Cloud Items</Text>
          <Text className="text-sm text-muted-foreground">
            Enable or disable deleting items stored in cloud
          </Text>
        </View>
        <Switch
          checked={settings.allowDeletingCloudItems}
          onCheckedChange={setAllowDeletingCloudItems}
          className=""
        />
      </View>
      <View className="h-[1px] bg-border w-full my-1" />

      {/* Default Tab Toggle */}
      <View className="flex-1 p-4 mb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-medium">Default Tab</Text>
          <Text className="text-sm text-muted-foreground">Select tab shown when app is opened</Text>
        </View>
        <Select
          value={settings.defaultTab}
          onValueChange={(option) => setDefaultTab(option as TabOption)}
        >
          <SelectTrigger className="w-32 bg-background">
            <SelectValue className="text-foreground text-sm native:text-lg" placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="w-36 bg-background">
            <SelectGroup>
              {tabOptions.map((option) => (
                <SelectItem key={option.value} label={option.label} value={option.value} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="h-[1px] bg-border w-full my-1" />
    </ScrollView>
  );
}
