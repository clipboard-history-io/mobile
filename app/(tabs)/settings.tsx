import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { useSettingsQuery } from "~/lib/hooks/useSettingsQuery";
import { useUpdateSettingsMutation } from "~/lib/hooks/useUpdateSettingsMutation";
import { ColorScheme, colorSchemeToLabel } from "~/lib/types/colorScheme";
import { ItemSortOption, itemSortOptionToLabel } from "~/lib/types/itemSortOption";
import { defaultSettings } from "~/lib/types/settings";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const settingsQuery = useSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();

  if (settingsQuery.isPending || settingsQuery.error) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView>
      <Text>General</Text>
      <Card>
        <CardHeader>
          <CardTitle>Sort Items By</CardTitle>
          <CardDescription>Select how items are sorted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={{
              label: itemSortOptionToLabel(settingsQuery.data.sortItemsBy),
              value: settingsQuery.data.sortItemsBy,
            }}
            onValueChange={(option) =>
              updateSettingsMutation.mutate({
                ...settingsQuery.data,
                sortItemsBy: ItemSortOption.default(defaultSettings.sortItemsBy).parse(
                  option?.value,
                ),
              })
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue
                className="native:text-lg text-sm text-foreground"
                placeholder="Select..."
              />
            </SelectTrigger>
            <SelectContent insets={insets} className="w-[200px]">
              <SelectGroup>
                {[ItemSortOption.Enum.DateCreated, ItemSortOption.Enum.DateLastCopied].map(
                  (itemSortOption) => (
                    <SelectItem
                      key={itemSortOption}
                      label={itemSortOptionToLabel(itemSortOption)}
                      value={itemSortOption}
                    >
                      {itemSortOptionToLabel(itemSortOption)}
                    </SelectItem>
                  ),
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Text>Interface</Text>
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Select the app's color scheme.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={{
              label: colorSchemeToLabel(settingsQuery.data.theme),
              value: settingsQuery.data.theme,
            }}
            onValueChange={(option) =>
              updateSettingsMutation.mutate({
                ...settingsQuery.data,
                theme: ColorScheme.default(defaultSettings.theme).parse(option?.value),
              })
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue
                className="native:text-lg text-sm text-foreground"
                placeholder="Select..."
              />
            </SelectTrigger>
            <SelectContent insets={insets} className="w-[200px]">
              <SelectGroup>
                {(["system", "light", "dark"] as const).map((colorScheme) => (
                  <SelectItem
                    key={colorScheme}
                    label={colorSchemeToLabel(colorScheme)}
                    value={colorScheme}
                  >
                    {colorSchemeToLabel(colorScheme)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
