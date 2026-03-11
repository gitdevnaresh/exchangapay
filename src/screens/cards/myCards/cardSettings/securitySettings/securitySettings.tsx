import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../../../../hooks/useThemeColors';
import ViewComponent from '../../../../../newComponents/view/view';
import Container from '../../../../../newComponents/container/container';
import PageHeader from '../../../../../newComponents/pageHeader/pageHeader';
import ImageUri from '../../../../../newComponents/imageComponents/image';
import { s } from '../../../../../constants/theme/scale';
import ParagraphComponent from '../../../../../newComponents/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { cardsService } from '../../../../../apiServices/cardsApis/cardsApiServices';
import { showAppToast } from '../../../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../../../utils/helpers';
import CustomSwitch from '../../../../../newComponents/switch';
import { useHardwareBackHandler } from '../../../../../hooks/HardwareBackHandler';
import SwokipayDashboardLoader from '../../../../../newComponents/swokipayloader';
import { getThemedCommonStyles } from '../../../../../assets/styles/CommonStyles';
import ImageBackgroundWrapper from '../../../../../newComponents/imageComponents/ImageBackground';
import { CARDS_URLS } from '../../../../../assets/blobUrls';
import { useLngTranslation } from '../../../../../hooks/useLngTranslation';
import ErrorComponent from '../../../../../newComponents/errorDisplay/errorDisplay';



