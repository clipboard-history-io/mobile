import React from "react";
import { Linking, View, TouchableOpacity, Image } from "react-native";
import {Text} from '~/components/ui/text'
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useAuth } from "~/auth/AuthProvider";

const CustomDrawer = (props: any) => {
  const { signOut, user } = useAuth();

  const handleOpenChangeLogURL = () => {
    console.log('helo')
    Linking.openURL('https://github.com/ayoung19/clipboard-history/releases')
  }

  const handleOpenSupportDevelopmentURL = () => {
    // Linking.openURL('https://github.com/ayoung19/clipboard-history/releases')
  }

  const handleOpenHelpAndFeedbackURL = () => {
    // Linking.openURL('https://github.com/ayoung19/clipboard-history/releases')
  }
  return (
    <View style={{ flex: 1 }}>
      {/* Header Section */}
      <View style={{ padding: 20, backgroundColor: "#6200ea", alignItems: "center" }}>
        <Image
          source={{ uri: "https://via.placeholder.com/80" }}
          style={{ width: 80, height: 80, borderRadius: 40 }}
        />
        <Text style={{ color: "white", fontSize: 14 }}>{user}</Text>
      </View>

      {/* Drawer Items */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Footer Section */}
        <TouchableOpacity onPress={() => handleOpenChangeLogURL} style={{ paddingVertical: 10 }}>
          <Text style={{ textAlign: "center", fontSize: 16 }}>Changelog</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOpenSupportDevelopmentURL} style={{ paddingVertical: 10 }}>
          <Text style={{ textAlign: "center", fontSize: 16 }}>Support Development</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOpenHelpAndFeedbackURL} style={{ paddingVertical: 10 }}>
          <Text style={{ textAlign: "center", fontSize: 16 }}>Help and Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => signOut()} style={{ paddingVertical: 10 }}>
          <Text style={{ textAlign: "center", fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
    </View>
  );
};

export default CustomDrawer;
