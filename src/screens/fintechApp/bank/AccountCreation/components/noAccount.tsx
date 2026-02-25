import { useIsFocused, useNavigation } from "@react-navigation/native"
import { useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Container from "../../../../../components/container/container"
import ButtonComponent from "../../../../../components/buttons/button"
import TextMultiLanguage from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge"
import { s } from "../../../../../components/theme/scale"
import ViewComponent from "../../../../../components/view/view"
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook"
import { BankImage } from "../../../../../assets/svg"
import { getThemedCommonStyles } from "../../../../../components/CommonStyles"
import PageHeader from "../../../../../components/pageHeader/pageHeader"
import { isErrorDispaly } from "../../../../../utils/helpers"
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay"
import CreateAccountService from "../../../../../apiServices/bank/createAccount"
import ProfileService from "../../../../../apiServices/profile"
import { walletsTabsNavigation } from '../../../../../../configuration'
import { getVerificationData } from "../../../../../apiServices/common/countryService"
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors"
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation"
import EnableProtectionModel from "../../../../commonScreens/protection"
import SuccessBottomSheet from "../../../../commonScreens/successBottomSheet/successBottomSheet"

interface FormValues {
  currency: string;
  bank: string;
}

const CreateAccountInformation = (props: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const [errormsg, setErrormsg] = useState("");
  const [errormsgLink, setErrormsgLink] = useState("");
  const isFocused = useIsFocused();
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const successSheetRef = useRef<any>(null);
  const dispatch = useDispatch();
  const userInfo = useSelector((state: any) => state.userReducer.userDetails);
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)

  useHardwareBackHandler(() => {
    if (apiLoading) {
      return true;
    }
    handleBack();
    return true;
  });
  const navigationSource = useSelector((state: any) => state.userReducer?.navigationSource);
  const isFromDashboard = navigationSource === 'Dashboard';

  const handleBack = () => {
    if (apiLoading) {
      return;
    }
    const isFromWalletsAssetsSelector = navigationSource === 'WalletsAssetsSelector';

    if (props?.route?.params?.screenName === "WalletsAllCoinsList") {
      navigation.navigate(walletsTabsNavigation, { initialTab: 1, animation: 'slide_from_left' });
      return;
    }
    if (isFromWalletsAssetsSelector && props?.route?.params?.screenName === "WalletsAllCoinsListSelection") {

      navigation.navigate('WalletsAssetsSelector', {
        ...props?.route?.params?.originalParams,
        animation: 'slide_from_left'
      });
      return;
    }

    if (props?.route?.params?.screenName === "WalletsDashboard") {
      navigation.reset({
        index: 0,
        routes: [{
          name: 'Dashboard',
          params: {
            initialTab: "GLOBAL_CONSTANTS.WALLETS",
            animation: 'slide_from_left'
          }
        }]
      });
      return;
    }
    const screenName = props.route.params?.screenName;
    if (screenName === "WalletsAllCoinsList") {
      navigation.navigate('WalletsAllCoinsList', { animation: 'slide_from_left', initialTab: 1 });
    }
    if (isFromWalletsAssetsSelector) {
      navigation.navigate('WalletsAssetsSelector', {
        ...props?.route?.params?.originalParams,
        animation: 'slide_from_left'
      });
    }
    else {
      navigation.reset({
        index: 0,
        routes: [{
          name: 'Dashboard',
          params: {
            initialTab: isFromDashboard ? "GLOBAL_CONSTANTS.HOME" : "GLOBAL_CONSTANTS.WALLETS",
            animation: 'slide_from_left'
          }
        }]
      });
    }
  };
  const handleContinue = async () => {
    setApiLoading(true);
    const securityVerififcationData: any = await getVerificationData();
    if (securityVerififcationData?.ok) {
      setApiLoading(false);
      if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
        const item = props.route.params?.selectedVault;
        const kycState = item?.kycState;
        if (!kycState) {
          navigation.navigate('WalletsBankCreation', {
            selectedVault: props.route.params?.selectedVault,
            screenName: "NoBankAccount",
            originalScreenName: props.route.params?.screenName,
            originalParams: props.route.params
          });
          return;
        }
        const notApproved = kycState && typeof kycState === 'string' && kycState.toLowerCase() !== 'approved';
        if (notApproved) {
          handleProceed(item);
          return;
        }
        else {
          const hasAccountCreationFee = item?.accountCreationFee;
          const feeAmount = parseFloat(String(hasAccountCreationFee));
          if (hasAccountCreationFee && feeAmount > 0) {
            navigation.navigate('payWithWalletTabs', {
              selectedBank: item,
              selectedCurrency: item,
              productId: item?.productId
            });
            return;
          } else {
            handleFeeZeroApiCall(item);
          }
        }
      } else {
        setEnableProtectionModel(true)
      }
    } else {
      setApiLoading(false);
      setEnableProtectionModel(true)

    }
  }
  const handleProceed = async (firstBank: any) => {
    setApiLoading(true);
    try {
      if (firstBank?.productId) {
        const detailsRes = await ProfileService.kycInfoDetails(firstBank.productId);

        if (detailsRes?.ok && detailsRes.data?.kyc?.provider?.toLowerCase() === "sumsub") {
          const requirement = detailsRes.data?.kyc?.requirement;
          setApiLoading(false);
          navigation.navigate('BankKYCScreen', {
            requirement,
            selectedBank: firstBank,
            selectedCurrency: firstBank?.code,
            onSuccess: () => {
              successSheetRef.current?.open();
            },
            onError: (error: string) => {
              setErrormsg(error);
            },
            animation: 'slide_from_right'
          });
          return;
        } else {
          proceedToNextScreen(firstBank);
          setApiLoading(false);
        }
      } else {
        setApiLoading(false);
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
      setApiLoading(false);
    }

  };
  const proceedToNextScreen = async (firstBank: any) => {

    const isSelectedCurrencyRejected = firstBank?.accountStatus?.toLowerCase() === 'rejected';

    const hasAccountCreationFee = firstBank?.accountCreationFee;
    dispatch({ type: 'SET_SELECTED_BANK', payload: firstBank });
    dispatch({ type: 'SET_IS_REAPPLY', payload: isSelectedCurrencyRejected });
    dispatch({ type: 'SET_HAS_ACCOUNT_CREATION_FEE', payload: hasAccountCreationFee });
    dispatch({ type: 'SET_IDENTITY_DOCUMENTS', payload: [] });
    dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: [] });
    dispatch({ type: 'SET_UBO_FORM_DATA', payload: [] });
    dispatch({ type: 'SET_DIRECTOR_FORM_DATA', payload: [] });
    dispatch({ type: 'SET_DOCUMENTS_DATA', payload: null });
    dispatch({ type: 'SET_PERSONAL_DOB', payload: null });
    dispatch({ type: 'SET_IP_ADDRESS', payload: '' });
    dispatch({ type: 'SET_SECTORS', payload: '' });
    dispatch({ type: 'SET_TYPES', payload: '' });
    if (firstBank?.productId) {
      navigation.navigate(userInfo?.accountType?.toLowerCase() === "business" ? "WalletsBankKybReview" : "WalletsKycPreview", {
        productId: firstBank.productId,
        ...props?.route?.params,
        animation: 'slide_from_right'
      });
    }
  };
  const handleFeeZeroApiCall = async (firstBank: any) => {

    try {
      setApiLoading(true);

      const payload = {
        walletId: null,
        amount: 0,
        metadata: null,
        documents: [],
        address: [],
        ubo: [],
        director: [],
        isReapply: false,
        sector: null,
        type: null,
        dob: null
      };
      const response = await CreateAccountService.summaryAccountCreation(
        firstBank.productId,
        payload
      );

      setApiLoading(false);

      if (response?.ok) {
        setTimeout(() => {
          if (successSheetRef.current && typeof successSheetRef.current.open === 'function') {
            successSheetRef.current.open();
          }
        }, 100);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (err) {
      setApiLoading(false);
      setErrormsg(isErrorDispaly(err));
    }
  };
  const handleLink = () => {
    navigation.navigate('Security');
    setErrormsg("");
    setErrormsgLink("");
  };
  const closeEnableProtectionModel = () => {
    setEnableProtectionModel(false)
  }
  return (

    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader
          title={"GLOBAL_CONSTANTS.BANK_CREATE_ACCOUNT"}
          onBackPress={apiLoading ? undefined : handleBack}

        />
        {errormsg !== "" && (
          <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} handleLink={errormsgLink ? handleLink : undefined}>
            {errormsgLink || ""}
          </ErrorComponent>
        )}
        <ViewComponent style={[commonStyles.myAuto]}>
          <ViewComponent style={[commonStyles.mxAuto, commonStyles.sectionGap]}>
            <ViewComponent >
              <BankImage width={s(150)} height={s(150)} />
            </ViewComponent>

          </ViewComponent>
          <TextMultiLanguage style={[commonStyles.secondarytext, commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.CREATE_BANK_DESICREPTION"} />

        </ViewComponent>
        <ViewComponent style={[commonStyles.dflex]} />
        <ButtonComponent title="GLOBAL_CONSTANTS.CONTINUE" onPress={handleContinue} loading={apiLoading} />
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ViewComponent style={[commonStyles.sectionGap]}>
          {enableProtectionModel && <EnableProtectionModel
            navigation={navigation}
            closeModel={closeEnableProtectionModel}
            addModelVisible={enableProtectionModel}
          />}
        </ViewComponent>

        <SuccessBottomSheet
          sheetRef={successSheetRef}
          navigation={navigation}
        />
      </Container>

    </ViewComponent>
  )
}
export default CreateAccountInformation;