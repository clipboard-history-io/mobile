import { Redirect } from "expo-router";
import * as React from "react";
import { ActivityIndicator, View } from "react-native";

import { db } from "~/lib/db";
import { useOnboardingIsCompletedQuery } from "~/lib/hooks/useOnboardingIsCompletedQuery";
import { useSettingsQuery } from "~/lib/hooks/useSettingsQuery";

export default function RootScreen() {
  const auth = db.useAuth();
  // Syncs nativewind colorScheme to theme stored in settings.
  const settingsQuery = useSettingsQuery();
  const onboardingIsCompletedQuery = useOnboardingIsCompletedQuery();

  if (
    auth.isLoading ||
    auth.error ||
    settingsQuery.isPending ||
    settingsQuery.error ||
    onboardingIsCompletedQuery.isPending ||
    onboardingIsCompletedQuery.error
  ) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!onboardingIsCompletedQuery.data) {
    return <Redirect href="/onboarding" />;
  }

  if (auth.user === null) {
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}
