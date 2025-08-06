import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Clipboard, Cloud, Lock, LucideProps, Settings } from "lucide-react-native";
import * as React from "react";
import { Linking, ScrollView, View } from "react-native";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

type OnboardingSlide = {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  content?: React.ReactNode;
};

const slides: OnboardingSlide[] = [
  {
    icon: Cloud,
    title: "Welcome to Clipboard History IO Mobile",
    description:
      "Clipboard History IO Mobile allows you to access and manage your clipboard history and keep it in sync with any device signed in to the Clipboard History IO browser extension or mobile app.",
    content: (
      <View className="mt-6">
        <View className="items-center rounded-lg bg-muted/30 px-4 py-3">
          <Text className="text-muted-foreground">Don't have the browser extension? Get it at</Text>
          <Text
            className="mt-1 text-lg font-semibold text-primary underline"
            onPress={() => Linking.openURL("https://www.clipboardhistory.io/")}
          >
            clipboardhistory.io
          </Text>
        </View>
      </View>
    ),
  },
  {
    icon: Clipboard,
    title: "How It Works",
    description:
      "Each time you open the app, it automatically captures whatever text is currently on your clipboard and syncs it across all your connected devices.",
  },
  {
    icon: Lock,
    title: "Your Account",
    description:
      "Use the same email address across all Clipboard History IO browser extensions and mobile apps to keep your clipboard history in perfect sync.",
    content: (
      <View className="mt-6">
        <Text className="text-center text-muted-foreground">
          By continuing, you agree to our{" "}
          <Text
            className="text-primary underline"
            onPress={() => Linking.openURL("https://www.clipboardhistory.io/html/privacy.html")}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    ),
  },
  {
    icon: Settings,
    title: "Quick iOS Setup",
    description:
      "For the best experience, allow clipboard access to eliminate the paste notification.",
    content: (
      <Card className="mt-4 bg-muted/50 p-3">
        <Text className="text-sm leading-5">
          <Text className="font-semibold">Settings</Text> →{" "}
          <Text className="font-semibold">Apps</Text> →{"\n"}
          <Text className="font-semibold">Clipboard History IO Mobile</Text> →{"\n"}
          <Text className="font-semibold">Paste from Other Apps</Text> →{" "}
          <Text className="font-semibold text-primary">Allow</Text>
        </Text>
      </Card>
    ),
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const queryClient = useQueryClient();

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      completeOnboarding();
    } else {
      setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("onboardingIsCompleted", "true");
    queryClient.setQueryData(["onboardingIsCompleted"], true);
    router.replace("/");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 pb-8 pt-20">
            <View key={currentSlide} className="flex-1">
              <View className="mb-8 items-center">
                <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="text-primary" size={48} />
                </View>
                <Text className="mb-4 text-center text-3xl font-bold">{slide.title}</Text>
                <Text className="px-4 text-center text-base leading-6 text-muted-foreground">
                  {slide.description}
                </Text>
                {slide.content}
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-8">
          <View className="mb-6 flex-row justify-center">
            {slides.map((_, index) => (
              <View
                key={index}
                className={cn(
                  "mx-1 h-2 w-2 rounded-full",
                  index === currentSlide ? "w-6 bg-primary" : "bg-muted-foreground/30",
                )}
              />
            ))}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              {currentSlide > 0 && (
                <Button variant="outline" onPress={handleBack} className="w-full">
                  <Text>Back</Text>
                </Button>
              )}
            </View>
            <View className="flex-1">
              <Button onPress={handleNext} className="w-full">
                <Text className="text-primary-foreground">
                  {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
