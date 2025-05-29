import "~/global.css";

import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/hooks/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { Text } from "~/components/ui/text";
import { X } from 'lucide-react-native';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { Menu } from "lucide-react-native";
import { Search } from "~/lib/icons/Search";
import { ClipboardList } from "~/lib/icons/ClipboardList";
import { Cloud } from "~/lib/icons/Cloud";
import { Star } from "~/lib/icons/Star";
import ClipboardScreen from "./index";
import Settings from "./settings";
import CustomDrawer from "~/components/custom/CustomDrawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ParamListBase } from "@react-navigation/native";
import { AuthProvider, useAuth } from "~/auth/AuthProvider";
import SignInScreen from "./sign-in";
import VerifyEmail from "./verifyEmail";
import { useSettings } from "~/lib/hooks/useSettings";
import { TabOption } from "~/types/types";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from "expo-router";

const usePlatformSpecificSetup = Platform.select({
  web: useSetWebBackgroundClassName,
  android: useSetAndroidNavigationBar,
  default: noop,
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const hasMounted = React.useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  
  const { user } = useAuth();
  const { settings } = useSettings();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  
  type TabValue = 'all' | 'favorites' | 'cloud';

  const [selectedSublabel, setSelectedSublabel] = React.useState({
    value: settings.defaultTab.value,
    label: settings.defaultTab.label,
  });
  const [isSearchVisible, setIsSearchVisible] = React.useState(false);

  React.useEffect(() => {
    setSelectedSublabel({
      value: settings.defaultTab.value as TabValue,
      label: settings.defaultTab.label
    });
  }, [settings.defaultTab]);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      document.documentElement.classList.add("bg-background");
    }
    setAndroidNavigationBar(colorScheme);
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }



  const customHeader = (
    label: string,
    navigation: DrawerNavigationProp<ParamListBase>
  ) => {

    const tabOptions = React.useMemo(() => [
      { label: "All", value: "all" },
      { label: "Favorites", value: "favorites" },
      { label: "Cloud", value: "cloud" }
    ], []);


    const renderIcon = () => {
      switch (selectedSublabel.value) {
        case "all":
          return <ClipboardList size={18} className="text-muted-foreground" />;
        case "favorites":
          return <Star size={18} className="text-muted-foreground" />;
        case "cloud":
          return <Cloud size={18} className="text-muted-foreground" />;
        default:
          return null;
      }
    };

    const handleTabChange = React.useCallback((value: { label?: string; value?: string }) => {
      const newValue: TabOption = {
        label: value?.label ?? settings.defaultTab.label,
        value: (value?.value as TabValue) ?? settings.defaultTab.value,
      };
      setSelectedSublabel(newValue);
      navigation.setParams({ 
        sublabel: newValue.value,
        showSearch: isSearchVisible,
      });
    }, [navigation, isSearchVisible]);

    return (
      <View className="flex flex-row items-center">
        <Text className="text-2xl font-bold px-4 mr-4">{label}</Text>
        {renderIcon()}
                <Select
          value={selectedSublabel}
          onValueChange={(option) => handleTabChange(option as TabOption)}
          defaultValue={settings.defaultTab}
        >
          <SelectTrigger className="w-32 border-0">
            <SelectValue
              className="text-foreground text-sm native:text-lg"
              placeholder="Select a filter"
            />
          </SelectTrigger>
          <SelectContent className="w-36">
            <SelectGroup>
              {tabOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  label={option.label} 
                  value={option.value} 
                />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    );
  };

  function AuthStack() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="sign-in" component={SignInScreen} />
        <Stack.Screen name="verifyEmail" component={VerifyEmail} />
      </Stack.Navigator>
    );
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
      {user ? (
        <Drawer.Navigator
          screenOptions={({ navigation }) => ({
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.toggleDrawer()}
                hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
                style={{ paddingLeft: 16 }}
              >
                <Menu size={24} color={isDarkColorScheme ? "white" : "black"} />
              </TouchableOpacity>
            ),
            headerTitleStyle: {
              marginLeft: 16,
            },
            
          })
        
        } drawerContent={(props) => <CustomDrawer {...props} />}
        >
          <Drawer.Screen
            name="index"
            component={ClipboardScreen}
            // initialParams={{ sublabel: selectedSublabel.value }}
            initialParams={{ 
              sublabel: selectedSublabel.value,
              showSearch: isSearchVisible,
              settings: settings 
            }}
            options={({ navigation }) => ({
              title: "Home",
              headerTitle: () => customHeader("Home", navigation),
              headerRight: () => (
                <TouchableOpacity
    onPress={() => {
      setIsSearchVisible(!isSearchVisible);
      navigation.setParams({ showSearch: !isSearchVisible });
    }}
    style={{ paddingRight: 16 }}
  >
    {isSearchVisible ? (
      <X size={24} color={isDarkColorScheme ? "white" : "black"} />
    ) : (
      <Search size={24} color={isDarkColorScheme ? "white" : "black"} />
    )}
  </TouchableOpacity>
              ),
            })}
          />
          <Drawer.Screen name="settings" component={Settings} options={{ title: "Settings" }} />
        </Drawer.Navigator>
      ) : (
        <AuthStack />
      )}
      <PortalHost />
    </ThemeProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
