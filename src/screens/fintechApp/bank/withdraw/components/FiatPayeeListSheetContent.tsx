import React, { useState, useEffect, useRef, useMemo } from 'react';
import ViewComponent from '../../../../../components/view/view';
import Loadding from '../../../../../components/skelton/skeltons';
import FlatListComponent from '../../../../../components/flatList/flatList';
import NoDataComponent from '../../../../../components/noData/noData';
import ButtonComponent from '../../../../../components/buttons/button';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import SearchComponent from '../../../../../components/searchComponents/searchComponent';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { useNavigation } from '@react-navigation/native';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import { s } from '../../../../../components/theme/scale';
import { getTabsConfigation } from '../../../../../../../cofiguration';

interface FiatPayee {
  id: string;
  favoriteName: string;
  walletAddress: string;
  walletCode?: string;
  currency?: string;
}

interface FiatPayeeListSheetContentProps {
  dataLoading: boolean;
  payeesList: FiatPayee[];
  selectedPayee: FiatPayee | null;
  handleActivePayee: (item: FiatPayee) => void;
  transactionCardContent: any;
  commonStyles: any;
  s: (val: number) => number;
  handleNavigatePayee: () => void;
  screenName?: string;
  payeeSheetRef?: any;
}

interface FiatPayeeListItemProps {
  item: FiatPayee;
  isActive: boolean;
  onPress: (item: FiatPayee) => void;
  isLastItem: boolean;
  commonStyles: any;
  screenName?: string;
  payeeSheetRef?: any;

}

const FiatPayeeListItem: React.FC<FiatPayeeListItemProps> = ({ item, isActive, onPress, isLastItem, screenName, payeeSheetRef }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const navigation = useNavigation<any>();
  const payeeSheetNoteRef = useRef<any>(null)
  const handlePress = (item: any) => {
    if (item?.providerStatus === "Not Submitted" && screenName) {
      payeeSheetNoteRef?.current?.open();
    } else {
      // Otherwise, bind or select the data (trigger parent callback)
      onPress(item);
    }
  };
  const handleNavigateToEditPayee = (item: any) => {
    payeeSheetNoteRef?.current?.close();
    payeeSheetRef?.current?.close();
    navigation?.navigate("AccountDetails", {
      id: item?.id,
      stableCoinPayout: true,
      screenName: "payoutEditPayee",
      accountType: item?.accountType
    });
  }
  return (
    <>
      <CommonTouchableOpacity onPress={() => handlePress(item)}>
        <ViewComponent >
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, isActive ? commonStyles.activeItemBg : commonStyles.inactiveItemBg,]} >
            <ViewComponent style={[commonStyles.bottomsheetroundediconbg, isActive && commonStyles.bottomsheetroundedactiveiconbg]}>
              <ParagraphComponent style={[commonStyles.twolettertext]} text={item.favoriteName?.slice(0, 1)?.toUpperCase() || ''} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.flex1]} >
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]} >
                <ParagraphComponent style={[commonStyles.bottomsheetprimarytext]} text={item.favoriteName || ''} numberOfLines={1} />
                <ParagraphComponent style={[commonStyles.bottomsheetprimarytext]} text={item.walletCode || ''} numberOfLines={1} />
              </ViewComponent>
              {(item.walletAddress || item?.name) && (
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.mt5]} text={item.walletAddress || item?.name || ''} numberOfLines={2} />
              )}
            </ViewComponent>

          </ViewComponent>
        </ViewComponent>
        {!isLastItem && (
          <ViewComponent style={[commonStyles.listGap]} />
        )}
      </CommonTouchableOpacity>

      <CustomRBSheet
        refRBSheet={payeeSheetNoteRef}
        height={"Medium"}
        title={"Note"}
        modeltitle
      >
        <ViewComponent>
          <ViewComponent>
            <ParagraphComponent style={[commonStyles.textCenter, commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} text={"This payee is not available for the payments transactions.To do the Payments Transaction on this payee need to add the extra docuemts for this payee."} />
          </ViewComponent>
          <ViewComponent style={[commonStyles.mt32]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.UPDATE_PAYEE"}
              onPress={() => handleNavigateToEditPayee(item)}
            />
          </ViewComponent>
        </ViewComponent>

      </CustomRBSheet>
    </>
  );
};

const FiatPayeeListSheetContent: React.FC<FiatPayeeListSheetContentProps> = ({
  dataLoading,
  payeesList,
  selectedPayee,
  handleActivePayee,
  transactionCardContent,
  commonStyles,
  handleNavigatePayee,
  s,
  screenName,
  payeeSheetRef
}) => {
  const [filteredPayees, setFilteredPayees] = useState<FiatPayee[]>(payeesList || []);
  const quickLinksConfiguration = getTabsConfigation("WALLETS")
  useEffect(() => {
    setFilteredPayees(payeesList);
  }, [payeesList]);

  const handleSearchResult = (result: FiatPayee[]) => {
    setFilteredPayees(result);
  };

  if (dataLoading && !payeesList.length) {
    return <Loadding contenthtml={transactionCardContent} />;
  }

  if (payeesList?.length === 0 && quickLinksConfiguration.QUCIKLINKS?.IS_ON_THE_GO) {
    return (
      <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>
        <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
          <NoDataComponent />
        </ViewComponent>
        <ViewComponent style={commonStyles.sectionGap}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.ADD_NEW_PAYEE"}
            onPress={handleNavigatePayee}
          />
        </ViewComponent>
      </ViewComponent>
    );
  }
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>
      <ViewComponent>
        <SearchComponent
          data={payeesList}
          customBind="favoriteName"
          onSearchResult={handleSearchResult}
          placeholder="GLOBAL_CONSTANTS.SEARCH_PAYEES"
        />

        {filteredPayees?.length > 0 ? (
          <FlatListComponent
            scrollEnabled={false}
            data={filteredPayees || []}
            keyExtractor={(item: FiatPayee) => item.id.toString()}
            renderItem={({ item, index }) => (
              <FiatPayeeListItem
                item={item}
                isActive={selectedPayee?.id === item.id}
                onPress={handleActivePayee}
                isLastItem={index === filteredPayees?.length - 1}
                commonStyles={commonStyles}
                screenName={screenName}
                payeeSheetRef={payeeSheetRef}
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
      {quickLinksConfiguration.QUCIKLINKS?.IS_ON_THE_GO && <ViewComponent style={commonStyles.sectionGap}>
        <ButtonComponent
          title={"GLOBAL_CONSTANTS.ADD_NEW_PAYEE"}
          onPress={handleNavigatePayee}
        />
      </ViewComponent>}

    </ViewComponent>
  );
};

export default FiatPayeeListSheetContent; 
