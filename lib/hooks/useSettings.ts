import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import { Settings, StorageOption, TabOption, ThemeOption } from "~/types/types";

const SETTINGS_STORAGE_KEY = "app_settings";

const defaultSettings: Settings = {
  allowBlankItems: false,
  storageLocation: { label: "Local", value: "local" },
  defaultTab: { label: "All", value: "all" },
  theme: { label: "System", value: "system" },
  allowDeletingFavorites: false,
  allowDeletingCloudItems: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    const newSettings = {
      ...settings,
      ...updates,
    };
    await saveSettings(newSettings);
  };

  const setAllowBlankItems = async (value: boolean) => {
    await updateSettings({ allowBlankItems: value });
  };

  const setAllowDeletingFavorites = async (value: boolean) => {
    await updateSettings({ allowDeletingFavorites: value });
  };

  const setAllowDeletingCloudItems = async (value: boolean) => {
    await updateSettings({ allowDeletingCloudItems: value });
  };

  const setStorageLocation = async (option: StorageOption) => {
    await updateSettings({ storageLocation: option });
  };

  const setDefaultTab = async (option: TabOption) => {
    await updateSettings({ defaultTab: option });
  };

  const setTheme = async (option: ThemeOption) => {
    await updateSettings({ theme: option });
  };

  return {
    settings,
    isLoading,
    setAllowBlankItems,
    setAllowDeletingFavorites,
    setAllowDeletingCloudItems,
    setStorageLocation,
    setDefaultTab,
    setTheme,
  };
}
