import {View} from 'react-native'
import { Text } from '~/components/ui/text'

const NoEntriesLayout: React.FC = () => {
  return (
    <View className='flex flex-1 flex-col justify-center items-center'>
      <Text className='text-2xl py-6'>Your clipboard history is empty</Text>
      <Text className='text-xl text-muted-foreground'>Copy any text to see it here</Text>
    </View>
  )
}

export default NoEntriesLayout;