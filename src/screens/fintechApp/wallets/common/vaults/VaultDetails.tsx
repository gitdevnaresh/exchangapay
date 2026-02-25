import React, { useCallback, useEffect, useState } from 'react';
import Container from "../../../../../components/container/container";
import { s } from '../../../../../constants/styels/scale';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import SvgFromUrl from '../../../../../components/svgIcon';
import RecentTransactions from '../../../../commonScreens/transactions/recentTransactions';
import { useSelector } from 'react-redux';
import { getTabsConfigation } from '../../../../../../configuration';
import { useHardwareBackHandler } from '../../../../../hooks/backHandleHook';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import TextMultiLangauge from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ActionButton from '../../../../../components/gradianttext/gradiantbg';
import DeposistIcon from '../../../../../components/svgIcons/mainmenuicons/dashboarddeposist';
import WithdrawIcon from '../../../../../components/svgIcons/mainmenuicons/dashboardwithdraw';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import KycVerifyPopup from '../../../../commonScreens/kycVerify';
import { getVerificationData } from '../../../../../apiServices/common/countryService';
import EnableProtectionModel from '../../../../commonScreens/protection';

const VaultDetails = React.memo((props: any) => {
  const [errormsg, setErrormsg] = useState<string>("");
  const [errormsgLink, setErrormsgLink] = useState<string>("");
  const [kycModelVisible, setKycModelVisible] = useState(false);
  const [withdrawLoader, setWithdrawLoader] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const crypto = getTabsConfigation('CRYPTO');
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)
  const commonConfiguartion = getTabsConfigation("COMMON_CONFIGURATION");
  const { t } = useLngTranslation();
  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  })

  const backArrowButtonHandler = useCallback(() => {
    props.navigation.goBack()
  }, []);
  const handleCloseError = useCallback(() => {
    setErrormsg("")
  }, []);
  const closekycModel = () => {
    setKycModelVisible(false);
  };

  const handleLink = () => {
    props.navigation.navigate('Security');
    setErrormsg("");
    setErrormsgLink("");
  };

  const handleNavigateDeposit = () => {
    props.navigation.navigate("CryptoDeposit", {
      vault: props?.route?.params?.merchantName,
      propsData: props?.route?.params,
    })
  };
  const totalCryptoValue = props?.route?.params?.coinBalance ?? "0.00";
  const handleNavigateWithdraw = async () => {
    setErrormsg('');
    setErrormsgLink('');

    if ((commonConfiguartion?.IS_SKIP_KYC_VERIFICATION_STEP !== true) && (userInfo?.kycStatus !== "Approved" && (userInfo?.metadata?.IsInitialKycRequired == false && userInfo?.metadata?.IsInitialVaultRequired == true))) {
      setKycModelVisible(true);
    } else {
      setWithdrawLoader(true);
      const securityVerififcationData: any = await getVerificationData();
      if (securityVerififcationData?.ok) {
        setWithdrawLoader(false);
        if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
          props.navigation.navigate("CrptoWithdraw", {
            isFrom: "Vaults",
            propsData: props?.route?.params,
          })
        } else {
          setEnableProtectionModel(true)
        }
      } else {
        setWithdrawLoader(false);
        setEnableProtectionModel(true)

      }
    }
  };

  const handleRecentTranscationReloadDetails = (reload?: boolean, error?: string | null) => {
    if (error) {
      setErrormsg(error);
    }
  };
  const closeEnableProtectionModel = () => {
    setEnableProtectionModel(false)
  }

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.container]}>
        <PageHeader title={props?.route?.params?.coinName || ""} onBackPress={backArrowButtonHandler} />
        <ScrollViewComponent>
          {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} handleLink={errormsgLink ? handleLink : undefined}>{errormsgLink || ""}</ErrorComponent>}
          {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
          <ViewComponent>
            {enableProtectionModel && <EnableProtectionModel
              navigation={props.navigation}
              closeModel={closeEnableProtectionModel}
              addModelVisible={enableProtectionModel}
            />}
          </ViewComponent>

          <ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]}>
              <SvgFromUrl uri={props?.route?.params?.logo} width={s(36)} height={s(36)} />
              <ViewComponent>
                <ViewComponent>
                  <TextMultiLangauge text={"GLOBAL_CONSTANTS.AVAIL_BALANCE"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGreyAc, commonStyles.textCenter]} />
                </ViewComponent>
                <CurrencyText value={totalCryptoValue || 0} currency={props.route.params.cryptoCoin} decimalPlaces={4} style={[commonStyles.fw600, commonStyles.textWhite, commonStyles.mb4, commonStyles.textCenter, commonStyles.fs32]} />
              </ViewComponent>
            </ViewComponent>
            <ViewComponent >
              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10]}>
                {crypto?.QUCIKLINKS?.Deposit &&
                  <ViewComponent style={[commonStyles.flex1]}>
                    <CommonTouchableOpacity>
                      <ActionButton
                        text={"GLOBAL_CONSTANTS.DEPOSIT"}
                        useGradient
                        onPress={handleNavigateDeposit}
                        customIcon={<DeposistIcon />}
                      />
                    </CommonTouchableOpacity>
                  </ViewComponent>
                }
                {crypto?.QUCIKLINKS?.Withdraw &&
                  <ViewComponent style={[commonStyles.flex1]}>
                    <CommonTouchableOpacity>
                      <ActionButton
                        text={"GLOBAL_CONSTANTS.WITHDRAW"}
                        onPress={handleNavigateWithdraw}
                        customTextColor={NEW_COLOR.BUTTON_TEXT}
                        customIcon={<WithdrawIcon />}
                        loading={withdrawLoader}
                        disable={withdrawLoader}
                      />

                    </CommonTouchableOpacity>

                  </ViewComponent>
                }

              </ViewComponent>
            </ViewComponent>
          </ViewComponent>

          <ViewComponent style={[commonStyles.sectionGap]} />
          <RecentTransactions accountType={"selectCurrenyDetail"} currency={props?.route?.params?.cryptoCoin} handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails} />
          <ViewComponent style={[commonStyles.sectionGap]} />
        </ScrollViewComponent>
      </Container>

    </ViewComponent>

  )
})

export default VaultDetails;
