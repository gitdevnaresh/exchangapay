import React, { useState } from "react";
import { ActivityIndicator, Clipboard } from "react-native";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import CopyCard from "../../../../../components/copyIcon/CopyCard";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { REFERRAL_CONST } from "../../../profile/referrals/membersConstants";
import ButtonComponent from "../../../../../components/buttons/button";
import { Alert } from "react-native";
import { WebView } from 'react-native-webview';

interface CardActionsSheetCardDetailsProps {
  cardsDetails?: {
    number?: string;
    expireDate?: string;
    cvv?: string;
  };
  CardsInfoData?: any
  cardHolderName?: string;
  decryptAES: (encryptedText: string | undefined) => string;
  onClose?: () => void; // New prop for handling close action
  viewIFrame?: any;
  webViewLoading?: boolean;
}

const CardActionsSheetCardDetails: React.FC<CardActionsSheetCardDetailsProps> = ({
  cardsDetails,
  cardHolderName,
  decryptAES,
  onClose,
  CardsInfoData,
  viewIFrame,
  webViewLoading
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [isWebViewLoading, setIsWebViewLoading] = useState(false);

  const safeDecryptValue = (value?: string) => {
    if (!value || typeof value !== "string") return "";
    try {
      return decryptAES(value);
    } catch {
      // Some providers can return plain-text/masked values instead of encrypted payload.
      return value;
    }
  };

  const copyToClipboard = async (text: any) => {
    try {
      await Clipboard.setString(String(text));
    } catch (error: any) {
      Alert.alert(REFERRAL_CONST.FAILED_TO_COPY, error);

    }
  };

  const detailItem = (labelKey: string, rawValue: string | undefined, isSensitive: boolean = false) => {
    const decryptedOrRawValue = isSensitive ? safeDecryptValue(rawValue) : rawValue;

    const displayValue = (labelKey === "GLOBAL_CONSTANTS.CARD_NUMBER" && decryptedOrRawValue)
      ? decryptedOrRawValue.replace(/\d{4}(?=.)/g, "$& ") // Add spaces for card number
      : decryptedOrRawValue;

    return (
      <ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
          <TextMultiLangauge
            text={labelKey}
            style={[commonStyles.listsecondarytext]}
          />
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
            <ParagraphComponent
              text={displayValue || "N/A"}
              style={[commonStyles.listprimarytext]}
              numberOfLines={1}
            />
            {displayValue && displayValue !== "N/A" && (
              <CopyCard onPress={() => copyToClipboard(displayValue)} copyIconColor={NEW_COLOR.TEXT_PRIMARY} />
            )}
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.listitemGap]} />
      </ViewComponent>

    );
  };


  return (
    <ViewComponent>
      {(
        !CardsInfoData?.cardViewFlow ||
        CardsInfoData.cardViewFlow.toLowerCase() === "api"
      ) && (
          <ViewComponent>
            {detailItem("GLOBAL_CONSTANTS.HOLDER_NAME", CardsInfoData?.holderName || "XXXXX")}
            {detailItem("GLOBAL_CONSTANTS.CARD_NUMBER", cardsDetails?.number || "XXXX XXXX XXXX XXXX", true)}
            {detailItem("GLOBAL_CONSTANTS.VALIDATE_UPTO", cardsDetails?.expireDate || "**/**", true)}
            {detailItem("GLOBAL_CONSTANTS.CVV", cardsDetails?.cvv || "***", true)}
          </ViewComponent>
        )}

      {CardsInfoData?.cardViewFlow?.toLowerCase() == "iframe" && (
        <ViewComponent style={{ height: 300, marginBottom: 16, backgroundColor: NEW_COLOR.BACKGROUND }}>
          {viewIFrame ? (
            <ViewComponent style={{ flex: 1 }}>
              {(webViewLoading || isWebViewLoading) && (
                <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: NEW_COLOR.BACKGROUND, zIndex: 1 }]}>
                  <ActivityIndicator size="large" color={NEW_COLOR.PRIMARY} />
                </ViewComponent>
              )}
              <WebView
                source={{ uri: viewIFrame }}
                style={{ flex: 1, backgroundColor: NEW_COLOR.BACKGROUND }}
                onLoadStart={() => setIsWebViewLoading(true)}
                onLoadEnd={() => setIsWebViewLoading(false)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            </ViewComponent>
          ) : (
            <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
              <ActivityIndicator size="large" color={NEW_COLOR.PRIMARY} />
            </ViewComponent>
          )}
        </ViewComponent>
      )}

      {onClose && (
        <ViewComponent>
          <ViewComponent style={[commonStyles.sectionGap]} />
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.CLOSE"}
            onPress={onClose}
            solidBackground={true}
          />
        </ViewComponent>
      )}
    </ViewComponent>
  );
};

export default CardActionsSheetCardDetails;
