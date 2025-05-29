import * as Clipboard from "expo-clipboard";
import * as React from "react";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { useAuth } from "~/auth/AuthProvider";
import { Badge } from "~/components/ui/badge";
import { CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useSettings } from "~/lib/hooks/useSettings";
import { Cloud } from "~/lib/icons/Cloud";
import { CloudOff } from "~/lib/icons/CloudOff";
import { Edit } from "~/lib/icons/Edit";
import { Star } from "~/lib/icons/Star";
import { Tag } from "~/lib/icons/Tag";
import { Trash2 } from "~/lib/icons/Trash2";
import { formatTimestamp } from "~/lib/utils";
import { useClipboardHistory } from "~/service/ClipboardService";
import { ClipboardItemProps } from "~/types/types";

const ClipboardItem: React.FC<{
  item: ClipboardItemProps;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTag: (id: string) => void;
  onToggleCloud: (id: string, user: string) => void;
}> = ({ item, onEdit, onDelete, onToggleFavorite, onTag, onToggleCloud }) => {
  const { user } = useAuth();
  const { settings } = useSettings();

  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#a855f7", // purple
    "#ec4899", // pink
  ];

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(item.text);
  };

  const handleCloudPress = (id: string) => {
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }
    onToggleCloud(id, user);
  };

  const isDeleteDisabled = React.useMemo(() => {
    if (!settings.allowDeletingFavorites && item.favorite) {
      return true;
    }

    if (!settings.allowDeletingCloudItems && item.isInCloud) {
      return true;
    }

    return false;
  }, [
    settings.allowDeletingFavorites,
    settings.allowDeletingCloudItems,
    item.favorite,
    item.isInCloud,
  ]);

  const dotColor = React.useMemo(() => getRandomColor(), [item.id]);
  // console.log('ClipboardItem received:', {
  //   id: item.id,
  //   hasTags: Boolean(item.tags),
  //   tagsLength: item.tags?.length,
  //   tags: item.tags
  // });

  return (
    <View key={item.id} className="w-full bg-background">
      <TouchableOpacity onPress={copyToClipboard} activeOpacity={0.7}>
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle numberOfLines={1} ellipsizeMode="tail" className="text-base flex-1 pr-8">
            {item.text}
          </CardTitle>
          <Text className="text-sm text-muted-foreground">{item.charCount}</Text>
        </CardHeader>
      </TouchableOpacity>

      <CardFooter className="flex-row justify-end gap-6">
        {item.tags.length > 0 ? (
          <View className="flex-row gap-2">
            <Badge variant="outline" className="border-gray-600 flex-row items-center">
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: dotColor,
                  marginRight: 4,
                }}
              />
              <Text>{item.tags[0]}</Text>
            </Badge>
            {item.tags.length > 1 ? (
              <Text className="text-sm justify-end text-muted-foreground">
                + {item.tags.length - 1}
              </Text>
            ) : null}
          </View>
        ) : null}
        <Text className="text-sm text-muted-foreground">{formatTimestamp(item.timestamp)}</Text>
        <TouchableOpacity disabled={user == "Guest"} onPress={() => handleCloudPress(item.id)}>
          {user !== "Guest" ? (
            <Cloud size={18} className="text-blue-500" fill={item.isInCloud ? "#3b82f6" : "none"} />
          ) : (
            <CloudOff size={18} className="text-gray-400" />
          )}
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => onTag(item.id)}>
          <Tag size={18} className="text-blue-500" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEdit(item.id)}>
          <Edit size={18} className="text-green-500" />
        </TouchableOpacity> */}

        <TouchableOpacity onPress={() => onToggleFavorite(item.id)}>
          <Star
            size={18}
            className={item.favorite ? "text-yellow-500" : "text-gray-400"}
            fill={item.favorite ? "#eab308" : "none"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          disabled={isDeleteDisabled}
          className={isDeleteDisabled ? "opacity-50" : ""}
        >
          <Trash2 size={18} className="text-red-500" />
        </TouchableOpacity>
      </CardFooter>

      <View className="h-[1px] bg-border w-full my-1" />
    </View>
  );
};

export default ClipboardItem;
