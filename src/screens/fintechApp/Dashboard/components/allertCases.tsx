import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { s } from "../../../../constants/styels/scale";
import ProfileService from '../../../../apiServices/profile';
import { useNavigation } from '@react-navigation/native';
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { Foundation } from '@expo/vector-icons';
import AutoSlideCarousel from '../../../../screens/commonScreens/autoSliderCarousal/contentCarousel';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import ViewComponent from '../../../../components/view/view';
import { ProfilePrimaryServices } from '../../../../apiServices/profile/primary';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  typeId: string;
  // Add other fields from your API if needed
}

interface AlertsCarouselProps {
  screenName?: string;
}

const AlertsCarousel: React.FC<AlertsCarouselProps> = ({ screenName }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const navigation = useNavigation<any>();
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);


  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response: any = await ProfilePrimaryServices.getAlertCasess();
        if (response.ok) {
          setAlerts(response.data);
        } else {
          // Handle error state if needed
        }
      } catch (error) {
        // Handle error state if needed
      }
    };

    fetchAlerts();
  }, []);

  const handleViewDetails = useCallback((alertId: string) => {
    navigation?.navigate('SupportCaseView', { id: alertId, screenName: screenName })
  }, [navigation, screenName]);
  const carouselData = useMemo(() => {
    return alerts.map((alert) => (
      <ViewComponent
        key={alert.id}
        style={[
          commonStyles.casescarouselbg,
          commonStyles.dflex,
          commonStyles.alignStart,
          commonStyles.justifyContent,
          commonStyles.gap16,
          commonStyles.casescarouselspacing,
          { width: '97%' } // ⭐ FULL WIDTH
        ]}
      >
        <Foundation
          name="info"
          size={s(32)}
          color={NEW_COLOR.CAROUSEL_INFO}
          style={[commonStyles.mt6]}
        />

        <ViewComponent style={[commonStyles.flex1]}>
          <ParagraphComponent
            text={alert.title}
            style={commonStyles.casescarouseltitle}
            numberOfLines={1}
          />

          {alert?.message && (
            <ParagraphComponent
              text={alert.message}
              style={commonStyles.casescarouselpara}
              numberOfLines={1}
            />
          )}
        </ViewComponent>
        <TouchableOpacity onPress={() => handleViewDetails(alert.typeId)}>
          <TextMultiLanguage
            text="GLOBAL_CONSTANTS.VIEW_DETAILS"
            style={commonStyles.casescarousellink}
          />
        </TouchableOpacity>
      </ViewComponent>
    ));
  }, [alerts, commonStyles]);

  if (!alerts || alerts.length === 0) {
    return null;
  }
  return (
    (alerts && alerts.length > 0) ? (
      <ViewComponent style={[]}>
        <AutoSlideCarousel
          data={carouselData}
          duration={5000}
          height={s(80)}
        />
      </ViewComponent>
    ) : null
  );
};

export default AlertsCarousel;
