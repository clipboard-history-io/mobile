import { zodResolver } from "@hookform/resolvers/zod";
import { InstaQLEntity } from "@instantdb/react-native";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

import { AppSchema } from "~/instant.schema";
import { db } from "~/lib/db";
import { useCloudEntriesQuery } from "~/lib/hooks/useCloudEntriesQuery";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Text } from "./ui/text";
import { Textarea } from "./ui/textarea";

const schema = z.object({
  content: z.string(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  cloudEntry: InstaQLEntity<AppSchema, "entries">;
}

export const EntryEditForm = ({ cloudEntry }: Props) => {
  const router = useRouter();
  const connectionStatus = db.useConnectionStatus();
  const { user } = db.useAuth();
  const cloudEntriesQuery = useCloudEntriesQuery();

  const {
    control,
    setError,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      content: cloudEntry.content,
    },
    mode: "all",
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async ({ content }) => {
    if (connectionStatus !== "authenticated" || !user) {
      console.log(connectionStatus, user);

      setError("content", { type: "manual", message: "Internal error" });

      return;
    }

    if ((cloudEntriesQuery.data?.entries || []).some((x) => x.content === content)) {
      setError("content", { type: "manual", message: "Content must be unique" });

      return;
    }

    try {
      const contentHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        content,
      );

      await db.transact(
        db.tx.entries[cloudEntry.id]!.update({
          content,
          emailContentHash: `${user.email}+${contentHash}`,
        }),
      );
    } catch (e) {
      console.log(e);

      setError("content", { type: "manual", message: "Internal error" });

      return;
    }

    router.navigate("/(tabs)");
  };

  return (
    <View className="flex-col gap-4">
      <Controller
        name="content"
        control={control}
        render={({ field: { value, onChange, onBlur, name } }) => (
          <View>
            <Label nativeID={name}>Content</Label>
            <Textarea
              aria-labelledby={name}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              numberOfLines={8}
            />
            {errors.content?.message && (
              <Text className="text-md font-semibold text-red-500">{errors.content.message}</Text>
            )}
          </View>
        )}
      />
      <Button variant="secondary" onPress={() => reset()}>
        <Text>Reset</Text>
      </Button>
      <Button onPress={() => handleSubmit(onSubmit)()}>
        <Text>Save</Text>
      </Button>
    </View>
  );
};
