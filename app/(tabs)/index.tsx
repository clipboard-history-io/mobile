import FontAwesome from "@expo/vector-icons/FontAwesome";
import { InstaQLEntity } from "@instantdb/react-native";
import { generateColorRGB } from "@marko19907/string-to-color";
import { Star, Trash2 } from "lucide-react-native";
import * as React from "react";
import { useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Swipeable, { SwipeableRef } from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { z } from "zod";

import { Badge } from "~/components/ui/badge";
import { CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { AppSchema } from "~/instant.schema";
import { db } from "~/lib/db";
import { useCloudEntriesQuery } from "~/lib/hooks/useCloudEntriesQuery";
import { useSettingsQuery } from "~/lib/hooks/useSettingsQuery";
import { Settings } from "~/lib/types/settings";
import { badgeDateFormatter, getEntryTimestamp } from "~/lib/utils";

function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + 168 }],
    };
  });

  return (
    <Reanimated.View style={styleAnimation} className="w-48 flex-row">
      <View className="flex-1 flex-col justify-center bg-blue-100 px-4">
        <Text className="text-center text-blue-500 font-bold">Edit</Text>
      </View>
      <View className="flex-1 flex-col justify-center bg-red-100 px-4">
        <Text className="text-center text-red-500 font-bold">Delete</Text>
      </View>
    </Reanimated.View>
  );
}

interface ItemProps {
  cloudEntry: InstaQLEntity<AppSchema, "entries">;
  settings: Settings;
}

const Item = ({ cloudEntry, settings }: ItemProps) => {
  const ref: SwipeableRef = useRef(null);

  const tags = z
    .array(z.string())
    .catch([])
    .parse(JSON.parse(cloudEntry.tags || "[]"));

  return (
    <>
      <Swipeable ref={ref} renderRightActions={RightAction}>
        <View className="bg-background flex-col px-5 py-3 gap-1">
          <View className="flex-row justify-between items-center gap-2">
            <Text numberOfLines={1} ellipsizeMode="tail" className="text-base flex-1">
              {cloudEntry.content}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {badgeDateFormatter(new Date(), new Date(getEntryTimestamp(cloudEntry, settings)))}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row gap-2">
              <Text className="text-sm text-muted-foreground">
                {cloudEntry.content.length} characters
              </Text>
              {tags.length > 0
                ? tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex-row items-center">
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: generateColorRGB(tag),
                          marginRight: 6,
                        }}
                      />
                      <Text className="mt-[-1px]">{tag}</Text>
                    </Badge>
                  ))
                : null}
            </View>
            <Pressable
              onPress={() =>
                db.transact(
                  db.tx.entries[cloudEntry.id].update({ isFavorited: !cloudEntry.isFavorited }),
                )
              }
            >
              {cloudEntry.isFavorited ? (
                <FontAwesome size={16} name="star" color="#fcc800" />
              ) : (
                <FontAwesome size={16} name="star-o" />
              )}
            </Pressable>
          </View>
        </View>
      </Swipeable>
      <Separator />
    </>
  );
};

export default function HomeScreen() {
  const cloudEntriesQuery = useCloudEntriesQuery();
  const settingsQuery = useSettingsQuery();

  if (
    cloudEntriesQuery.isLoading ||
    cloudEntriesQuery.error ||
    settingsQuery.isPending ||
    settingsQuery.error
  ) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={cloudEntriesQuery.data.entries
        .slice()
        .sort(
          (a, b) =>
            getEntryTimestamp(b, settingsQuery.data) - getEntryTimestamp(a, settingsQuery.data),
        )}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Item cloudEntry={item} settings={settingsQuery.data} />}
    />
  );
}
