import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BackHandler } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import TransactionService from '../../../../apiServices/common/transaction';
import { isErrorDispaly } from '../../../../utils/helpers';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import Container from '../../../../components/container/container';
import ErrorComponent from '../../../../components/errorDisplay/errorDisplay';
import RecentTransactions from '../../../commonScreens/transactions/recentTransactions';
import KycVerifyPopup from '../../../commonScreens/kycVerify';
import { getTabsConfigation, isDecimalSmall } from '../../../../../configuration';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import ViewComponent from '../../../../components/view/view';
import WithdrawIcon from '../../../../components/svgIcons/mainmenuicons/dashboardwithdraw';
import ActionButton from '../../../../components/gradianttext/gradiantbg';
import DeposistIcon from '../../../../components/svgIcons/mainmenuicons/dashboarddeposist';
import PageHeader from '../../../../components/pageHeader/pageHeader';
import { CurrencyText } from '../../../../components/textComponets/currencyText/currencyText';
import { useLngTranslation } from '../../../../hooks/languagesHook/useLngTranslation';
import CreateAccountService from '../../../../apiServices/bank/createAccount';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import DashboardLoader from '../../../../components/loader';
import SafeAreaViewComponent from '../../../../components/safeArea/safeArea';
import { bankService } from '../../../../apiServices/common/transfer';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import LabelComponent from '../../../../components/textComponets/lableComponent/lable';
import { ACCOUNTDASH_CONSTANTS } from '../constants';
import { SubmittedState } from '../Deposit';
import { Logger } from '../../../../utils/Logger';


