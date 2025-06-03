import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@rn-primitives/select";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { db } from "~/lib/db";

const schema = z.object({
  code: z.string(),
});
type FormValues = z.infer<typeof schema>;

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();

  const {
    control,
    setError,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      code: "",
    },
    mode: "all",
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async ({ code }) => {
    try {
      await db.auth.signInWithMagicCode({ email: email || "", code });
    } catch (e) {
      console.log(e);

      setError("code", { type: "manual", message: "Invalid code" });
      setValue("code", "");

      return;
    }

    router.navigate("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View className="flex-1 justify-center px-8">
          <Text className="text-2xl font-bold text-center">Check your email</Text>
          <Text className="text-lg text-gray-500 text-center">
            to continue to Clipboard History IO Pro
          </Text>
          {/* TODO: Pin input UI. */}
          <Controller
            name="code"
            control={control}
            render={({ field: { value, onChange, onBlur, name } }) => (
              <>
                <Label nativeID={name}>Verification code</Label>
                <Input
                  aria-labelledby={name}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  maxLength={6}
                  className="w-full"
                />
                {errors.code?.message && (
                  // TODO: text-md doesn't exist.
                  <Text className="text-md font-semibold text-red-500">{errors.code.message}</Text>
                )}
              </>
            )}
          />
          <Button onPress={() => handleSubmit(onSubmit)()} className="w-full">
            <Text>Continue</Text>
          </Button>
          {/* TODO: Resend code option? */}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
