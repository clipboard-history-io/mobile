// import * as Clipboard from 'expo-clipboard';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect, useState, useRef } from 'react';
// import { ClipboardItemProps } from '~/types/types';
// import { db } from "~/auth/AuthProvider";
// import { lookup } from "@instantdb/core";
// import * as Crypto from 'expo-crypto'
// import { useSettings } from '~/lib/hooks/useSettings';

// const STORAGE_KEY = 'clipboard_history';
// const CLOUD_STATUS_KEY = "cloud_status_mapping";
// const POLLING_INTERVAL = 2000;

// async function loadClipboardHistory(user: string | null): Promise<ClipboardItemProps[]> {
//   const key = `${STORAGE_KEY}_${user}`;
//   const storedData = await AsyncStorage.getItem(key);
//   return storedData ? JSON.parse(storedData) : [];
// }

// async function saveClipboardHistory(history: ClipboardItemProps[], user: string | null) {
//   const key = `${STORAGE_KEY}_${user}`
//   await AsyncStorage.setItem(key, JSON.stringify(history));
// }

// async function getCloudStatus(item: ClipboardItemProps) {
//   const storedData = await AsyncStorage.getItem(CLOUD_STATUS_KEY);
//   return storedData ? JSON.parse(storedData) : {};
// }

// export function useClipboardHistory(user: string | null) {
//   const [clipboardHistory, setClipboardHistory] = useState<ClipboardItemProps[]>([]);
//   const [lastDeletedText, setLastDeletedText] = useState<string | null>(null);
//   const lastCopiedText = useRef<string | null>(null);
//   const { settings } = useSettings();
//   const [lastSyncTime, setLastSyncTime] = useState<number>(0);

//   const { data } = db.useQuery({
//     entries: {
//       $: {
//         where: {
//           $user: lookup("email", user)
//         }
//       } 
//     }
//   });



//   useEffect(() => {

    

//     // console.log('Effect triggered with data:', data?.entries ? 'has entries' : 'no entries');
//     // console.log('Current user:', user);
//     const initializeClipboardHistory = async () => {
//       try {
//         const [localHistory, cloudEntries] = await Promise.all([
//           loadClipboardHistory(user),
//           user ? fetchCloudEntries() : []
//         ]);
  
//         const allEntries = mergeHistories(localHistory, [ ...cloudEntries]);
//         setClipboardHistory(allEntries);
//         setLastSyncTime(Date.now());
//       } catch (error) {
//         console.error('Error initializing clipboard history:', error);
//       }
//     };
//     initializeClipboardHistory();

//     const checkClipboard = async () => {
//       try {
//         const text = (await Clipboard.getStringAsync()).trim();
//         if (!text || text === lastCopiedText.current || text === lastDeletedText) return;

//         if (!settings.allowBlankItems && text.trim().length === 0) {
//           console.log('Blank items are not allowed by settings');
//           return;
//         }

//         setClipboardHistory(prevHistory => {
//           if (prevHistory.some(item => item.text === text)) return prevHistory;

//           const newItem: ClipboardItemProps = {
//             id: Date.now().toString(),
//             text,
//             charCount: text.length,
//             favorite: false,
//             tags: [],
//             timestamp: new Date(),
//             isInCloud: settings.storageLocation.value === 'cloud',
//           };

//           const updatedHistory = [newItem, ...prevHistory];
//           saveClipboardHistory(updatedHistory, user);
//           lastCopiedText.current = text;

//           if (settings.storageLocation.value === 'cloud' && user && user !== 'guest') {
//             addToCloud(newItem.id, user).catch(error => {
//               console.error('Error adding new item to cloud:', error);
//             });
//           }
//           return updatedHistory;
//         });
//       } catch (error) {
//         console.error('Error reading clipboard:', error);
//       }
//     };

//     const interval = setInterval(checkClipboard, POLLING_INTERVAL);
//     return () => clearInterval(interval);
//   }, [lastDeletedText, settings.storageLocation, user]);



