import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { db } from "~/lib/db";

const schema = z.object({
  email: z.string(),
});
type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
  const router = useRouter();

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
    },
    mode: "all",
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async ({ email }) => {
    try {
      await db.auth.sendMagicCode({ email });
    } catch (e) {
      console.log(e);

      setError("email", { type: "manual", message: "Invalid email" });

      return;
    }

    router.navigate(`/verify-email?${new URLSearchParams({ email }).toString()}`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View className="flex-1 justify-center px-8">
          <Image
            source={require("~/assets/images/icon.png")}
            style={{ width: 72, height: 72 }}
            className="mx-auto"
          />
          <Text className="text-2xl font-bold text-center">
            Sign in to Clipboard History IO Pro
          </Text>
          <Text className="text-lg text-gray-500 text-center">
            Welcome! Please enter your email to continue
          </Text>
          <Controller
            name="email"
            control={control}
            render={({ field: { value, onChange, onBlur, name } }) => (
              <>
                <Label nativeID={name}>Email address</Label>
                <Input
                  aria-labelledby={name}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="w-full"
                />
                {errors.email?.message && (
                  <Text className="text-md font-semibold text-red-500">{errors.email.message}</Text>
                )}
              </>
            )}
          />
          <Button onPress={() => handleSubmit(onSubmit)()} className="w-full">
            <Text>Continue</Text>
          </Button>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