const Currencypop = React.memo((props: any) => {
  const isFocused = useIsFocused();
  const [errormsg, setErrormsg] = useState("");
  const [errormsgLink, setErrormsgLink] = useState("");
  const customerId = useSelector((state: any) => state.userReducer?.userDetails?.id);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

  const bankActions = getTabsConfigation(ACCOUNTDASH_CONSTANTS.BANKS);
  const [kycModelVisible, setKycModelVisible] = useState<boolean>(false);
  const navigation = useNavigation();
  const [transferDetails, setTransferDetails] = useState<any>({});
  const [bankServiceDetails, setBankServiceDetails] = useState<any>({});
  const [bankDetailsLoader, setBankDetailsLoader] = useState(true)
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [recentTransactionsData, setRecentTransactionsData] = useState<any[]>([]);
  const dispatch = useDispatch();
  const [isLoading] = useState<boolean>(false);
  const currencySymbole = getTabsConfigation("CURRENCY");
  const { t } = useLngTranslation();
  const { decryptAES } = useEncryptDecrypt();
  // Add theme hooks
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

  const backArrowButtonHandler = () => {
    try {
      if (props.route.params?.screenName === "Accounts") {
        const parentScreen = props.route.params?.parentScreen || "bankDashboard";
        (navigation as any).navigate("Accounts", { animation: "slide_from_left", screenName: parentScreen });
        return
      }
      if (props.route.params?.screenName === "frombankDashboard") {
        (navigation as any).navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.BANK", animation: "slide_from_left" });
        return
      }
      if (props.route.params?.screenName === "Dashboard") {
        (navigation as any).navigate("Dashboard", { animation: 'slide_from_left', initialTab: "GLOBAL_CONSTANTS.HOME" });
        return
      }
      else {
        (navigation as any).navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.BANK", animation: "slide_from_left" });
      }
    } catch (error) {
      Logger.error('backArrowButtonHandler failed', { error, screenName: props.route.params?.screenName });
    }
  };

  useEffect(() => {
    try {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (isFocused) {
            backArrowButtonHandler();
            return true;
          }
          return false;
        }
      );
      return () => backHandler.remove();
    } catch (error) {
      Logger.error('BackHandler useEffect failed', { error });
    }
  }, [isFocused, backArrowButtonHandler]);
  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        await getBankInfo();
      } catch (error) {
        Logger.error('getBankInfo useEffect failed', { error });
      }
    };
    fetchBankInfo();
  }, [isFocused, props?.route?.params?.walletCode, props?.route?.params?.screenName]);

  const getBankInfo = async () => {
    setBankDetailsLoader(true);
    setAllDataLoaded(false);
    try {
      const [bankResponse, bankServiceResponse] = await Promise.all([
        CreateAccountService.bankKpis(),
        bankService.getBanks(props?.route?.params?.walletCode)
      ]);

      let matchedAccount = null;
      if (bankResponse?.ok && Array.isArray(bankResponse?.data)) {
        matchedAccount = bankResponse.data.find((account: any) =>
          account.name === props?.route?.params?.name
        );

        if (matchedAccount) {
          setTransferDetails(matchedAccount);
        }
      } else {
        setErrormsg(isErrorDispaly(bankResponse));
      }

      if (bankServiceResponse?.ok) {
        const banksList = (bankServiceResponse?.data as any)?.bankList || [];
        if (banksList.length > 0) {
          setBankServiceDetails(banksList[0]);
        }
      } else {
        setErrormsg(isErrorDispaly(bankServiceResponse));
      }

      // Now fetch transactions with the currency from matchedAccount
      if (matchedAccount?.currency) {
        const transactionsResponse = await TransactionService.getNonCustodianTransactions(
          "SelectedBankTransactions", 
          matchedAccount.currency, 
          null, 
          props?.route?.params?.selectedId
        );
        
        if (transactionsResponse?.ok) {
          const data = Array.isArray(transactionsResponse?.data) ? transactionsResponse.data : Array.isArray(transactionsResponse?.data?.data) ? transactionsResponse.data.data : [];
          setRecentTransactionsData(data);
        } else {
          setErrormsg(isErrorDispaly(transactionsResponse));
        }
      }

      setBankDetailsLoader(false);
      setAllDataLoaded(true);
    }
    catch (error: any) {
      Logger.error('getBankInfo failed', { error, walletCode: props?.route?.params?.walletCode });
      setBankDetailsLoader(false);
      setAllDataLoaded(true);
      setErrormsg(isErrorDispaly(error));
    }
  }
  const isSubmittedState = bankServiceDetails?.accountStatus?.toLowerCase() === 'submitted' || bankServiceDetails?.accountStatus?.toLowerCase() === 'rejected';

  const passInDataToSend = useCallback(() => {
    try {
      setErrormsg("");
      setErrormsgLink("")
      if (userInfo?.kycStatus == null || userInfo?.kycStatus == "Draft" || userInfo?.kycStatus == "Submitted") {
        setKycModelVisible(!kycModelVisible);
      }
      else {
        (navigation as any).navigate("SendAmount", {
          walletCode: transferDetails?.currency,
          name: transferDetails?.name,
          selectedId: props?.route?.params?.selectedId,
          screenName: props?.route?.params?.screenName === "frombankDashboard" ? "frombankDashboard" : "AccountDetail"
        })
      }
    } catch (error) {
      Logger.error('passInDataToSend failed', { error, kycStatus: userInfo?.kycStatus });
      setErrormsg(isErrorDispaly(error));
    }
  }, [userInfo?.kycStatus, kycModelVisible, navigation, transferDetails?.currency, transferDetails?.name, props?.route?.params?.selectedId, props?.route?.params?.screenName]);
  const handleRecieveChanges = useCallback(() => {
    try {
      (navigation as any).navigate("Bank", {
        accountId: transferDetails?.id,
        customerId: customerId,
        currency: transferDetails?.currency,
        logo: transferDetails?.image,
        avialableBal: transferDetails?.amount,
        name: transferDetails?.name,
        selectedId: props?.route?.params?.selectedId,
        screenName: "AccountDetail"
      })
    } catch (error) {
      Logger.error('handleRecieveChanges failed', { error, accountId: transferDetails?.id });
      setErrormsg(isErrorDispaly(error));
    }
  }, [navigation, transferDetails?.id, customerId, transferDetails?.currency, transferDetails?.image, transferDetails?.amount, transferDetails?.name, props?.route?.params?.selectedId]);


  const handleErrorComonent = useCallback(() => {
    setErrormsg("")
  }, []);
  const handleLink = useCallback(() => {
    try {
      (navigation as any).navigate("Security");
    } catch (error) {
      Logger.error('handleLink failed', { error });
    }
  }, [navigation]);
  const closekycModel = useCallback(() => {
    setKycModelVisible(!kycModelVisible)
  }, [kycModelVisible]);

  const handleReapply = useCallback(() => {
    try {
      dispatch({ type: 'SET_IS_REAPPLY', payload: true });
      (navigation as any).navigate('createAccountForm');
    } catch (error) {
      Logger.error('handleReapply failed', { error });
      setErrormsg(isErrorDispaly(error));
    }
  }, [navigation, dispatch]);
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {!allDataLoaded ? (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaViewComponent>
      ) : (
        <Container style={commonStyles.container}>
          <PageHeader title={props?.route?.params?.name || ""} onBackPress={backArrowButtonHandler} />
          {isSubmittedState && <SubmittedState
            onRefresh={bankServiceDetails?.accountStatus?.toLowerCase() === 'rejected' ? handleReapply : getBankInfo}
            loading={bankDetailsLoader}
            accountStatus={bankServiceDetails?.accountStatus}
            remarks={bankServiceDetails?.remarks}
          />}
          {!isSubmittedState && <ScrollViewComponent>
            {<ViewComponent>
              {errormsg != "" && <ErrorComponent message={errormsg} onClose={handleErrorComonent} handleLink={handleLink}>{errormsgLink || ""}</ErrorComponent>}
              <ViewComponent >

                {<ViewComponent>
                  <LabelComponent text='GLOBAL_CONSTANTS.TOTAL_VALUE' style={[commonStyles.transactionamounttextlabel]} />
                  <CurrencyText
                    value={transferDetails?.amount || 0}
                    prifix={currencySymbole[transferDetails?.currency]}
                    style={[commonStyles.transactionamounttext]}
                    smallDecimal={isDecimalSmall}
                  />

                  {transferDetails?.accountNumber && <> <LabelComponent text='GLOBAL_CONSTANTS.A/C' style={[commonStyles.textCenter, commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500, commonStyles.mt8]} />
                    <ParagraphComponent
                      text={decryptAES(transferDetails?.accountNumber) || ''}
                      style={[commonStyles.textCenter, commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500]}
                      numberOfLines={2}
                    /></>}
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyCenter,]}>
                  </ViewComponent>
                </ViewComponent>}
                <ViewComponent style={[commonStyles.sectionGap]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap10]}>
                  {bankActions?.QUICK_LINKS?.Diposit && <ViewComponent style={[commonStyles.flex1]}>
                    {
                      <ViewComponent style={[commonStyles.flex1]}>
                        <CommonTouchableOpacity>
                          <ActionButton
                            text="GLOBAL_CONSTANTS.DEPOSITE"
                            onPress={handleRecieveChanges}
                            useGradient={true}
                            customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                            customIcon={<DeposistIcon />}
                          />

                        </CommonTouchableOpacity>

                      </ViewComponent>
                    }
                  </ViewComponent>
                  }
                  <ViewComponent style={[commonStyles.flex1]} >
                    <CommonTouchableOpacity>
                      <ActionButton
                        text="GLOBAL_CONSTANTS.WITHDRAW"
                        onPress={passInDataToSend}
                        customTextColor={NEW_COLOR.BUTTON_TEXT}
                        customIcon={<WithdrawIcon />}
                      />

                    </CommonTouchableOpacity>

                  </ViewComponent>

                </ViewComponent>
              </ViewComponent>

              <ViewComponent style={[commonStyles.sectionGap]} />
              <RecentTransactions accountType={"SelectedBankTransactions"} currency={props?.route?.params?.name}  id={props?.route?.params?.selectedId} initialData={recentTransactionsData} handleRecentTranscationReloadDetails={() => { }} dashboardLoading={!allDataLoaded} />
            </ViewComponent>}
            {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} />}

          </ScrollViewComponent>}
        </Container>
      )}
    </ViewComponent >
  );
});

export default Currencypop;



