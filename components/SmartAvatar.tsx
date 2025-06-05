import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable } from "react-native";

import { db } from "~/lib/db";
import { capitalize } from "~/lib/utils";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { Text } from "./ui/text";

export const SmartAvatar = () => {
  const router = useRouter();
  const { user } = db.useAuth();

  return (
    <Pressable
      onPress={() => {
        if (!user) {
          return;
        }

        router.navigate("/account");
      }}
    >
      <Avatar alt="avatar">
        <AvatarFallback>
          {user?.email[0] ? (
            <Text className="font-semibold">{capitalize(user.email[0])}</Text>
          ) : (
            <ActivityIndicator size="small" />
          )}
        </AvatarFallback>
      </Avatar>
    </Pressable>
  );
};
