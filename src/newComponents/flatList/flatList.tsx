import React, { forwardRef, useCallback } from 'react';
import {
  FlatList,
  ViewStyle,
  TextStyle,
  FlatListProps,
  ListRenderItem,
} from 'react-native';
import ViewComponent from '../view/view';
import NoDataComponent from '../noData/noData';

interface FlatListComponentProps<T> extends FlatListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  isLoading?: boolean;
  NodeDataDescription?: string;
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  textStyle?: TextStyle;
  numColumns?: number;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  columnWrapperStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  horizontal?: boolean;
  NoData?: React.ComponentType<any> | React.ReactElement | null;
  style?: ViewStyle;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  updateCellsBatchingPeriod?: number;
}

function FlatListComponentInner<T>(
  {
    data,
    renderItem,
    keyExtractor,
    isLoading = false,
    NodeDataDescription,
    containerStyle,
    ListFooterComponent,
    NoData,
    itemStyle,
    textStyle,
    numColumns,
    ItemSeparatorComponent,
    columnWrapperStyle,
    contentContainerStyle,
    onEndReached,
    onEndReachedThreshold = 0.5,
    initialNumToRender = 15,
    maxToRenderPerBatch = 15,
    windowSize = 31,
    updateCellsBatchingPeriod = 50,
    style,
    horizontal = false,
    ...restProps
  }: FlatListComponentProps<T>,
  ref: React.Ref<FlatList<T>>
) {
  const shouldShowNoData = !isLoading && (!data || data.length === 0);
  
  const NoDataComponnet = useCallback(() => {
    if (shouldShowNoData) {
      return <NoDataComponent Description={NodeDataDescription} />;
    }
    return null;
  }, [shouldShowNoData, NodeDataDescription]);

  return (
    <ViewComponent style={[containerStyle]}>
      <FlatList
        ref={ref}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={NoData||NoDataComponnet }
        removeClippedSubviews={false}
        numColumns={numColumns}
        columnWrapperStyle={columnWrapperStyle}
        ItemSeparatorComponent={ItemSeparatorComponent}
        contentContainerStyle={contentContainerStyle}
        horizontal={horizontal}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={maxToRenderPerBatch}
        windowSize={windowSize}
        updateCellsBatchingPeriod={updateCellsBatchingPeriod}
        onEndReachedThreshold={onEndReachedThreshold}
        ListFooterComponent={ListFooterComponent}
        onEndReached={onEndReached}
        style={style}
        {...restProps}
      />
    </ViewComponent>
  );
}

const FlatListComponent = forwardRef(FlatListComponentInner) as <T>(
  props: FlatListComponentProps<T> & { ref?: React.Ref<FlatList<T>> }
) => React.ReactElement;

export default FlatListComponent;