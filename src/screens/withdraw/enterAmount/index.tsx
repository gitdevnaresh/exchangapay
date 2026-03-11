import React, { useEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { s } from "../../../newComponents/theme/scale";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import ViewComponent from "../../../newComponents/view/view";
import AmountInput from "../../../newComponents/numericInputs/amountInput";
import ButtonComponent from "../../../newComponents/buttons/button";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import PopupOrSheet, {
  PopupOrSheetRef,
} from "../../../newComponents/models/PopupOrSheet";
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook";
import { isErrorDispaly } from "../../../utils/helpers";
import { WithDrawServices } from "../../../apiServices/withdrawApis/withdrawServices";
import FlatListComponent from "../../../newComponents/flatList/flatList";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { ActivityIndicator, Keyboard } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Network, Payee } from "../interfaces/interface";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import NoDataComponent from "../../../newComponents/noData/noData";
import ImageUri from "../../../newComponents/imageComponents/image";
import { transactionCard } from "../../Dashboard/skeltons";
import Loadding from "../../commonScreens/skeltons";
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";
import ConfirmWithdrawContent from "./components/ConfirmWithdrawContent";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";

const AmountEnterScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const { t } = useLngTranslation();
  const { selectedNetwork, coinCode, payeeData, payeeList, coinData } =
    route.params as {
      selectedNetwork: Network;
      coinCode: string;
      payeeData?: Payee;
      payeeList?: string;
      coinData: any;
    };
  const [currentNetwork, setCurrentNetwork] = useState(selectedNetwork);
  const [amount, setAmount] = useState("");
  const [selectedPayee, setSelectedPayee] = useState<{
    label: string;
    address: string;
    payeeId: string;
  } | null>(null);
  const { logEvent } = useActionLogging();
  const networkSheetRef = useRef<PopupOrSheetRef>(null);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loadingNetworks, setLoadingNetworks] = useState(false);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [loadingPayees, setLoadingPayees] = useState(false);
  const [continueLoading, setContinueLoading] = useState(false);
  const [loadingPayeeId, setLoadingPayeeId] = useState("");
  const transactionCardContent = transactionCard(3);
  const confirmWithdrawref = useRef<any>(null);
  const [feeDetails, setFeeDetails] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { decryptAES } = useEncryptDecrypt();
  const [error, setError] = useState<string>("");
  useHardwareBackHandler(() => {
    onBackPress();
    return true; // Prevents default back button behavior
  });

  useEffect(() => {
    if (payeeList === "payeeList" && payeeData) {
      setSelectedPayee({
        label: payeeData.favoriteName,
        address: payeeData.walletAddress,
        payeeId: payeeData.id,
      });
    }
    fetchPayees();
  }, []);
  useEffect(() => {
    if (currentNetwork) {
      fetchPayees();
    }
  }, [currentNetwork]);
  // Fetches available networks for the currency.
  const fetchNetworks = async () => {
    setLoadingNetworks(true);
    setError("");
    try {
      const response: any = await WithDrawServices?.getWalletNetwork(coinCode);
      if (response.status === 200) {
        setNetworks(response.data);
      } else {
        setNetworks([]);
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setLoadingNetworks(false);
    }
  };
  const fetchPayees = async () => {
    setLoadingPayees(true);
    setPayees([]);
    try {
      const response: any = await WithDrawServices.payeesLIst(
        coinCode,
        currentNetwork?.code
      );
      if (response.status === 200) {
        setPayees(response?.data?.data || []);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setLoadingPayees(false);
    }
  };
  const handleCountinuePress = async (payee?: {
    label: string;
    address: string;
    payeeId: string;
  }) => {
    if (!amount || !(payee || selectedPayee)) {
      setError(t("GLOBAL_CONSTANTS.PLEASE_ENTER_AMOUNT_AND_SELECT_A_WALLET_ADDRESS"));
      return;
    }
    const numericAmount = parseAmountValue(amount);
    if (numericAmount > coinData?.avilable) {
      setError(t("GLOBAL_CONSTANTS.THE_ENTERED_AMOUNT_IS_GREATER_THAN_THE_AVAILABLE_BALANCE"));
      return;
    }
    if (numericAmount < currentNetwork.minLimit) {
      setError(
        `${t("GLOBAL_CONSTANTS.MIN_WITHDRAW_AMOUNT_IS")} ${currentNetwork.minLimit}`
      );
      return;
    }
    if (numericAmount > currentNetwork.maxLimit) {
      setError(
        `${t("GLOBAL_CONSTANTS.MAX_WITHDRAW_AMOUNT_IS")} ${currentNetwork.maxLimit}`);
      return;
    }
    setContinueLoading(true);
    try {
      const response: any = await WithDrawServices.withdrawSummary(
        coinData?.id,
        parseAmountValue(amount).toString(),
        currentNetwork?.code
      );
      if (response.status === 200) {
        confirmWithdrawref.current?.open();
        setFeeDetails(response?.data);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setContinueLoading(false);
    }
  };
  const onBackPress = () => {
    const actionData: ActionLogParams = {
      screename: "EnterAmount",
      actionName: "back press",
      actionType: "Button",
      nextScreenName: "withdrawSelectNetwork",
    };
    logEvent("back_press", actionData);
    navigation.navigate({
      name: "WithdrawSelectNetworkBack",
      params: { coinData: coinData },
    });
  };
  const handleAddPayee = () => {
    const actionData: ActionLogParams = {
      screename: "EnterAmount",
      actionName: "Add New Address",
      actionType: "Button",
      nextScreenName: "AddNewAddress",
    };
    logEvent("screen_view", actionData);
    navigation.navigate("AddNewAddress", {
      coinCode: coinCode,
      selectedNetwork: currentNetwork,
      payees: payees,
      networks: networks,
      coinData: coinData,
    });
  };

  const handleAddPayeeFromSheet = () => {
    requestAnimationFrame(() => {
      handleAddPayee();
    });
  };
  const handleOpenNetworkSheet = () => {
    setError(""); 
    Keyboard.dismiss();
    fetchNetworks();
    networkSheetRef.current?.open();
  };
  const renderItem = ({ item }: { item: Network }) => {
    const isSelected =
      currentNetwork &&
      item.code === currentNetwork.code &&
      item.code === currentNetwork.code;
    return (
      <CommonTouchableOpacity
        onPress={() => {
          setCurrentNetwork(item);
          setSelectedPayee(null); // Clear selected payee when network changes
          networkSheetRef.current?.close();
        }}
      >
        <ViewComponent
          style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, isSelected && reversCommonStyles.bgBlack,
          commonStyles.p10, commonStyles.rounded10]} >
          <ViewComponent
            style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
            <ImageUri uri={item?.logo} height={s(24)} width={s(24)} />
          </ViewComponent>
          <ViewComponent style={{ flex: 1 }}>
            <ParagraphComponent
              text={`${item.code}`}
              style={[commonStyles.fs14, commonStyles.fw600, reversCommonStyles.textWhite,
              ]}
            />
          </ViewComponent>
          {isSelected && (
            <ViewComponent
              style={[commonStyles.dflex, commonStyles.alignEnd, commonStyles.justifyend, reversCommonStyles.radioDot,
              ]}
            >
              <MaterialIcons name="check" size={s(16)} color={REVERSE_NEW_COLOR.BgAlwaysBlack} />
            </ViewComponent>
          )}
        </ViewComponent>
        <ViewComponent style={[commonStyles.listGap]} />
      </CommonTouchableOpacity>
    );
  };

  const networksSheet = (
    <ViewComponent style={[commonStyles.flex1]}>
      {loadingNetworks ? (
        <ViewComponent
          style={[reversCommonStyles.alignCenter, reversCommonStyles.justifyCenter, reversCommonStyles.flex1]} >
          <ActivityIndicator
            size="large"
            color={NEW_COLOR.ICON_YELLOW_LOADER}
          />
        </ViewComponent>
      ) : (
        <FlatListComponent
          data={networks}
          isLoading={loadingNetworks}
          renderItem={renderItem}
          keyExtractor={(item) => item?.name.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<NoDataComponent Description={"NO_WHITELIST_ADDRESS_AVAILABLE"} isPopup={true} />}
          contentContainerStyle={
            !networks.length ? { justifyContent: "center" } : {}
          }
        />
      )}
    </ViewComponent>
  );

  // Helper function to remove commas and parse amount
  const parseAmountValue = (amountStr: string): number => {
    return parseFloat(amountStr.replace(/,/g, '')) || 0;
  };

  const handlePayeeSelect = (payee: Payee) => {
    Keyboard.dismiss();
    setLoadingPayeeId(payee.id);
    setSelectedPayee({
      label: payee.favoriteName,
      address: payee.walletAddress,
      payeeId: payee.id,
    });
    handleCountinuePress({
      label: payee.favoriteName,
      address: payee.walletAddress,
      payeeId: payee.id,
    });
  };

  const handleAmountChange = (newAmount: string) => {
    setError("");
    setAmount(newAmount);
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container>
        <PageHeader
          title={`${t("GLOBAL_CONSTANTS.WITHDRAW")} ${coinCode}`}
          onBackPress={onBackPress}
          disable={continueLoading}
        /> 
        {error&&<ErrorComponent message={error} screen={true}/>}
        <KeyboardAwareScrollView
          contentContainerStyle={[{ flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
        >
          <ViewComponent
            style={[
              commonStyles.mxAuto,
              commonStyles.networkDropdown,
              { marginBottom: s(64) },
            ]}
          >
            <CommonTouchableOpacity
              style={[commonStyles.dflex, commonStyles.gap8, commonStyles.py8]}
              activeOpacity={0.8}
              onPress={handleOpenNetworkSheet}
            >
              <ParagraphComponent
                style={[commonStyles.fs12, commonStyles.fw400, commonStyles.list_text]} text={currentNetwork?.code || "N/A"} />
              <MaterialIcons name="keyboard-arrow-down" size={s(20)} color={NEW_COLOR.LIST_TEXT} />
            </CommonTouchableOpacity>
          </ViewComponent>
          {/* Amount Input */}
          <ViewComponent style={{ alignItems: "center", marginBottom: s(64) }}>
            <AmountInput
              value={amount}
              onChangeText={handleAmountChange}
              availableBalance={coinData?.avilable}
              minLimit={currentNetwork?.minLimit}
              maxLimit={currentNetwork?.maxLimit}
              inputStyle={[commonStyles.fw700, {
                fontSize: s(60),

              }]}
            />
          </ViewComponent>
          {/* Available Balance Container */}
          <ViewComponent style={[commonStyles.sectionGap]}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.list]}>

              <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                <ImageUri uri={coinData?.logo} height={s(24)} width={s(24)} />
              </ViewComponent>
              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1]}>
                <TextMultiLanguage
                  text={"GLOBAL_CONSTANTS.AVAIL_BALANCE"}
                  style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
                <ViewComponent>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                    <CurrencyText
                      value={coinData?.avilable || 0}
                      currency={coinCode}
                      symboles={true}
                      style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />

                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>

          {/* Wallet Address Dropdown */}

          <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite, commonStyles.mb5]}
            text={"GLOBAL_CONSTANTS.SELECT_WALLET_ADDRESS"}
          />
          <TextMultiLanguage
            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey, commonStyles.titleSectionGap]}
            text={"GLOBAL_CONSTANTS.ONLY_WHITE_LISTED_ADDRESSES_ARE_ELIGIBLE_FOR_WITHDRAWALS"} />
          {loadingPayees && <Loadding contenthtml={transactionCardContent} />}
          {!loadingPayees && (
            <FlatListComponent
              data={payees}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                return (
                  <CommonTouchableOpacity
                    onPress={() => handlePayeeSelect(item)}
                    disabled={loadingPayeeId === item.id && continueLoading}
                    style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                    <ViewComponent style={{ flex: 1 }}>
                      <ParagraphComponent
                        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.mb4]}
                        text={decryptAES(item?.favoriteName) || ""} numberOfLines={1} />
                      <ParagraphComponent
                        style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey,]}
                        text={item?.walletAddress || ""} numberOfLines={1} />
                    </ViewComponent>
                    <ViewComponent>
                      {loadingPayeeId === item.id && continueLoading && (
                        <ActivityIndicator
                          size="small"
                          color={NEW_COLOR.ICON_YELLOW_LOADER}
                        />
                      )}
                    </ViewComponent>
                  </CommonTouchableOpacity>
                );
              }}
              ListEmptyComponent={<NoDataComponent Description={"NO_WHITELIST_ADDRESS_AVAILABLE"}/>}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              scrollEnabled={false}
            />
          )}

          <ViewComponent
            style={[commonStyles.flex1, commonStyles.sectionGap]}
          />
          <ButtonComponent
            onPress={handleAddPayeeFromSheet}
            title={"GLOBAL_CONSTANTS.ADD_NEW_WALLET_ADDRESS"}
            customTitleStyle={[
              reversCommonStyles.fs16,
              reversCommonStyles.fw700,
            ]}
            solidBackground
          />
          <ViewComponent style={[commonStyles.sectionGap]} />
        </KeyboardAwareScrollView>
      </Container>
      <PopupOrSheet
        ref={networkSheetRef}
        title="GLOBAL_CONSTANTS.SELECT_NETWORK"
        height={s(400)}
      >
        {networksSheet}
      </PopupOrSheet>
      <PopupOrSheet
        showCloseIcon={false}
        ref={confirmWithdrawref}
        height={s(550)}
        closeOnPressMask={!confirmLoading}
        draggable={!confirmLoading}
        showCloseIconAndTittle={false}
      >
        <ConfirmWithdrawContent
          amount={parseAmountValue(amount).toString()}
          coinCode={coinCode}
          selectedPayee={selectedPayee}
          selectedNetwork={currentNetwork}
          feeDetails={feeDetails}
          onClose={() => confirmWithdrawref.current?.close()}
          onLoadingChange={setConfirmLoading}
        />
      </PopupOrSheet>
    </ViewComponent>
  );
};

export default AmountEnterScreen;