const SecuritySettings = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const card = route.params?.activeCard;
  const cardNumber = card?.number;
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [switchOnlineLoader, setSwitchOnlineLoader] = useState<boolean>(false)
  const [switchOfflineLoader, setSwitchOfflineLoader] = useState<boolean>(false)
  const { t } = useLngTranslation();
  const [error, setError] = useState<string>("");
  const handlebackpress = () => {
    navigation.goBack();
  };

  useHardwareBackHandler(() => {
    handlebackpress();
    return true;
  });

  useEffect(() => {
    if (card?.id) {
      fetchSettings();
    } else {
      setLoading(false);
      setError(t("GLOBAL_CONSTANTS.CARD_INFORMATION_MISSING"));
    }
  }, [card?.id]);

  const fetchSettings = async (showLoader = true) => {
    setError("");
    if (showLoader) {
      setLoading(true);
    }
    try {
      const response: any = await cardsService.getSecuritySettings(card?.id);
      if (response.status === 200) {
        setSettings(response?.data);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const onlinePayments = settings?.allowedTransactions?.onlinePayments ?? false;
  const offlinePayments = settings?.allowedTransactions?.offlinePayments ?? false;
  const transactionCurrency = settings?.transactionCurrency;

  const handleSettingChange = async (type: 'online' | 'offline', value: boolean) => {
    setError("");
    if (!settings) return;
    const originalSettings = JSON.parse(JSON.stringify(settings));
    const optimisticSettings = { ...settings };
    if (!optimisticSettings.allowedTransactions) {
      optimisticSettings.allowedTransactions = {};
    }
    const key = type === 'online' ? 'onlinePayments' : 'offlinePayments';
    optimisticSettings.allowedTransactions[key] = value;
    setSettings(optimisticSettings);
    const payload = { type, value };
    try {
      const response: any = await cardsService.updatePaymentTypes(card.id, payload);
      if (response.status === 200) {
        const paymentType = type === 'online' ? 'Online payments' : 'Offline payments';
        const status = value ? 'enabled' : 'disabled';
        const successMessage = `${paymentType} ${status} successfully.`;
        showAppToast(successMessage, "success");
        setSwitchOnlineLoader(false)
        setSwitchOfflineLoader(false)
        await fetchSettings(false); // Re-fetch without loader
      } else {
        setSettings(originalSettings);
        setError(isErrorDispaly(response));
        setSwitchOnlineLoader(false)
        setSwitchOfflineLoader(false)
      }
    } catch (error) {
      setSettings(originalSettings);
      setError(isErrorDispaly(error));
      setSwitchOnlineLoader(false)
      setSwitchOfflineLoader(false)
    }
  };

  const handleOfflinePayments = (value: boolean) => {
    handleSettingChange('offline', value);
    setSwitchOfflineLoader(true)
  };

  const handleOnlinePayments = (value: boolean) => {
    handleSettingChange('online', value);
    setSwitchOnlineLoader(true)
  };

  const handleTransactionCurrency = () => {
    navigation.navigate("CurrencyList", {
      from: "SecuritySettings",
      cardId: card?.id,
      cardNumber: cardNumber,
      selectedCurrencyCode: settings?.transactionCurrency,
      pageHeaderTitle: "GLOBAL_CONSTANTS.SET_TRANSATION_CURRENCY",
      onSelect: async (currencyCode: string) => {
        if (currencyCode === settings?.transactionCurrency) {
          setError('This is already your selected transaction currency.');
          return;
        }

        if (!card?.id) return;
        try {
          const response = await cardsService.UpdateTransactionCurrency(card.id, currencyCode);
          if (response.status === 200) {
            showAppToast(`Transaction currency set to ${currencyCode}.`, "success");
            await fetchSettings(false); // Re-fetch without loader
          } else {
            setError(isErrorDispaly(response));
          }
        } catch (error) {
          setError(isErrorDispaly(error));
        }
      }
    });
  }
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {loading ? <SwokipayDashboardLoader /> : (
        <Container>
          <PageHeader title={"GLOBAL_CONSTANTS.SECURITY_SETTINGS"} onBackPress={handlebackpress} />
          {error && <ErrorComponent message={error} screen={true} />}
          {/* Card Info */}
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.cardslistbg, commonStyles.sectionGap, commonStyles.gap16]}>
            <ViewComponent style={[commonStyles.rounded12, commonStyles.justifyend]}>
              <ImageBackgroundWrapper
                source={{ uri: card?.logo }}
                resizeMode="cover"
                imageStyle={[commonStyles.rounded4]}
                style={[{ height: s(40), width: s(60) }]}
              >
              </ImageBackgroundWrapper>
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex]}>
              <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400, { maxWidth: s(140) }]} numberOfLines={1}
                text={`${card.lable || card.type || card.cardType}`} />
              <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]}
                text={` **** ${(card.last4 || (cardNumber ? cardNumber.slice(-4) : ''))}`}
              />
            </ViewComponent>
          </ViewComponent>

          {/* Allowed transaction types */}
          <TextMultiLanguage text="GLOBAL_CONSTANTS.ALLOWED_TRANSACTION_TYPES" style={[commonStyles.fs12, commonStyles.fw700, commonStyles.mb16]} />
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.ENABLE_OR_DISABLE_DIFFERENT_PAYMENT_SCENARIOS_FOR_ENHANCED_SECURITY"} style={[commonStyles.textGrey, commonStyles.fs14_24, commonStyles.mb16]} />

          {/* Online payments toggle */}
          <ViewComponent style={[commonStyles.list, commonStyles.dflex, commonStyles.alignCenter, commonStyles.menuitemspace]}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
              <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                <Feather name="globe" size={s(20)} color={NEW_COLOR.TEXT_WHITE} />
              </ViewComponent>
              <TextMultiLanguage text="GLOBAL_CONSTANTS.ONLINE_PAYMENTS" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
              {switchOnlineLoader && <ActivityIndicator size="small" color={NEW_COLOR.BG_YELLOW} />}

              <CustomSwitch
                value={onlinePayments}
                onValueChange={handleOnlinePayments}
                disable={switchOnlineLoader}
              />
            </ViewComponent>
          </ViewComponent>

          {/* Offline payments toggle */}
          <ViewComponent style={[commonStyles.list, commonStyles.dflex, commonStyles.alignCenter, { justifyContent: 'space-between' }, commonStyles.mb24]}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
              <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                <ImageUri width={s(24)} height={s(24)} uri={CARDS_URLS?.offlinePayments} />

              </ViewComponent>
              <TextMultiLanguage text="GLOBAL_CONSTANTS.OFFLINE_PAYMENTS" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
              {switchOfflineLoader && <ActivityIndicator size="small" color={NEW_COLOR.BG_YELLOW} />}
              <CustomSwitch
                value={offlinePayments}
                onValueChange={handleOfflinePayments}
                disable={switchOfflineLoader}
              />
            </ViewComponent>
          </ViewComponent>

          {/* Set transaction currency */}
          {/* <TextMultiLanguage text="GLOBAL_CONSTANTS.SET_TRANSATION_CURRENCY" style={[commonStyles.fs12, commonStyles.fw700, commonStyles.mb16]} />
          <TouchableOpacity
            style={[commonStyles.list, commonStyles.mb10]}
            onPress={handleTransactionCurrency}
          >
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap16]}>
              <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                <UsdCurrencyIcon color={commonStyles.textWhite.color} />
              </ViewComponent>
              <ViewComponent style={[commonStyles.flex1]}>

                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                  <TextMultiLanguage text="GLOBAL_CONSTANTS.TRANSACTION_CURRENCY" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                    <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14]} text={transactionCurrency} />
                    <Ionicons name="chevron-forward" size={20} color={NEW_COLOR.TEXT_GREY} />
                  </ViewComponent>
                </ViewComponent>


                <ParagraphComponent style={[commonStyles.textGrey, commonStyles.fs12, commonStyles.mt4]} text={`${t('GLOBAL_CONSTANTS.ONLY_SELECTED_CURRENCIES_ALLOWED')}`} />
              </ViewComponent>

            </ViewComponent>

          </TouchableOpacity> */}
        </Container>
      )}
    </ViewComponent>
  );
};

export default SecuritySettings;