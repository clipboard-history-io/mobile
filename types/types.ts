import { RouteProp } from "@react-navigation/native";

export interface ClipboardItemProps {
    id: string;
    text: string;
    charCount: number;
    favorite: boolean;
    tags: string[];
    timestamp: Date;
    isInCloud: boolean;
  }

  export type ClipboardScreenRouteProp = RouteProp<{ ClipboardScreen: { sublabel: string, showSearch?: boolean; } }, "ClipboardScreen">;

  export type StorageOption = { 
    label: string; 
    value: "local" | "cloud" 
  };
  
  
  export type TabOption = { 
    label: string; 
    value: "all" | "favorites" | "cloud" 
  };

  export type ThemeOption = { 
    label: string; 
    value: "light" | "dark" | "system" 
  };
  
  export interface Settings {
    allowBlankItems: boolean;
    storageLocation: StorageOption;
    defaultTab: TabOption;
    theme: ThemeOption;
    allowDeletingFavorites: boolean;
    allowDeletingCloudItems: boolean;
  }

  export interface CloudEntry {
    emailContentHash: string;
    content: string;
    createdAt: number;
    isFavorited?: boolean;
    tags?: string;
  }