//   async function fetchCloudEntries(): Promise<ClipboardItemProps[]> {
//     if (!user || user === 'guest' || !data?.entries) return [];
//     console.log('called here')    
//   try {
//       return Object.values(data.entries).map(entry => ({
//         id: entry.emailContentHash.split('+')[1],
//         text: entry.content,
//         charCount: entry.content.length,
//         favorite: entry.isFavorited || false,
//         tags: entry.tags ? [entry.tags].flat() : [],
//         timestamp: new Date(entry.createdAt),
//         isInCloud: true
//       }));
//     } catch (error) {
//       console.error('Error fetching cloud entries:', error);
//       return [];
//     }
//   }

//   function deleteClipboardItem(id: string) {
//     setClipboardHistory((items) => {
//       const itemToDelete = items.find((item) => item.id === id);
  
//       if (!itemToDelete) return items;
  
//       if (itemToDelete.favorite) {
//         return items;
//       }
  
//       setLastDeletedText(itemToDelete.text);
//       const updatedHistory = items.filter((item) => item.id !== id);
//       saveClipboardHistory(updatedHistory, user);
//       return updatedHistory;
//     });
//   }

//   function toggleFavorite(id: string) {
//     setClipboardHistory(items => {
//       const updatedHistory = items.map(item =>
//         item.id === id ? { ...item, favorite: !item.favorite } : item
//       );
//       saveClipboardHistory(updatedHistory, user);
//       return updatedHistory;
//     });
//   }

//   function addTag(id: string, tag: string) {
//     setClipboardHistory(items => {
//       const updatedHistory = items.map(item =>
//         item.id === id && !item.tags.includes(tag)
//           ? { ...item, tags: [...item.tags, tag] }
//           : item
//       );
//       saveClipboardHistory(updatedHistory, user);
//       return updatedHistory;
//     });
//   }

//   function removeTag(id: string, tag: string) {
//     setClipboardHistory(items => {
//       const updatedHistory = items.map(item =>
//         item.id === id
//           ? { ...item, tags: item.tags.filter(t => t !== tag) }
//           : item
//       );
//       saveClipboardHistory(updatedHistory, user);
//       return updatedHistory;
//     });
//   }

//   function mergeHistories(localHistory: ClipboardItemProps[], cloudHistory: ClipboardItemProps[]): ClipboardItemProps[] {
//     const merged = [...localHistory];
//     const localIds = new Set(localHistory.map((item) => item.id));
  
//     cloudHistory.forEach((cloudItem) => {
//       if (!localIds.has(cloudItem.id)) {
//         merged.push({ ...cloudItem, isInCloud: true });
//       }
//     });
  
//     return merged;
//   }

//   async function addToCloud(id: string, user: string) {
//       try {
//         const item = clipboardHistory.find((historyItem) => historyItem.id === id);

//         if (!item) {
//           return;
//         }
  
//         const contentHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, item.text);
//         await db.transact(
//           db.tx.entries[lookup("emailContentHash", `${user}+${contentHash}`)]!.update({
//             createdAt: Date.now(),
//             content: item.text,
//           }).link({ $user: lookup("email", user) })
//         );

//         setClipboardHistory((items) => {
//           const updatedHistory = items.map((historyItem) =>
//             historyItem.id === id ? { ...historyItem, isInCloud: true } : historyItem
//           );
//           saveClipboardHistory(updatedHistory, user);
//           return updatedHistory;
//         });
        
  
//         console.log("Item added to cloud and status updated locally.");
//       } catch (error) {
//         console.error("Error adding to cloud:", error);
//       }
//   }

//   async function removeFromCloud(id: string, user: string) {
  
//     try {
//       const item = clipboardHistory.find((historyItem) => historyItem.id === id);

//       if (!item) {
//         console.error("Item not found in clipboard history.");
//         return;
//       }

