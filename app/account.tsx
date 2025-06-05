import { useRouter } from "expo-router";
import { ActivityIndicator, Linking, View } from "react-native";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { db } from "~/lib/db";

export default function AccountScreen() {
  const router = useRouter();
  const { user } = db.useAuth();

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 flex-col justify-between px-5 py-3">
      <View className="flex-col gap-4">
        <Text className="font-semibold">{user.email}</Text>
        <Button
          variant="secondary"
          onPress={() => Linking.openURL(`${process.env.EXPO_PUBLIC_BASE_URL}/checkout/${user.id}`)}
        >
          <Text>Manage Subscription</Text>
        </Button>
        <Button
          onPress={async () => {
            await db.auth.signOut();

            router.dismissTo("/");
          }}
        >
          <Text>Sign Out</Text>
        </Button>
      </View>
      <View className="pb-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Text>Delete Account</Text>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-4">
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <AlertDialogAction
                onPress={async () => {
                  await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/me`, {
                    method: "DELETE",
                    headers: new Headers({
                      Authorization: `Bearer ${user.refresh_token}`,
                    }),
                  });

                  router.dismissTo("/");
                }}
                className="bg-destructive"
              >
                <Text>Continue</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
    </View>
  );
}
