import { Tabs } from "expo-router";
import { Image, View } from "react-native";

import { SmartAvatar } from "~/components/SmartAvatar";
import { Badge } from "~/components/ui/badge";
import { Text } from "~/components/ui/text";
import { useSubscriptionsQuery } from "~/lib/hooks/useSubscriptionsQuery";
import { House } from "~/lib/icons/House";
import { Settings } from "~/lib/icons/Settings";

export default function TabLayout() {
  const subscriptionsQuery = useSubscriptionsQuery();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitleAlign: "left",
          headerLeft: () => (
            <Image
              source={require("~/assets/images/icon.png")}
              style={{ width: 36, height: 36 }}
              className="ml-5 mr-1"
            />
          ),
          headerTitle: () => (
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-bold">Clipboard History IO</Text>
              {!!subscriptionsQuery.data?.subscriptions.length && (
                <Badge className="bg-cyan-300">
                  <Text>PRO</Text>
                </Badge>
              )}
            </View>
          ),
          headerRight: () => (
            <View className="mr-5">
              <SmartAvatar />
            </View>
          ),
          headerStyle: {
            height: 128,
          },
          tabBarIcon: ({ color }) => <House color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerTitle: () => <Text className="text-lg font-semibold">Settings</Text>,
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
    </Tabs>
  );
}
