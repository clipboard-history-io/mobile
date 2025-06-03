import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Image, View } from "react-native";

import { Badge } from "~/components/ui/badge";
import { Text } from "~/components/ui/text";

export default function TabLayout() {
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
              <Text className="text-lg font-semibold">Clipboard History IO</Text>
              <Badge className="bg-cyan-300">
                <Text>PRO</Text>
              </Badge>
            </View>
          ),
          headerStyle: {
            height: 128,
          },
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: () => <Text className="text-lg font-semibold">Settings</Text>,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
