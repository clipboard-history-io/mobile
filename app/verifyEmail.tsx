import { useRoute } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import { Alert, Keyboard, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import { useAuth, type VerifyEmailRouteProp } from "~/auth/AuthProvider";
import { DocumentSelectionState, Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

export default function VerifyEmail() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const { verifyCode } = useAuth();
  const route = useRoute<VerifyEmailRouteProp>();
  const { email } = route.params;

  /* need to investigate the typing here */
  const inputRefs = useRef<(DocumentSelectionState | any)[]>([]);

  function handleChangeText(index: number, value: string) {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  async function handleVerify() {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6 || isNaN(Number(verificationCode))) {
      Alert.alert("Invalid Code", "Please enter a 6-digit verification code.");
      return;
    }
    try {
      await verifyCode(verificationCode, email);
    } catch (error) {
      Alert.alert("Verification Failed", "Incorrect or expired code. Try again.");
    }
  }

  function handleResend() {
    // resendCode();
    Alert.alert("Code Sent", "A new verification code has been sent to your email.");
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold mb-4">Enter Verification Code</Text>
        <Text className="text-center text-gray-500 mb-3">
          We've sent a 6-digit code to your email.
        </Text>
        <View className="flex flex-row mb-4">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className="w-10 h-10 border p-3 text-center text-xl rounded-md mx-1"
              keyboardType="number-pad"
              caretHidden={true}
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleChangeText(index, value)}
              autoFocus={index === 0}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={handleVerify}
          className="bg-blue-500 py-3 px-6 rounded-md w-full items-center"
        >
          <Text className="text-white font-semibold">Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResend} className="mt-4">
          <Text className="text-blue-500">Resend Code</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
