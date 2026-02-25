import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import NoDataComponent from '../noData/noData'; 

interface MapComponentProps<T> {
  data: T[];
  renderItem: (item: T, index: number,array:any) => React.ReactNode; 
  keyExtractor?: (item: T) => string; 
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle; 
  textStyle?: TextStyle; 
  NoData?: React.ReactNode; 
  emptyMessage?: string; 
  style?: ViewStyle; 
  ItemSeparatorComponent?: React.ReactNode; 
  loader: boolean;
}

const MapComponent = <T extends { id: string }>({
  data,
  renderItem,
  keyExtractor,
  containerStyle,
  itemStyle,
  textStyle,
  NoData,
  emptyMessage = 'No data available',
  style,
  ItemSeparatorComponent,
  loader,
}: MapComponentProps<T>) => {
  return (
    <View style={[containerStyle]}>
      {(!loader && data && data.length > 0) ? (
        <View style={[style]}>
          {data?.map((item, index,array) => (
            <View key={keyExtractor ? keyExtractor(item) : item?.id} style={itemStyle}>
              {renderItem(item, index,array)}
              {ItemSeparatorComponent && index !== data.length - 1 && (
                <View>{ItemSeparatorComponent}</View>
              )}
            </View>
          ))}
        </View>
      ) : (
         (!loader &&data?.length<=0)&& <NoDataComponent Description={emptyMessage} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  
});

export default MapComponent;
