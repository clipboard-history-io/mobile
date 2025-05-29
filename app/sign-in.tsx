import { ParamListBase, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useAuth } from "~/auth/AuthProvider";
import { Input } from "~/components/ui/input";
import { ThemeToggleWithIcon } from "~/components/custom/ThemeToggleWithIcon";
import CloudUnavailableAlert from "~/components/custom/CloudUnavailableAlert"

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const { signIn } = useAuth();

  async function handleSignIn() {
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    try {
      await signIn(email, navigation);
    } catch (error) {
      Alert.alert("Sign In Error", "Failed to send magic code. Please try again.");
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      
      <View className="flex-1 justify-center items-center px-6">
        {/* fix this icon for themetoggle */}
      {/* <ThemeToggleWithIcon /> */}
      {/* fix this image */}
        <Image
                  source={{ uri: "./assets/images/icon.png" }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
        <Text className="text-2xl font-bold mb-12">Sign in to Clipboard History IO</Text>
        <Input className="w-full border p-3 rounded-md mb-4" aria-labelledby='inputLabel' placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}
          accessibilityLabel="Email input"/>
        <TouchableOpacity
          onPress={handleSignIn}
          className="bg-blue-500 py-3 px-6 rounded-md w-full items-center mb-4"
        >
          <Text className="text-white font-semibold">Continue</Text>
        </TouchableOpacity>
        <CloudUnavailableAlert>
        <TouchableOpacity className="mt-4">
          <Text className="text-blue-500">Skip Sign-In</Text>
        </TouchableOpacity>
        </CloudUnavailableAlert>
      </View>
    </TouchableWithoutFeedback>
  );
}
