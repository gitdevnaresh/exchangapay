import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from "react-native";
import { useSelector } from "react-redux";
import {
  BankAddressTypeItem,
  BankAddressLuResponse,
  AddPersonalInfoRouteParams,
  AddressFormValues,
} from "../types/interface";
import { ReduxState } from "../../../interface";
import { ParamListBase, RouteProp, useIsFocused, useNavigation } from "@react-navigation/native";
import useEncryptDecrypt from "../../../../../../hooks/encDecHook";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import { showAppToast } from "../../../../../../components/toasterMessages/ShowMessage";
import ViewComponent from "../../../../../../components/view/view";
import DashboardLoader from "../../../../../../components/loader";
import Container from "../../../../../../components/container/container";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import CommonAddress from "../../../../onboarding/kyc/commonAddAdress";
import { useLngTranslation } from "../../../../../../hooks/languagesHook/useLngTranslation";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import { s } from "../../../../../../components/theme/scale";
import CardsModuleService from "../../../../../../apiServices/cards";

type AddPersonalInfoRouteProp = RouteProp<ParamListBase, 'AddPersonalInfo'> & {
  params?: AddPersonalInfoRouteParams;
};
interface AddPersonalInfoProps {
  route: AddPersonalInfoRouteProp;
}
const BankAddPersonalInfo = (props: AddPersonalInfoProps) => {
  const ref = useRef<any>(null);
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isTradingAddress, setIsTradingAddress] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const { encryptAES } = useEncryptDecrypt();
  const userInfo = useSelector((state: ReduxState) => state.userReducer?.userDetails);
  const isFocused = useIsFocused();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { t } = useLngTranslation();
  const [bankAddressLuData, setBankAddressLuData] = useState<BankAddressLuResponse | null>(null);
  const [initValues] = useState<AddressFormValues>({
    firstName: "",
    lastName: "",
    country: "",
    state: "",
    city: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    email: "",
    phoneCode: "",
    town: "",
    favoriteName: "",
    addressType: "",
    isDefault: true,
  });
  const handleSave = async (values: AddressFormValues) => {
    const addressPayload = {
      favoriteName: values?.favoriteName?.trim() || `${values?.firstName?.trim() ?? ''} ${values?.lastName?.trim() ?? ''}`.trim(),
      addressType: values?.addressType,
      country: values?.country,
      town: values?.town,
      state: values?.state?.trim(),
      city: values?.city?.trim(),
      addressLine1: values?.addressLine1?.trim(),
      addressLine2: values?.addressLine2?.trim(),
      postalCode: values?.postalCode?.trim() ? encryptAES(values.postalCode.trim()) : '',
      phoneNumber: values?.phoneNumber?.trim() ? encryptAES(values.phoneNumber.trim()) : '',
      email: values?.email?.trim() ? encryptAES(values.email.trim()) : '',
      phoneCode: values?.phoneCode?.trim() ? encryptAES(values.phoneCode.trim()) : '',
      isDefault: isEnabled,
      isTradingAddress: isTradingAddress,
      id: props?.route?.params?.cardId,
      customerId: userInfo?.id,
      createdBy: userInfo?.userName,
      createdDate: new Date()
    };
    const res = await CardsModuleService.cardsAddressPost(addressPayload);
    if (res?.ok) {
      showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
      navigation.goBack();
    }
    return res;
  };
  const handleGoBack = useCallback(() => { navigation.goBack(); }, []);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true;
    });
    return () => backHandler.remove();
  }, [handleGoBack]);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const toggleTradingSwitch = () => setIsTradingAddress((previousState) => !previousState);
  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {initialLoading ? (
        <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </ViewComponent>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={s(64)}
        >

          <Container style={commonStyles.container}>
            {(!props?.route?.params?.id && !props?.route?.params?.isKybEdit && !props?.route?.params?.isKycEdit) &&
              <PageHeader
                title={props?.route?.params?.KycInformation ? "GLOBAL_CONSTANTS.KYC" : props?.route?.params?.KybInformation ? "GLOBAL_CONSTANTS.KYB_INFORMATION" : "GLOBAL_CONSTANTS.ADD_ADDRESS"}
                onBackPress={handleGoBack}
              />
            }

            <CommonAddress
              isAddAddress={true}
              useStateInput={false}
              showNameFields={false}
              initValues={initValues}
              handleSave={handleSave}
              route={props?.route}
              isEnabled={isEnabled}
              isTradingAddress={isTradingAddress}
              onToggleDefault={toggleSwitch}
              onToggleTrading={toggleTradingSwitch}

            />
          </Container>
        </KeyboardAvoidingView>
      )}
    </ViewComponent>
  );
};
export default BankAddPersonalInfo;

