import { format } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { EntryEditForm } from "~/components/EntryEditForm";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Text } from "~/components/ui/text";
import { db } from "~/lib/db";
import { AlertTriangle } from "~/lib/icons/AlertTriangle";
import { getEntryCopiedAt } from "~/lib/utils";

export default function EntryScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const entriesQuery = db.useQuery({
    entries: {
      $: {
        where: {
          id: entryId,
        },
      },
    },
  });

  if (entriesQuery.isLoading || entriesQuery.error) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (entriesQuery.data.entries.length === 0) {
    return (
      <View className="px-5 py-3">
        <Alert icon={AlertTriangle} variant="destructive" className="max-w-xl">
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            The entry you're attemping to edit has been deleted (id: {entryId}).
          </AlertDescription>
        </Alert>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View className="px-5 py-3">
          <View className="mb-2 gap-2">
            <View>
              <Text className="text-muted-foreground">Character Count</Text>
              <Text>{entriesQuery.data.entries[0].content.length}</Text>
            </View>
            <View>
              <Text className="text-muted-foreground">Date Created</Text>
              <Text>{format(entriesQuery.data.entries[0].createdAt, "Pp")}</Text>
            </View>
            <View>
              <Text className="text-muted-foreground">Date Last Copied</Text>
              <Text>{format(getEntryCopiedAt(entriesQuery.data.entries[0]), "Pp")}</Text>
            </View>
          </View>
          <EntryEditForm cloudEntry={entriesQuery.data.entries[0]} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
