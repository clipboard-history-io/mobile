import FontAwesome from "@expo/vector-icons/FontAwesome";
import { InstaQLEntity, lookup } from "@instantdb/react-native";
import { generateColorRGB } from "@marko19907/string-to-color";
import { useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { RefObject, useEffect, useRef } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import Swipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { z } from "zod";

import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { AppSchema } from "~/instant.schema";
import { db } from "~/lib/db";
import { useClipboardContentQuery } from "~/lib/hooks/useClipboardContentQuery";
import { useCloudEntriesQuery } from "~/lib/hooks/useCloudEntriesQuery";
import { useSettingsQuery } from "~/lib/hooks/useSettingsQuery";
import { Settings } from "~/lib/types/settings";
import { badgeDateFormatter, cn, getEntryTimestamp } from "~/lib/utils";

interface RightActionsProps {
  translation: SharedValue<number>;
  cloudEntry: InstaQLEntity<AppSchema, "entries">;
}

const RightActions = ({ translation, cloudEntry }: RightActionsProps) => {
  const router = useRouter();

  const editActionStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(translation.value, [0, -168], [168, 0], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const deleteActionStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: interpolate(translation.value, [0, -168], [168, 84], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <View className="relative w-48">
      <Reanimated.View style={editActionStyle} className="absolute h-full w-24">
        <Pressable onPress={() => router.navigate(`/entries/${cloudEntry.id}`)}>
          {({ pressed }) => (
            <View
              className={cn(
                "h-full flex-row items-center",
                pressed ? "bg-blue-200" : "bg-blue-100",
              )}
            >
              <Text className="w-full text-center font-bold text-blue-500">Edit</Text>
            </View>
          )}
        </Pressable>
      </Reanimated.View>
      <Reanimated.View style={deleteActionStyle} className="absolute h-full w-24">
        <Pressable
          onPress={() => {
            if (cloudEntry.isFavorited) {
              return;
            }

            db.transact(db.tx.entries[cloudEntry.id].delete());
          }}
        >
          {({ pressed }) => (
            <View
              className={cn("h-full flex-row items-center", pressed ? "bg-red-200" : "bg-red-100")}
            >
              <Text className="w-full text-center font-bold text-red-500">Delete</Text>
            </View>
          )}
        </Pressable>
      </Reanimated.View>
    </View>
  );
};

interface ItemProps {
  previousRef: RefObject<SwipeableMethods | null>;
  cloudEntry: InstaQLEntity<AppSchema, "entries">;
  settings: Settings;
  clipboardContent: string;
}

const Item = ({ previousRef, cloudEntry, settings, clipboardContent }: ItemProps) => {
  const queryClient = useQueryClient();

  const ref = useRef<SwipeableMethods>(null);

  const tags = z
    .array(z.string())
    .catch([])
    .parse(JSON.parse(cloudEntry.tags || "[]"));

  return (
    <>
      <Swipeable
        ref={ref}
        overshootRight={false}
        renderRightActions={(_, translation) => (
          <RightActions translation={translation} cloudEntry={cloudEntry} />
        )}
        onSwipeableOpen={() => {
          previousRef.current?.close();
          previousRef.current = ref.current;
        }}
        onSwipeableClose={() => {
          if (previousRef.current !== ref.current) {
            return;
          }

          previousRef.current = null;
        }}
      >
        <Pressable
          onPress={() => {
            Clipboard.setStringAsync(cloudEntry.content);
            queryClient.setQueryData(["clipboardContent"], () => cloudEntry.content);
          }}
        >
          <View className="flex-col gap-1 bg-background px-5 py-3">
            <View className="flex-row items-center justify-between gap-2">
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className={cn("flex-1", cloudEntry.content === clipboardContent && "text-blue-500")}
              >
                {cloudEntry.content}
              </Text>
              <Text
                className={cn(
                  "text-sm",
                  cloudEntry.content === clipboardContent
                    ? "text-blue-500"
                    : "text-muted-foreground",
                )}
              >
                {cloudEntry.content === clipboardContent ? (
                  <Badge className="bg-blue-500">
                    <Text>Copied</Text>
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Text>
                      {badgeDateFormatter(
                        new Date(),
                        new Date(getEntryTimestamp(cloudEntry, settings)),
                      )}
                    </Text>
                  </Badge>
                )}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row gap-2">
                <Text
                  className={cn(
                    "text-sm",
                    cloudEntry.content === clipboardContent
                      ? "text-blue-500"
                      : "text-muted-foreground",
                  )}
                >
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
        </Pressable>
      </Swipeable>
      <Separator />
    </>
  );
};

export default function HomeScreen() {
  const connectionStatus = db.useConnectionStatus();
  const { user } = db.useAuth();
  const cloudEntriesQuery = useCloudEntriesQuery();
  const settingsQuery = useSettingsQuery();
  const clipboardContent = useClipboardContentQuery();

  const previousRef = useRef<SwipeableMethods>(null);

  // Create new entry if clipboard content doesn't exist.
  useEffect(() => {
    (async () => {
      if (
        connectionStatus !== "authenticated" ||
        !user?.email ||
        cloudEntriesQuery.data === undefined ||
        clipboardContent.data === undefined ||
        cloudEntriesQuery.data.entries.some(
          (cloudEntry) => cloudEntry.content === clipboardContent.data,
        )
      ) {
        return;
      }

      const contentHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        clipboardContent.data,
      );

      const emailContentHash = `${user.email}+${contentHash}`;

      const now = Date.now();

      await db.transact(
        db.tx.entries[lookup("emailContentHash", emailContentHash)]!.update({
          createdAt: now,
          copiedAt: now,
          content: clipboardContent.data,
        }).link({ $user: lookup("email", user.email) }),
      );
    })();
  }, [connectionStatus, user?.email, cloudEntriesQuery.data, clipboardContent.data]);

  if (
    cloudEntriesQuery.isLoading ||
    cloudEntriesQuery.error ||
    settingsQuery.isPending ||
    settingsQuery.error ||
    clipboardContent.isPending ||
    clipboardContent.error
  ) {
    return (
      <View className="flex-1 items-center justify-center">
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
      renderItem={({ item }) => (
        <Item
          previousRef={previousRef}
          cloudEntry={item}
          settings={settingsQuery.data}
          clipboardContent={clipboardContent.data}
        />
      )}
    />
  );
}
