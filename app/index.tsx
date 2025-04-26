import * as React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { ClipboardProvider, useClipboard } from '~/service/ClipboardProvider';
import { useClipboardHistory } from '~/service/ClipboardService';
import { ClipboardItemProps } from '~/types/types';
import ClipboardItem from '~/components/custom/ClipboardItem';
import {Input} from '~/components/ui/input'
import { useRoute } from '@react-navigation/native';
import NoEntriesLayout from '~/components/custom/NoEntriesLayout';
import { ClipboardScreenRouteProp } from '~/types/types';
import { useAuth } from '~/auth/AuthProvider';
import { useSettings } from '~/lib/hooks/useSettings';

const ClipboardList: React.FC<{
  data: ClipboardItemProps[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTag: (id: string) => void;
  onToggleCloud: (id: string, user: string) => void;
  onRefresh: () => void;
}> = ({ data, onEdit, onDelete, onToggleFavorite, onTag, onToggleCloud, onRefresh }) => {

  const [refreshing, setRefreshing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const route = useRoute<ClipboardScreenRouteProp>();
  const showSearch = route.params?.showSearch;

  React.useEffect(() => {
    if (!showSearch) {
      setSearchTerm('');
    }
  }, [showSearch]);

  // const {initializeClipboardHistory} = useClipboard()

  const filteredData = React.useMemo(() => {
    return data.filter(item => 
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <>
      {showSearch && (
        <Input
          placeholder="Search clips..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          clearButtonMode="while-editing"
          autoFocus
          className="mx-4 my-2"
        />
      )}
    <FlatList
      data={filteredData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ClipboardItem
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onTag={onTag}
          onToggleCloud={onToggleCloud}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['grey']}
          progressBackgroundColor={'black'}
        />
      }
      contentContainerStyle={{ gap: 0 }}
    />
    </>
  );
};

const ClipboardScreen: React.FC = () => {
  const route = useRoute<ClipboardScreenRouteProp>();
  const sublabel = route.params?.sublabel || "all"; // Default to "all"
  const {user} = useAuth()
  const {settings} = useSettings()
  
  const { clipboardHistory, deleteClipboardItem, toggleFavorite, toggleCloud, initializeHistory } = useClipboardHistory(user);

  React.useEffect(() => {
    initializeHistory();
  }, [settings]); 


  // Filter clipboard items based on selected sublabel
  const filteredClipboardHistory = clipboardHistory.filter((item) => {
    if (sublabel === "favorites") return item.favorite;
    if (sublabel === "cloud") return item.isInCloud;
    return true; // Show all items if "all"
  });

  const handleRefresh = async () => {
    await initializeHistory();
  };

  return (
    <ClipboardProvider>
      {filteredClipboardHistory.length > 0 ? (
        <ClipboardList data={filteredClipboardHistory} onEdit={() => {}} onDelete={deleteClipboardItem} onToggleFavorite={toggleFavorite} onTag={() => {}} onToggleCloud={toggleCloud} onRefresh={handleRefresh}/>
      ) : (
        <NoEntriesLayout />
      )}
    </ClipboardProvider>
  );
};


export default ClipboardScreen;