//       const contentHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, item.text);
//       await db.transact(db.tx.entries[lookup("emailContentHash", `${user}+${contentHash}`)].delete());

//       setClipboardHistory((items) => {
//         const updatedHistory = items.map((historyItem) =>
//           historyItem.id === id ? { ...historyItem, isInCloud: false } : historyItem
//         );
//         saveClipboardHistory(updatedHistory, user);
//         return updatedHistory;
//       });

//       console.log("Item removed from cloud and status updated locally.");
//     } catch (error) {
//       console.error("Error removing from cloud:", error);
//     }
//   }

//   async function toggleCloud (id: string, user: string) {
//     const item = clipboardHistory.find((historyItem) => historyItem.id === id);
  
//     if (!item) {
//       console.error("Item not found in clipboard history.");
//       return;
//     }
  
//     if (item.isInCloud) {
//       await removeFromCloud(id, user);
//     } else {
//       await addToCloud(id, user);
//     }
//   }

//   return { clipboardHistory, toggleFavorite, addTag, removeTag, deleteClipboardItem, addToCloud, removeFromCloud, getCloudStatus, toggleCloud };
// }








///////////////////////////////////////////////////////





import * as Clipboard from 'expo-clipboard';
import { useEffect, useState, useRef } from 'react';
import { db } from "~/auth/AuthProvider";
import { lookup } from "@instantdb/core";
import { useSettings } from '~/lib/hooks/useSettings';
import { clipboardStorage } from './storage';
import { cloudService } from './cloud';
import { ClipboardItemProps } from '~/types/types';
import { tags } from 'react-native-svg/lib/typescript/xmlTags';

const POLLING_INTERVAL = 2000;

