import React, { useEffect, useState } from 'react';
import Container from '../../../../newComponents/container/container';
import ViewComponent from '../../../../newComponents/view/view';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { s } from '../../../../constants/theme/scale';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import { cardsService } from '../../../../apiServices/cardsApis/cardsApiServices';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../../utils/helpers';
import { Octicons } from "@expo/vector-icons";
import { formatBillingAddress } from '../constants';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import ImageBackgroundWrapper from '../../../../newComponents/imageComponents/ImageBackground';
import { VisaHorizontalImage } from '../../../../assets/vectorAssets';
import { Dimensions } from 'react-native';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import RoundedPlusIcon from '../../../../assets/mainmenuicons/roundedPlus';
import { buildApplyCardPayload } from './constants';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { setBillingAddress, setShippingAddress } from '../../../../redux/actions/cardActions';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { CurrencyText } from '../../../../newComponents/textComponets/currencyText/currencyText';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import LabelComponent from '../../../../newComponents/textComponets/lableComponent/lable';
import { MAsterIcon } from '../../../../assets/svg';

const CardApplicationOrder = () => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const route = useRoute();
  const navigation = useNavigation<any>();
  const card = (route.params as any)?.card;
  const billingAddress = useSelector((state: any) => state?.cardsReducer?.billingAddress);
  const shippingAddress = useSelector((state: any) => state?.cardsReducer?.shippingAddress);
  const [promoCode, setPromoCode] = useState<string>('');
  const [applyBtnloading, setApplyBtnloading] = useState<boolean>(false);
  const screenWidth = Dimensions.get("window").width;
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const dispatch = useDispatch();
  const [error, setError] = useState<string>("");

  const handleBackPress = () => {
    navigation.goBack();
  };
  const { t } = useLngTranslation();
  const handleBillingAddress = () => {
    navigation.navigate('AddressForm', {
      addressType: 'billing',
      mode: 'edit',
      activeCard: card,
    });
  };
  useEffect(() => {
    setError("");
    if (!billingAddress) {
      getApplyCardDeatilsInfo();
    }
  }, [])
  useHardwareBackHandler(() => {
    if (!applyBtnloading) {
      handleBackPress()

    }
  })
  const getApplyCardDeatilsInfo = async () => {
    try {
      const response: any = await cardsService.getKycRequirements(card?.id)
      if (response?.status === 200) {
        dispatch(setBillingAddress({
          ...response?.data,
          address1: response?.data?.addressLine1,
          address2: response?.data?.addressLine2,
          postalCode: decryptAES(response?.data?.postalCode),
          town: response?.data?.town || ''
        }));
      } else {
        setError(isErrorDispaly(response));
      }
    }
    catch (error) {
      setError(isErrorDispaly(error));
    }
  }
  const handleShippigAddress = () => {
    setError("");
    navigation.navigate('AddressForm', {
      addressType: 'shipping',
      mode: 'edit',
      initialValues: shippingAddress || undefined
    });
  }
  const isBillingAddressValid = () => {
    if (!billingAddress) return false;
    const requiredFields = ['cardholderName', 'address1', 'city', 'state', 'postalCode', 'country', 'town'];
    return requiredFields.every(field => billingAddress[field] && billingAddress[field].trim() !== '');
  };

  // Handler for Review & Pay button
  const handleApplyCard = async () => {
    setError("");
    if (!billingAddress) {
      setError(t("GLOBAL_CONSTANTS.PLEASE_ADD_BILLING_ADDRESS"));
      return;
    }
    if (card?.cardType === 'Physical' && !shippingAddress) {
      setError(t("GLOBAL_CONSTANTS.PLEASE_ADD_SHIPPING_ADDRESS"));
      return;
    }

    setApplyBtnloading(true);
    try {
      const payload = buildApplyCardPayload({
        card,
        promoCode,
        billingAddress,
        shippingAddress,
        encryptAES
      });
      const response: any = await cardsService.applycard(payload)
      if (response.status === 200) {
        navigation.navigate('Dashboard', { screen: 'GLOBAL_CONSTANTS.CARDS' });
        setApplyBtnloading(false);
        showAppToast(t("GLOBAL_CONSTANTS.CARD_APPLIED_SUCCESSFULLY"), "success")
        dispatch(setBillingAddress(""));
      }
      else {
        setError(isErrorDispaly(response))
        setApplyBtnloading(false);
      }
    }
    catch (error) {
      setError(isErrorDispaly(error))
      setApplyBtnloading(false);
    }
  };
  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container>
        <PageHeader title={"GLOBAL_CONSTANTS.CARD_APPLICATION_ORDER"} onBackPress={handleBackPress} disable={applyBtnloading} />
        {error && <ErrorComponent message={error} screen={true} />}
        <ScrollViewComponent>
          <ViewComponent style={[commonStyles.sectionGap]}>
            <ImageBackgroundWrapper
              source={{ uri: card.logo }}
              style={[
                commonStyles.rounded12,
                { width: screenWidth * 0.80, height: s(186), alignSelf: 'center', overflow: 'hidden', borderRadius: s(12), }
              ]}
              resizeMode="cover"
              imageStyle={[commonStyles.rounded12, { width: '100%', height: '100%', borderRadius: s(16) }
              ]}
            >
              <ViewComponent style={[commonStyles.flex1, commonStyles.p16, { justifyContent: 'flex-end', alignItems: 'flex-end', }]}>
                {card?.cardAssoc?.toLowerCase() === 'visa' ? <VisaHorizontalImage /> : <MAsterIcon />}
              </ViewComponent>
            </ImageBackgroundWrapper>
          </ViewComponent>
          <ViewComponent >
            {/* Details Section */}
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.DETAILS"} style={[commonStyles.fs16, commonStyles.fw700, commonStyles.mb16,]} />

            <ViewComponent style={[commonStyles.listbg]}>
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.TYPE"} style={[commonStyles.listsecondarytext]} />
              <TextMultiLanguage text={card.cardType === 'Physical' ? "GLOBAL_CONSTANTS.PHYSICAL_CARD" : "GLOBAL_CONSTANTS.VIRTUAL_CARD"} style={[commonStyles.listprimarytext]} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.menuitemspace]} />

            {/* Billing Address */}
            <ViewComponent style={[commonStyles.billinglistbg]}>
              <ViewComponent style={{ flex: 1 }}>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.BILLING_ADDRESS"}
                  children={<LabelComponent text={" *"} style={[commonStyles.textError]} />}
                  style={[commonStyles.listsecondarytext]} />
                <ParagraphComponent text={formatBillingAddress(billingAddress || card)} style={[commonStyles.listprimarytext]} />
              </ViewComponent>
              <CommonTouchableOpacity onPress={handleBillingAddress} disabled={applyBtnloading}>
                {billingAddress ? <Octicons name="pencil" size={s(20)} color={NEW_COLOR.LIST_SECONDARYTEXT} /> : <RoundedPlusIcon width={s(20)} height={s(20)} />}
              </CommonTouchableOpacity>
            </ViewComponent>
            <ViewComponent style={[commonStyles.menuitemspace]} />
            {/* Shipping Address */}
            {card.cardType?.toLowerCase() === 'physical' && <ViewComponent style={[commonStyles.billinglistbg, commonStyles.menuitemspace]}>
              <ViewComponent style={{ flex: 1 }}>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.SHIPPING_ADDRESS"} style={[commonStyles.listsecondarytext]} />
                <ParagraphComponent text={formatBillingAddress(shippingAddress || card)} style={[commonStyles.listprimarytext]} numberOfLines={3} />
              </ViewComponent>
              <CommonTouchableOpacity onPress={handleShippigAddress} disabled={applyBtnloading}>
                {shippingAddress ?
                  <Octicons name="pencil" size={s(20)} color={NEW_COLOR.LIST_SECONDARYTEXT} /> : <RoundedPlusIcon width={s(20)} height={s(20)} />}
              </CommonTouchableOpacity>
            </ViewComponent>
            }
            {/* Sub total */}
            <ViewComponent style={[commonStyles.listbg]}>
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.SUB_TOTAL"} style={[commonStyles.listsecondarytext]} />
              <CurrencyText
                currency={card.cardCurrency}
                value={card.cardFee}
                style={[commonStyles.listprimarytext]}


              />
            </ViewComponent>
            <ViewComponent style={[commonStyles.menuitemspace]} />

            {/* Total */}
            <ViewComponent style={[commonStyles.listbg, commonStyles.sectionGap]}>
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.TOTAL"} style={[commonStyles.listsecondarytext]} />
              <CurrencyText
                currency={card.cardCurrency}
                value={card.cardFee}
                style={[commonStyles.listprimarytext]}

              />
            </ViewComponent>


          </ViewComponent>
        </ScrollViewComponent>
        <ViewComponent style={[commonStyles.flex1]} />
        {/* Review & Pay Button */}
        <ButtonComponent
          title={"GLOBAL_CONSTANTS.REVIEW_PAY"}
          onPress={handleApplyCard}
          loading={applyBtnloading}
          disable={applyBtnloading || !isBillingAddressValid() || (card?.cardType?.toLowerCase() === 'physical' && !shippingAddress)}
        />
        <ViewComponent style={[commonStyles.sectionGap]} />
      </Container>
    </ViewComponent>
  );
};

export default CardApplicationOrder;
