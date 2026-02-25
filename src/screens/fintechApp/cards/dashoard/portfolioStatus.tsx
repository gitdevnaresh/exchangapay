import React from "react";
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import ViewComponent from '../../../../components/view/view';
import TextMultiLangauge from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import Loadding from '../../../../components/skelton/skeltons';
import LineChartComponet from '../../../../components/graphs/Linchart';
import NoDataComponent from '../../../../components/noData/noData';
import { s } from '../../../../components/theme/scale';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';

interface Configuration {
  GRAPH?: {
    Cards?: boolean;
  };
}

interface DayItem {
  code: string;
  name: string;
}

interface CardsPortfolioStatusProps {
  Configuration: Configuration;
  graphDetailsLoading: boolean;
  graphDetails: unknown[];
  activeDays: string;
  handleYears: (item: DayItem) => void;
  cardGraphSkelton: JSX.Element;
}

const DaysLookup: DayItem[] = [{ code: '7D', name: '7' }, { code: '30D', name: '30' }];

const CardsPortfolioStatus: React.FC<CardsPortfolioStatusProps> = ({
  Configuration,
  graphDetailsLoading,
  graphDetails,
  activeDays,
  handleYears,
  cardGraphSkelton,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  if (!Configuration?.GRAPH?.Cards) {
    return null; // Don't render if config is off
  }

  return (
    <ViewComponent>
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
        <TextMultiLangauge text={"GLOBAL_CONSTANTS.SPENDING"} style={[commonStyles.sectionTitle]} />
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
            {DaysLookup?.map((item, index) => (
              <React.Fragment key={item.name}>
                {activeDays === item.name ? (
                  <ViewComponent style={[commonStyles.graphactivebuttons]} >
                    <ParagraphComponent style={[commonStyles.graphactivebuttonstext]} text={item.code} />
                  </ViewComponent>
                ) : (
                  <CommonTouchableOpacity onPress={() => handleYears(item)} style={commonStyles.graphinactivebuttons} activeOpacity={0.9} >
                    <ParagraphComponent style={[activeDays === item?.name ? commonStyles.textAlwaysWhite : commonStyles.textWhite, commonStyles.graphinactivebuttonstext]} text={item?.code} />
                  </CommonTouchableOpacity>
                )}
                {index !== DaysLookup?.length - 1 && <ViewComponent style={{ height: 26, width: 1 }} />}
              </React.Fragment>
            ))}
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>
      <ViewComponent style={[commonStyles.mt16]}>
        {graphDetailsLoading && <Loadding contenthtml={cardGraphSkelton} />}
        {!graphDetailsLoading && graphDetails?.length > 0 && <LineChartComponet
          data={graphDetails || []}
        />}
        {!graphDetailsLoading && graphDetails?.length <= 0 && (
          <NoDataComponent />
        )}
      </ViewComponent>
    </ViewComponent>
  );
};

export default CardsPortfolioStatus;