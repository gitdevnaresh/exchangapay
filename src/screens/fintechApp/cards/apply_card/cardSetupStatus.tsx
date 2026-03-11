import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ViewComponent from "../../../../components/view/view";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph"
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useSelector } from "react-redux";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { s } from "../../../../components/theme/scale";
import ButtonComponent from "../../../../components/buttons/button";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import CardsModuleService from "../../../../apiServices/cards";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import { isErrorDispaly } from "../../../../utils/helpers";
import DashboardLoader from "../../../../components/loader";
import ImageUri from "../../../../components/imageComponents/image";
import { RootState } from "../interface";

const CardSetupStatus = ({ route, navigation }: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [cardHolderStatus, setCardHolderStatus] = useState<string>("");
  const storeCardHolderStatusId=useSelector((state: RootState) => state.userReducer.cardHolderStatusId);
  useEffect(() => {
    handleRefresh(true)
  }, [route?.params?.cardId])

  const statusContent: Record<string, { title: string; subtitle: string }> = {
    approved: {
      title: "Congratulations, you're all set!",
      subtitle: "Thank you for verifying your identity.",
    },
    pending: {
      title: "Your verification is in progress",
      subtitle: "Your card application is under review. Please click refresh to check for updates.",
    },
    rejected: {
      title: "Verification Failed",
      subtitle: "Your card application could not be approved. Please contact support for assistance.",
    },
  };

  const defaultStatus = {
    title: "Your verification is in progress",
    subtitle: "Your card application is under review. Please click refresh to check for updates.",
  };
  const currentStatus = cardHolderStatus ? statusContent[cardHolderStatus.toLowerCase()] || defaultStatus : defaultStatus;

  const handleRefresh = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setButtonLoading(true);
    }
    setErrorMsg("");
    try {
      const response = await CardsModuleService.getCardHolderStatus(storeCardHolderStatusId?storeCardHolderStatusId:route?.params?.cardHolderStatusId);
      if (response?.status === 200) {
        const status = typeof response?.data === 'string' ? response.data : String(response?.data || "");
        setCardHolderStatus(status);
        if(status?.toLowerCase() === "approved"){
        navigation.navigate("ApplyCard", {
          logo: route?.params?.logo,
          cardName: route?.params?.cardName,
          cardType: route?.params?.cardType || route?.params?.type,
          cardId: route?.params?.cardId,
          cardPrice: route?.params?.cardPrice,
          currency: route?.params?.currency || route?.params?.cardCurrency,
          supportedPlatforms: route?.params?.supportedPlatforms,
          kycType: route?.params?.kycType,
          isCustomerCreated: route?.params?.isCustomerCreated,
          cardHolderStatus: cardHolderStatus,
          cardProcessType: route?.params?.cardProcessType,
          cardHolderStatusId: storeCardHolderStatusId?storeCardHolderStatusId:route?.params?.cardHolderStatusId,
          screenName:"CardSetupStatus"
        });
      }
      } else {
        setErrorMsg(String(isErrorDispaly(response)) || "An error occurred");
      }
    } catch (error) {
      setErrorMsg(String(isErrorDispaly(error)));
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setButtonLoading(false);
      }
    }
  };
  const handleBack = () => {
          navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.CARDS", animation: 'slide_from_left' });
   
      }
  return (
    <Container style={[commonStyles.container]}>
      <PageHeader title="" onBackPress={handleBack} />
      {loading ? (
        <DashboardLoader />
      ) : (
        <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>
          {errorMsg && <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} />}

        {/* Center Content */}
        <ViewComponent style={[commonStyles.myAuto]}>

          {(cardHolderStatus=="null"||cardHolderStatus==null||cardHolderStatus?.toLowerCase() === "pending") && (
            <ImageUri source={require('../../../../assets/images/underReview.png')} width={s(120)} height={s(120)} style={[commonStyles.mxAuto]} />
          )}
          
          {cardHolderStatus?.toLowerCase() === "rejected" && (
            <Ionicons
              name="close-circle-outline"
              size={100}
              color={NEW_COLOR.TEXT_RED}
              style={[commonStyles.mxAuto, commonStyles.titleSectionGap]}
            />
          )}
          
          {cardHolderStatus?.toLowerCase() === "approved" && (
            <Image
              source={require('../../../../assets/images/banklocal/success.png')}
              style={[commonStyles.mxAuto]}
            />
          )}

          {(
            <TextMultiLanguage
              text={`You're ${cardHolderStatus!=="null"  ? cardHolderStatus : "in progress"}!`}
              style={[
                commonStyles.textCenter,
                {
                  fontSize: s(18),
                  color: NEW_COLOR.TEXT_GREY,
                  marginBottom: s(12),
                },
              ]}
            />
          )}
          {/* Title */}
          <ParagraphComponent
            text={currentStatus.title}
            style={[
              commonStyles.textCenter,
              {
                fontSize: s(24),
                fontWeight: "500",
                color: NEW_COLOR.TEXT_WHITE,
                marginBottom: s(12),
              },
            ]}
          />

          {/* Subtitle */}
          <TextMultiLanguage
            text={currentStatus.subtitle}
            style={[
              commonStyles.textCenter,
              {
                fontSize: s(14),
                color: NEW_COLOR.TEXT_GREY,
                marginBottom: s(6),
              },
            ]}
          />

        </ViewComponent>
        {/* Refresh Button */}
        <ViewComponent style={[commonStyles.titleSectionGap]}>
          <ButtonComponent
            title={cardHolderStatus?.toLowerCase() !== "approved" ? "Refresh" : "Continue"}
            onPress={() => handleRefresh(false)}
            loading={buttonLoading}
          />
        </ViewComponent>

        </ViewComponent>
      )}
    </Container>
  );
};

export default CardSetupStatus;
