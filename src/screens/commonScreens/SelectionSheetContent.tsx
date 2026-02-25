import React, { useState, useEffect } from 'react';
import ViewComponent from '../../components/view/view';
import Loadding from '../../components/skelton/skeltons';
import FlatListComponent from '../../components/flatList/flatList';
import NoDataComponent from '../../components/noData/noData';
import ButtonComponent from '../../components/buttons/button';
import CommonTouchableOpacity from '../../components/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../components/textComponets/paragraphText/paragraph';
import SearchComponent from '../../components/searchComponents/searchComponent';
import SvgFromUrl from '../../components/svgIcon';
import { CoinImages } from '../../components/CommonStyles';
import { s } from '../../constants/styels/scale';
import { formatCurrency } from '../../utils/helpers';

interface SelectionItem {
  id: string;
  code: string;
  name?: string;
  image?: string;
  amount?: number;
  changeIn24Hours?: number;
  [key: string]: any;
}

interface SelectionSheetContentProps {
  dataLoading: boolean;
  itemsList: SelectionItem[];
  selectedItem: SelectionItem | null;
  handleActiveItem: (item: SelectionItem) => void;
  transactionCardContent?: any;
  commonStyles: any;
  s: (val: number) => number;
  handleNavigateAdd?: () => void;
  searchPlaceholder: string;
  searchBindKey: string;
  addButtonTitle?: string;
  showAddButton?: boolean;
  showAmount?: boolean;
  showChangePercent?: boolean;
  iconSize?: number;
}

interface SelectionListItemProps {
  item: SelectionItem;
  isActive: boolean;
  onPress: (item: SelectionItem) => void;
  isLastItem: boolean;
  commonStyles: any;
  showAmount?: boolean;
  showChangePercent?: boolean;
  iconSize?: number;
}

const SelectionListItem: React.FC<SelectionListItemProps> = ({
  item,
  isActive,
  onPress,
  isLastItem,
  commonStyles,
  showAmount = false,
  showChangePercent = false,
}) => {
  return (
    <CommonTouchableOpacity onPress={() => onPress(item)}>
      <ViewComponent style={[
        commonStyles.dflex,
        commonStyles.alignCenter,
        commonStyles.gap16,
        commonStyles.justifyContent,
        isActive && commonStyles.tabactivebg,
        commonStyles.p8,
        commonStyles.rounded11

      ]}>
        <ViewComponent style={{ with: s(32), height: s(32) }}>
          <SvgFromUrl
            uri={CoinImages[item?.code?.toLowerCase()]}
            width={s(32)}
            height={s(32)}
          />
        </ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap10]}>
          <ViewComponent>
            <ParagraphComponent
              text={item?.code}
              style={[commonStyles.secondarytext]}
            />
            {/* {item?.name && (
              <ParagraphComponent 
                text={item?.name} 
                style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} 
              />
            )} */}
          </ViewComponent>
          {showAmount && (
            <ViewComponent>
              <ParagraphComponent
                text={`${formatCurrency(item?.amount || 0, 2)} ${item?.code}`}
                style={[commonStyles.primarytext, commonStyles.textRight]}
              />
              {showChangePercent && item?.changeIn24Hours && (
                <ParagraphComponent
                  text={`${item?.changeIn24Hours}%`}
                  style={[
                    commonStyles.fs10,
                    commonStyles.fw600,
                    commonStyles.textRight,
                    item?.changeIn24Hours > 0 ? commonStyles.textGreen : commonStyles.textRed
                  ]}
                />
              )}
            </ViewComponent>
          )}
        </ViewComponent>
      </ViewComponent>
      {!isLastItem && (
        <ViewComponent style={[commonStyles.transactionsListGap]} />
      )}
    </CommonTouchableOpacity>
  );
};

const SelectionSheetContent: React.FC<SelectionSheetContentProps> = ({
  dataLoading,
  itemsList,
  selectedItem,
  handleActiveItem,
  transactionCardContent,
  commonStyles,
  handleNavigateAdd,
  searchPlaceholder,
  searchBindKey,
  addButtonTitle,
  showAddButton = false,
  showAmount = false,
  showChangePercent = false,
  iconSize = 24,
  s,
}) => {
  const [filteredItems, setFilteredItems] = useState<SelectionItem[]>(itemsList || []);

  useEffect(() => {
    setFilteredItems(itemsList);
  }, [itemsList]);

  const handleSearchResult = (result: SelectionItem[]) => {
    setFilteredItems(result);
  };

  if (dataLoading && !itemsList.length) {
    return <Loadding contenthtml={transactionCardContent} />;
  }

  if (itemsList?.length === 0) {
    return (
      <ViewComponent>
        <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter,]}>
          <NoDataComponent />
        </ViewComponent>
        {showAddButton && handleNavigateAdd && addButtonTitle && (
          <>
            <ViewComponent style={commonStyles.sectionGap} />
            <ButtonComponent
              title={addButtonTitle}
              onPress={handleNavigateAdd}
            />
          </>
        )}
      </ViewComponent>
    );
  }

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>
      <ViewComponent>
        <SearchComponent
          data={itemsList}
          customBind={searchBindKey}
          onSearchResult={handleSearchResult}
          placeholder={searchPlaceholder}
        />

        {filteredItems?.length > 0 ? (
          <FlatListComponent
            scrollEnabled={false}
            data={filteredItems || []}
            keyExtractor={(item: SelectionItem) => item.id.toString()}
            renderItem={({ item, index }) => (
              <SelectionListItem
                item={item}
                isActive={selectedItem?.id === item.id}
                onPress={handleActiveItem}
                isLastItem={index === filteredItems?.length - 1}
                commonStyles={commonStyles}
                showAmount={showAmount}
                showChangePercent={showChangePercent}
                iconSize={iconSize}
              />
            )}
            contentContainerStyle={{ paddingBottom: s(20) }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <NoDataComponent />
        )}

        <ViewComponent style={commonStyles.sectionGap} />
      </ViewComponent>

      {showAddButton && handleNavigateAdd && addButtonTitle && (
        <ViewComponent style={commonStyles.sectionGap}>
          <ButtonComponent
            title={addButtonTitle}
            onPress={handleNavigateAdd}
          />
        </ViewComponent>
      )}
    </ViewComponent>
  );
};

export default SelectionSheetContent;