import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import Container from '../../../../../components/container/container';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import { getTabsConfigation, isDecimalSmall } from '../../../../../../configuration';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import ViewComponent from '../../../../../components/view/view';
import WithdrawIcon from '../../../../../components/svgIcons/mainmenuicons/dashboardwithdraw';
import ActionButton from '../../../../../components/gradianttext/gradiantbg';
import DeposistIcon from '../../../../../components/svgIcons/mainmenuicons/dashboarddeposist';
import RecentTransactions from '../../../../commonScreens/transactions/recentTransactions';
import { FiatAsset } from '../vaults/interface';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { useSelector } from 'react-redux';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import KycVerifyPopup from '../../../../commonScreens/kycVerify';
import DashboardLoader from '../../../../../components/loader';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import EnableProtectionModel from '../../../../commonScreens/protection';

interface FiatCoinDetailsProps {
  route: {
    params: FiatAsset & {
      screenName?: string;
    };
  };
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  depositNavigation?: () => void;
  withdrawNavigation?: () => void;
  backArrowButtonHandler?: () => void;
  errormsg?: string;
  errormsgLink?: string;
  kycModelVisible?: boolean;
  closeKycModel?: () => void;
  handleErrorClose?: () => void;
  handleLink?: () => void;
  enableProtectionModel?: boolean;
  closeEnableProtectionModel?: () => void;
}

const FiatCoinDetails = React.memo((props: FiatCoinDetailsProps) => {
  const isFocused = useIsFocused();
  const [errormsg, setErrormsg] = useState<string>("");
  const [errormsgLink, setErrormsgLink] = useState<string>("");
  const [kycModelVisible, setKycModelVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const currencySymbole = getTabsConfigation("CURRENCY");
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const { t } = useLngTranslation();
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)

  const coinData = props.route.params?.data ? props.route.params.data : props.route.params;
  const backArrowButtonHandler = useCallback((): void => {
    props.navigation.goBack();
  }, [props.navigation]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { (backArrowButtonHandler)(); return true; }
    );
    return () => backHandler.remove();
  }, [isFocused]);
  const handleErrorComponent = useCallback((): void => {
    if (props.handleErrorClose) {
      props.handleErrorClose();
    }
    setErrormsg("");
  }, [props.handleErrorClose]);

  const closekycModel = () => {
    if (props.closeKycModel) {
      props.closeKycModel();
    }
    setKycModelVisible(false);
  };

  const handleLink = () => {
    if (props.handleLink) {
      props.handleLink();
    } else {
      props.navigation.navigate('Security');
      setErrormsg("");
      setErrormsgLink("");
    }
  };

  const closeEnableProtectionModel = () => {
    if (props.closeEnableProtectionModel) {
      props.closeEnableProtectionModel();
    }
    setEnableProtectionModel(false);
  };


  const handleRecentTranscationReloadDetails = (reload?: boolean, error?: string | null) => {
    if (error) {
      setErrormsg(error);
    }
  };

  const displayErrorMsg = props.errormsg || errormsg;
  const displayErrorLink = props.errormsg ? props.errormsgLink : errormsgLink;
  const displayKycVisible = props.kycModelVisible || kycModelVisible;

  if (loading) {
    return (
      <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaViewComponent>
      </ViewComponent>
    );
  }

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader title={coinData?.code || "Wallets"} onBackPress={backArrowButtonHandler} />
        <ScrollViewComponent>
          <ViewComponent >
            {displayErrorMsg != "" && (
              <ErrorComponent
                message={displayErrorMsg}
                onClose={handleErrorComponent}
                handleLink={displayErrorLink ? handleLink : undefined}
              >
                {displayErrorLink || ""}
              </ErrorComponent>
            )}
            {displayKycVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={displayKycVisible} />}
            <ViewComponent>
              {props?.enableProtectionModel && <EnableProtectionModel
                navigation={props.navigation}
                updateState={(state: any) => {
                  setErrormsg(state.errormsg || "");
                  setErrormsgLink(state.errormsgLink || "");
                }}
                closeModel={closeEnableProtectionModel}
                addModelVisible={props?.enableProtectionModel}
              />}
            </ViewComponent>

            <ViewComponent>
              <TextMultiLanguage
                text='GLOBAL_CONSTANTS.TOTAL_VALUE'
                style={[
                  commonStyles.transactionamounttextlabel
                ]}
              />
              <ViewComponent style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.gap10,
                commonStyles.justifyCenter
              ]}>
                <CurrencyText
                  value={coinData?.amount || 0}
                  prifix={currencySymbole[coinData?.code] || ""}
                  style={[
                    commonStyles.transactionamounttext
                  ]}
                  smallDecimal={isDecimalSmall}
                />
              </ViewComponent>
            </ViewComponent>

            <ViewComponent style={[commonStyles.sectionGap]} />

            <ViewComponent style={[
              commonStyles.dflex,
              commonStyles.alignStart,
              commonStyles.justifyContent,
              commonStyles.gap10
            ]}>
              {(
                <ViewComponent style={[commonStyles.flex1]}>
                  <CommonTouchableOpacity>
                    <ActionButton
                      text="GLOBAL_CONSTANTS.DEPOSIT"
                      onPress={props.depositNavigation}
                      useGradient={true}
                      customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                      customIcon={<DeposistIcon />}
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>
              )}

              {coinData?.code !== "BRL" && <ViewComponent style={[commonStyles.flex1]}>
                <CommonTouchableOpacity>
                  <ActionButton
                    text="GLOBAL_CONSTANTS.WITHDRAW"
                    onPress={props?.withdrawNavigation}
                    customTextColor={NEW_COLOR.BUTTON_TEXT}
                    customIcon={<WithdrawIcon />}
                  />
                </CommonTouchableOpacity>
              </ViewComponent>}
            </ViewComponent>
          </ViewComponent>

          <ViewComponent style={[commonStyles.sectionGap]} />
          <RecentTransactions
            accountType={"selectCurrenyDetail"}
            currency={coinData?.code}
            handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails}
          />
        </ScrollViewComponent>
      </Container>
    </ViewComponent>
  );
});

export default FiatCoinDetails;
