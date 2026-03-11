import React, { useState, useEffect, useMemo } from "react";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import ViewComponent from "../../../newComponents/view/view";
import ProfileService from "../../../services/profile";
import { useNavigation } from "@react-navigation/native";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import AutoSlideCarousel from "../../commonScreens/autoSliderCarousal/contentCarousel";
import { s } from "../../../newComponents/theme/scale";

interface AlertItem {
  id: string;
  title: string;
  message: string;
  typeId: string;
}

interface AlertsCarouselProps {
  commonStyles: any;
  screenName?: string;
    alerts: AlertItem[];
}

const CaseAlertsCarousel: React.FC<AlertsCarouselProps> = ({
  commonStyles,
  screenName,
    alerts
}) => {
  const navigation = useNavigation<any>();

  

  const handleViewDetails = (alertId: string) => {
    navigation.navigate("SupportCaseView", { id: alertId, screenName });
  };

  // Build React elements for the carousel
  const carouselData = useMemo(
    () =>
      alerts.map((alert) => (
        <ViewComponent
          key={alert.id}
          style={[
            commonStyles.dflex,
            commonStyles.alignCenter,
            commonStyles.justifyContent,
            commonStyles.gap16,
            { height: s(65) } // ensure each slide has visible height
          ]}
        >
          <Icon name="info-circle" size={s(24)} color="#E1E31E" />
          <ViewComponent style={[commonStyles.flex1]}>
            <ParagraphComponent
              text={alert.title}
              style={[
                commonStyles.fw700,
                commonStyles.textWhite,
                commonStyles.fs14
              ]}
              numberOfLines={1}
            />
            {alert.message && (
              <ParagraphComponent
                text={alert.message}
                style={[
                  commonStyles.fw400,
                  commonStyles.textlinkgrey,
                  commonStyles.fs12,
                  commonStyles.mt4
                ]}
                numberOfLines={2}
              />
            )}
          </ViewComponent>
          <TouchableOpacity onPress={() => handleViewDetails(alert.typeId)}>
            <TextMultiLanguage
              text="GLOBAL_CONSTANTS.VIEW_DETAILS"
              style={[
                commonStyles.fw400,
                commonStyles.fs14,
                {color:"#E1E31E"}
              ]}
            />
          </TouchableOpacity>
        </ViewComponent>
      )),
    [alerts, commonStyles]
  );

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <ViewComponent style={[commonStyles.sectionGap]}>
      <AutoSlideCarousel
        data={carouselData}
        duration={5000}
        height={s(65)}
        width={s(360)}
        contentKey={undefined} // 🔑 tells the carousel to render elements directly
      />
    </ViewComponent>
  );
};

export default CaseAlertsCarousel;