export function useClipboardHistory(user: string | null) {
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItemProps[]>([]);
  const [lastDeletedText, setLastDeletedText] = useState<string | null>(null);
  const lastCopiedText = useRef<string | null>(null);
  const { settings } = useSettings();
  

  // Cloud data subscription
  // if (user !== null) return;
    const { data } = db.useQuery({
      entries: {
        // $: {
        //   where: {
        //     $user: 'rhythmaich@gmail.com'
        //   }
        // }
      }
    });


  // Add immediate debug logging
  // useEffect(() => {
  //   console.log('Query state:', {
  //     hasUser: !!user,
  //     userValue: user,
  //     hasData: !!data,
  //     // hasError: !!error,
  //     // errorMessage: error?.message,
  //     entriesCount: data?.entries ? Object.keys(data.entries).length : 0
  //   });

  //   if (data?.entries) {
  //     const entries = Object.values(data.entries);
  //     console.log('Entries found:', entries.length);
  //     if (entries.length > 0) {
  //       console.log('First entry:', {
  //         emailContentHash: entries[0].emailContentHash,
  //         content: entries[0].content?.substring(0, 50),
  //         createdAt: new Date(entries[0].createdAt),
  //         tags: entries[0].tags
  //       });
  //     }
  //   }
  // }, [data, user]);

  useEffect(() => {
    if (data?.entries) {
      setClipboardHistory(prevHistory => {
        const cloudEntries = Object.values(data.entries).map(cloudService.transformCloudEntry);
        
        // Update existing items with cloud data
        const updatedHistory = prevHistory.map(item => {
          const cloudItem = cloudEntries.find(
            cloudItem => cloudItem.id === item.id
          );
          return cloudItem ? { ...cloudItem, isInCloud: true } : item;
        });

        return updatedHistory;
      });
    }
  }, [data?.entries]);

  // Merge local and cloud histories
  // const mergeHistories = (local: ClipboardItemProps[], cloud: ClipboardItemProps[]): ClipboardItemProps[] => {
  //   const merged = [...local];
  //   const localIds = new Set(local.map(item => item.id));
    
  //   cloud.forEach(cloudItem => {
  //     if (!localIds.has(cloudItem.id)) {
  //       merged.push(cloudItem);
  //     }
  //   });
    
  //   return merged;
  // };
  const mergeHistories = (local: ClipboardItemProps[], cloud: ClipboardItemProps[]): ClipboardItemProps[] => {
    const merged = [...local];
    const cloudMap = new Map(cloud.map(item => [item.id, item]));
    
    // Update existing items with cloud data
    for (let i = 0; i < merged.length; i++) {
      const cloudItem = cloudMap.get(merged[i].id);
      if (cloudItem) {
        merged[i] = { ...cloudItem, isInCloud: true };
        cloudMap.delete(merged[i].id);
      }
    }
    
    // Add remaining cloud items
    merged.push(...cloudMap.values());
    
    return merged;
  };

  const initializeHistory = async () => {
    try {
      const [localHistory, cloudEntries] = await Promise.all([
        clipboardStorage.load(user),
        data?.entries ? Object.values(data.entries).map(cloudService.transformCloudEntry) : []
      ]);

      const allEntries = mergeHistories(localHistory, cloudEntries);
      setClipboardHistory(allEntries);
    } catch (error) {
      console.error('Error initializing clipboard history:', error);
    }
  };

  // Initialize clipboard history
  useEffect(() => {


    initializeHistory();
  }, [user, data]);

  // Monitor clipboard changes
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = (await Clipboard.getStringAsync()).trim();
        if (!text || text === lastCopiedText.current || text === lastDeletedText) return;
        if (!settings.allowBlankItems && !text.trim()) return;

        const newItem: ClipboardItemProps = {
          id: Date.now().toString(),
          text,
          charCount: text.length,
          favorite: false,
          tags: [],
          timestamp: new Date(),
          isInCloud: settings.storageLocation.value === 'cloud'
        };

        setClipboardHistory(prev => {
          if (prev.some(item => item.text === text)) return prev;
          const updated = [newItem, ...prev];
          clipboardStorage.save(updated, user);
          return updated;
        });

        lastCopiedText.current = text;

        if (settings.storageLocation.value === 'cloud' && user && user !== 'guest') {
          await cloudService.add(newItem, user);
        }
      } catch (error) {
        console.error('Error monitoring clipboard:', error);
      }
    };

    const interval = setInterval(checkClipboard, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [lastDeletedText, settings, user]);

  // Action handlers
  const handlers = {
    async toggleCloud(id: string) {
      if (!user || user === 'guest') return;
      
      const item = clipboardHistory.find(item => item.id === id);
      if (!item) return;

      try {
        if (item.isInCloud) {
          await cloudService.remove(item, user);
        } else {
          await cloudService.add(item, user);
        }

        setClipboardHistory(items => {
          const updated = items.map(item => 
            item.id === id ? { ...item, isInCloud: !item.isInCloud } : item
          );
          clipboardStorage.save(updated, user);
          return updated;
        });
      } catch (error) {
        console.error('Error toggling cloud status:', error);
      }
    },

    deleteClipboardItem(id: string) {
      setClipboardHistory(items => {
        const item = items.find(item => item.id === id);
        if (!item || item.favorite) return items;

        setLastDeletedText(item.text);
        const updated = items.filter(item => item.id !== id);
        clipboardStorage.save(updated, user);
        return updated;
      });
    },

    toggleFavorite(id: string) {
      setClipboardHistory(items => {
        const updated = items.map(item =>
          item.id === id ? { ...item, favorite: !item.favorite } : item
        );
        clipboardStorage.save(updated, user);
        return updated;
      });
    },

    updateTags(id: string, tags: string[]) {
      setClipboardHistory(items => {
        const updated = items.map(item =>
          item.id === id ? { ...item, tags } : item
        );
        clipboardStorage.save(updated, user);
        return updated;
      });
    }
  };

  return {
    clipboardHistory,
    initializeHistory,
    ...handlers
  };
}