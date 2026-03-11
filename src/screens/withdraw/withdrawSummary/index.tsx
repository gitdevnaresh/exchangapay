import React, { useCallback, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import ViewComponent from "../../../newComponents/view/view";
import ButtonComponent from "../../../newComponents/buttons/button";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { s } from "../../../newComponents/theme/scale";
import { MaterialIcons } from "@expo/vector-icons";
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";
import Clipboard from "@react-native-clipboard/clipboard";
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook";
import { Alert } from "react-native";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useSelector } from "react-redux";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import { WithDrawServices } from "../../../apiServices/withdrawApis/withdrawServices";
import { isErrorDispaly } from "../../../utils/helpers";
import { showAppToast } from "../../../newComponents/ToasterMessages/ShowMessage";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import CopyCard from "../../../newComponents/copyComponent/CopyCard";
import AuthVerification from "../../commonScreens/authentication";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";

const WithdrawSummary = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { logEvent } = useActionLogging();
  const { t } = useLngTranslation();
  const { decryptAES, encryptAES } = useEncryptDecrypt();
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const { summary, amount, selectedPayee, selectedNetwork, coinCode } = route.params;
  const userName = decryptAES(userInfo?.userName);
  const [loading, setLoading] = useState<boolean>(false);
  const [withdrawDetails, setWithdrawDetails] = useState<any | undefined>(undefined);
  const [authOpen, setAuthOpen] = useState(false);
  const handleBackpress = () => {
    const actionData: ActionLogParams = {
      screename: 'WithdrawSummary',
      actionName: 'Back',
      actionType: 'Button',
      nextScreenName: "enterAmount"
    }
    logEvent('back_button', actionData);
    navigation.goBack();
  }
  useHardwareBackHandler(()=>{
    handleBackpress()
  })
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      Clipboard?.setString(text);
      const actionData: ActionLogParams = {
        screename: 'DepositView',
        actionName: 'Copy Address',
        actionType: 'Copy',
      };
      logEvent('copy_address', actionData);
    } catch (error: any) {
      Alert.alert(`${t("GLOBAL_CONSTANTS.FAILED_TO_COPY_TEXT_TO_CLIPBOARD")}`, error);
    }
  }, []);
  const handleWithdraw = async () => {
    setLoading(true);
    let obj = {
      customerId: userInfo?.id,
      network: selectedNetwork.code,
      walletAddress: selectedPayee?.address || "",
      payeeId: selectedPayee.payeeId || "",
      walletCode: coinCode,
      amount: amount,
      createdby: encryptAES(userName),
      ConcurrencyStamp: summary?.concurrencyStamp || ""
    };
    try {
      const response = await WithDrawServices.Withdrawsave(obj)
      if (response.status === 200) {
        setWithdrawDetails(response?.data)
        navigation.navigate({ name: "WithdrawSuccess", params: { transactionId: response?.data }, merge: true })
        const actionData: ActionLogParams = {
          screename: 'WithdrawSummary',
          actionName: 'Withdraw',
          actionType: 'Button',
          nextScreenName: "success page",
          actionObj: {
            postObj: {
              obj
            }
          }
        }
        logEvent('withdraw_button', actionData);
        setLoading(false)
      }
      else {
        showAppToast(isErrorDispaly(response), "error")
        setLoading(false)
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), "error")
      setLoading(false)
    }
    finally {
      setLoading(false)
    }
  }
  const handleAuthClose = () => {
    setAuthOpen(false);
    setLoading(false);
  }
  const handleAuthSucess = (verifications: any) => {
    setAuthOpen(false);
    handleWithdraw();
  }
  const verifyAuth = (values: { nickName: string }) => {
    setAuthOpen(true);
    setLoading(true);
  }

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container >
        <PageHeader title={"GLOBAL_CONSTANTS.CONFIRM_WITHDRAW"} onBackPress={handleBackpress}
        />
        <ScrollViewComponent>
        {/* Amount */}
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.sectionGap, commonStyles.sectionBg]}>
          <CurrencyText value={amount} style={[commonStyles.fs60, commonStyles.fw700, commonStyles.textWhite]} />
        </ViewComponent>

        <ViewComponent style={[commonStyles.sectionGap]} />
        <ViewComponent style={[commonStyles.sectionGap]} />
        {/* Details */}
        <TextMultiLanguage
          text="GLOBAL_CONSTANTS.DETAILS"
          style={[commonStyles.fs14_24, commonStyles.fw700, commonStyles.textWhite, commonStyles.mb16]}
        />
        {/* Address */}
        <ViewComponent style={[commonStyles.rounded12, commonStyles.applycardbg, commonStyles.py8, commonStyles.px10, commonStyles.gap8, commonStyles.mb10]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
            <TextMultiLanguage text="GLOBAL_CONSTANTS.ADDRESS" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
            <CopyCard onPress={() => copyToClipboard(selectedPayee?.address)} size={s(24)} />
          </ViewComponent>
          <ParagraphComponent text={selectedPayee?.label} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} numberOfLines={1} />
          <ParagraphComponent text={selectedPayee?.address} style={[commonStyles.fs14, commonStyles.fw400]} numberOfLines={1} />
        </ViewComponent>
        {/* Network */}
        <ViewComponent style={[commonStyles.rounded8, commonStyles.applycardbg, commonStyles.py12, commonStyles.px8, commonStyles.gap8, commonStyles.mb10]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.WITHDRAAL_NETWORK"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} numberOfLines={1} />
            <ParagraphComponent text={`${coinCode}(${selectedNetwork?.name})`} style={[commonStyles.fs14, commonStyles.fw400]} numberOfLines={1} />
          </ViewComponent>
        </ViewComponent>
        {/* Fee */}
        <ViewComponent style={[commonStyles.rounded8, commonStyles.applycardbg, commonStyles.py12, commonStyles.px8, commonStyles.gap8, commonStyles.mb16]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.WITHDRAW_FEE"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} numberOfLines={1} />
            <ParagraphComponent text={`${summary.fee} ${coinCode}`} style={[commonStyles.fs14, commonStyles.fw400]} numberOfLines={1} />
          </ViewComponent>
        </ViewComponent>
        {/* Warning */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.sectionGap, commonStyles.mt8, commonStyles.gap12, commonStyles.p8]}>
          <MaterialIcons name="info-outline" size={s(24)} color={NEW_COLOR.BG_YELLOW} />
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.WITHDRAW_WARNING"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
        </ViewComponent>
        {/* Confirm Button */}
        <ViewComponent style={[commonStyles.mt70]}/>
        <ButtonComponent
          onPress={verifyAuth}
          title="GLOBAL_CONSTANTS.CONFIRM"
          loading={loading}
          disable={loading}
        />
        
        </ScrollViewComponent>
      </Container>
      {authOpen && <AuthVerification onClose={handleAuthClose} onSuccess={handleAuthSucess} feature={'Withdraw'} />}
    </ViewComponent>
  );
};

export default WithdrawSummary;