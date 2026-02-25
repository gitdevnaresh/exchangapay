import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getThemedCommonStyles, getStatusColor } from '../../../../../components/CommonStyles';
import { s } from '../../../../../constants/styels/scale';
import FlatListComponent from '../../../../../components/flatList/flatList';
import ViewComponent from '../../../../../components/view/view';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import TeamsService from '../../../../../apiServices/profile/primary/teams';
import { FormattedDateText } from '../../../../../components/textComponets/dateTimeText/dateTimeText';
import NoDataComponent from '../../../../../components/noData/noData';
import DashboardLoader from '../../../../../components/loader';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import { isErrorDispaly } from '../../../../../utils/helpers';
import { HistoryItem, CardHistoryTabProps, CardHistoryResponse } from '../utils/interfaces';
import { PAGINATION, UI } from '../constants';

const CardHistoryTab: React.FC<CardHistoryTabProps> = ({ cardId, isActiveTab, onError }) => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasDataLoaded, setHasDataLoaded] = useState<boolean>(false);

  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const statusColor = getStatusColor(NEW_COLOR);

  useEffect(() => {
    if (cardId) {
      setHistoryData([]);
      setHasDataLoaded(false); // Reset loaded state for new card
    }
  }, [cardId]);

  useEffect(() => {
    if (isActiveTab && cardId && !hasDataLoaded) {
      getCardHistory();
      setHasDataLoaded(true);
    }
  }, [isActiveTab, cardId, hasDataLoaded]);

  const getCardHistory = async () => {
    setLoading(true);

    try {
      const response = (await TeamsService.getCardHistory(1, PAGINATION.SMALL_PAGE_SIZE, cardId)) as CardHistoryResponse;
      if (response?.ok) {
        const data = response?.data?.data || [];

        setHistoryData(data);
      } else {
        onError?.(isErrorDispaly(response));
      }
    } catch (error) {
      onError?.(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSeeAll = useCallback(() => {
    navigation.navigate('CardHistoryList', {
      cardId,
      cardName: UI.CARD_HISTORY_TITLE
    });
  }, [navigation, cardId]);

  const renderItem = useCallback(({ item, index }: { item: HistoryItem; index: number }) => {
    return (
      <ViewComponent>
        <ViewComponent
          style={[
            commonStyles.cardsbannerbg
          ]}
        >
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
            <ParagraphComponent
              style={[commonStyles.primarytext]}
              text={item.cardName}
              numberOfLines={1}
            />
            <ParagraphComponent
              style={[
                commonStyles.colorstatus,
                { color: statusColor[item.action?.toLowerCase()] || NEW_COLOR.TEXT_GREY }
              ]}
              text={item.action}
            />
          </ViewComponent>

          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
            <ParagraphComponent
              style={[commonStyles.primarytext]}
              text={item.createdBy}
            />
            <FormattedDateText
              value={item.createdDate}
              conversionType='UTC-to-local'
              style={[commonStyles.secondarytext]}
            />
          </ViewComponent>


        </ViewComponent>
        {index !== historyData.length - 1 && <ViewComponent style={[commonStyles.transactionsListGap]} />}
      </ViewComponent>
    );
  }, [commonStyles, statusColor, NEW_COLOR, historyData.length]);

  if (loading) {
    return (
      <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
        <DashboardLoader />
      </ViewComponent>
    );
  }



  return (
    <ViewComponent style={[commonStyles.flex1]}>
      {historyData.length > 0 && (
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.alignEnd, commonStyles.titleSectionGap]}>
          <CommonTouchableOpacity onPress={handleSeeAll}>
            <TextMultiLanguage text="GLOBAL_CONSTANTS.SEE_ALL" style={[commonStyles.sectionLink]} />
          </CommonTouchableOpacity>
        </ViewComponent>
      )}

      <FlatListComponent
        data={historyData}
        renderItem={renderItem}
        keyExtractor={(item: HistoryItem, index: number) => item?.id || index.toString()}
        showsVerticalScrollIndicator={false}
        containerStyle={{ paddingBottom: s(UI.TAB_BOTTOM_PADDING) }}
        ListEmptyComponent={
          !loading ? (
            <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt20]}>
              <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
            </ViewComponent>
          ) : null
        }
      />
    </ViewComponent>
  );
};

export default CardHistoryTab;
