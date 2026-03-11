import React, { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, TouchableOpacity, Modal, Linking, ActivityIndicator } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import QrScanner from "../../../newComponents/scannerComponent/scanner";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import ButtonComponent from "../../../newComponents/buttons/button";
import { AccountDashboardScreenProps } from "../constant";
import ViewComponent from "../../../newComponents/view/view";
import { useThemeColors } from "../../../hooks/useThemeColors";
import ImageUri from "../../../newComponents/imageComponents/image";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import CryptoServices from "../../../services/crypto";
import useMemberLogin from "../../../hooks/userInfoHook";
import { showAppToast } from "../../../newComponents/ToasterMessages/ShowMessage";
import { isErrorDispaly } from "../../../utils/helpers";
import { useNavigation } from "@react-navigation/native";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import { getTabsConfigation } from "../../../../configuration";
import NoDataComponent from "../../../newComponents/noData/noData";
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook";
import KycVerifyPopup from "../../commonScreens/kycVerify";
import ProfileService from "../../../services/profile";
import PopupOrSheet from "../../../newComponents/models/PopupOrSheet";
import FlatListComponent from "../../../newComponents/flatList/flatList";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import DepositIcon from "../../../assets/mainmenuicons/depositicon";
import SendIcon from "../../../assets/mainmenuicons/sendicon";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import WithdrawIcon from "../../../assets/mainmenuicons/withdrawicon";
import InactiveAccountPopup from "../../commonScreens/inactiveSheet/accountInactive";
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";
import QrScanLogo from "../../../assets/mainmenuicons/qrScanIcon";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { s } from "../../../constants/theme/scale";
import { setBiometricEnabled } from "../../../redux/actions/actions";
import { useDispatch } from "react-redux";
import { checkAppPermissions } from "../../../services/mediaPermissionService";
import PermissionModel from "../../commonScreens/permissionPopup";

const AccountDashboardScreen = ({
  currencyInfo,
  userInfo,
  currencyRefresh,
  isHighlightedWithdraw
}: AccountDashboardScreenProps) => {
  const Configuration: any = getTabsConfigation("HOME");
  const [isBalanceExpanded, setIsBalanceExpanded] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const currencySheetRef = useRef<any>(null);
  const moreQucikLinksSheetRef = useRef<any>(null);
  const [currencyList, setCurrencyList] = useState<any>([]);
  const { getMemDetails } = useMemberLogin();
  const [nextNavigation, setNextNavigation] = useState<{
    screen: string;
    params?: object;
  } | null>(null);
  const navigation = useNavigation<any>();
  const [kycModelVisible, setKycModelVisible] = useState(false);
  const { logEvent } = useActionLogging();
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const [activeQuickLink, setActiveQuickLink] = useState<string>("");
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [isInActive, setIsInactive] = useState<boolean>(false);
  const { t } = useLngTranslation();
  const [enableScanner, setEnableScanner] = useState(false);
  const InvalidQrCodeRef = useRef<any>(null);
  const { decryptAES } = useEncryptDecrypt();
  const dispatch = useDispatch();
  const [permissionModel, setPermissionModel] = useState<boolean>(false);
  const [permissionTitle, setPermissionTitle] = useState<string>('');
  const [permissionMessage, setPermissionMessage] = useState<string>('');

  useEffect(() => {
    getCurrencyListInfo();
    getApplock();

    // if (isHighlightedWithdraw === true) {
    //   setActiveQuickLink("WithdrawMethodSelect");
    //   dispatch(setHelightedWithdraw(false));
    // }
  }, []);

  const getCurrencyListInfo = async () => {
    try {
      const response: any = await ProfileService.currencyLu();
      if (response?.ok) {
        let currencyList = response?.data?.CurrencyLU || [];
        setCurrencyList(currencyList);
      } else {
        showAppToast(isErrorDispaly(response), "error");
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), "error");
    }
  };

  const getApplock = async () => {
    try {
      const response: any = await ProfileService.getApplock();
      if (response?.ok) {
        dispatch(setBiometricEnabled(response?.data?.isBiometric));
      } else {
        console.log("error")
      }
    } catch {
    }
  };
  const handleBalanceDropdownPress = () => {
    const actionData: ActionLogParams = {
      screename: "AccountDashboardScreen",
      actionName: "Navigate to Assets Screen",
      actionType: "Button",
    };
    logEvent("button_press", actionData);
    if (userInfo?.customerAccountStatus === false) {
      return setIsInactive(true);
    }
    if (userInfo?.isKYC !== true) {
      setKycModelVisible(!kycModelVisible);
      return;
    }
    else {
      navigation.navigate("AssetsScreen");
    }
  };

  const closekycModel = () => {
    setKycModelVisible(false);
    setActiveQuickLink("");
  };

  const handleQuickLinkPress = (action: string) => {
    if (
      (action === "DepositCurrencySelect" ||
        action === "WithdrawMethodSelect" || "Send") &&
      userInfo?.customerAccountStatus === false
    ) {
      setIsInactive(true); // Show popup for inactive account
      return;
    }
    setActiveQuickLink(action);
    const comingSoonActions = [
      "DepositCurrencySelect",
      "WithdrawMethodSelect",
      "Send",
    ];
    const actionData: ActionLogParams = {
      screename: "AccountDashboardScreen",
      actionName: `Quick Link - ${action}`,
      actionType: "Button",
    };

    if (action === "More") {
      if (userInfo?.isKYC !== true) {
        logEvent("button_press", {
          ...actionData,
          actionObj: { opens: "KYC Modal" },
        });
        setKycModelVisible(!kycModelVisible);
        return;
      }
      logEvent("button_press", {
        ...actionData,
        actionObj: { opens: "More Quick Links Sheet" },
      });
      requestAnimationFrame(() => {
        moreQucikLinksSheetRef?.current?.open();
      });
    } else if (
      action === "WithdrawMethodSelect" ||
      action === "DepositCurrencySelect" || action === "Send"
    ) {
      if (userInfo?.isKYC !== true) {
        logEvent("button_press", {
          ...actionData,
          actionObj: { opens: "KYC Modal" },
        });
        setKycModelVisible(!kycModelVisible);
        return;
      }
      logEvent("navigation_action", { ...actionData, nextScreenName: action });
      navigation.navigate(action);
    } else if (comingSoonActions.includes(action)) {
      logEvent("navigation_action", { ...actionData, nextScreenName: action });
      navigation.navigate(action);
    } else {
      logEvent("navigation_action", {
        ...actionData,
        nextScreenName: "ComingSoon",
        actionObj: { pageHeader: false },
      });
      navigation.navigate("ComingSoon", {
        pageHeader: false,
        customHeader: { title: "Send", showBackButton: true },
      });
    }
  };

  const handleCurrencySheetClose = () => {
    setIsBalanceExpanded(false);
  };

  const handleMoreLinksSheetClose = () => {
    if (nextNavigation) {
      navigation.navigate(nextNavigation.screen, nextNavigation.params);
      setNextNavigation(null);
    }
    setActiveQuickLink("");
  };

  const updateCustomerUserInfoCall = async (currency?: any) => {
    const obj = {
      currency: currency?.code,
      image: currency?.logo,
    };

    try {
      const response: any = await CryptoServices.updateCustomerDefaultCurrency(
        obj
      );
      setCurrencyLoading(true);
      if (response?.data) {
        if (
          userInfo?.currency?.toUpperCase() !== currency?.code?.toUpperCase()
        ) {
          await getMemDetails(true);
          setCurrencyLoading(false);
          currencySheetRef.current?.close();
          currencyRefresh(currency.code);
        } else {
          showAppToast("Currency already selected", "info");
          setCurrencyLoading(false);
        }
      } else {
        showAppToast(isErrorDispaly(response), "error");
        setCurrencyLoading(false);
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), "error");
      setCurrencyLoading(false);
    }
  };

  const handleRBSheetItemPress = (action: string) => {
    moreQucikLinksSheetRef.current?.close();
    if (action === "Scan QR Code") {
      setTimeout(() => {
        handleScanQRCode();
      }, 500)
    } else {
      const sheetActions = ["Convert", "Withdraw", "Gift"];
      if (sheetActions.includes(action)) {
        navigation.navigate("ComingSoon", {
          pageHeader: false,
          customHeader: {
            title: action,
            showBackButton: true,
          },
        });
      } else {
        setNextNavigation(null);
      }
    }
  };

  const handleScanQRCode = useCallback(async () => {
    const res = await checkAppPermissions('camera');
    if (res.showPopup) {
      setPermissionTitle(res.titleKey!);
      setPermissionMessage("GLOBAL_CONSTANTS.CAMERA_ACCESS_REQUIRED_TO_SCAN_QR");
      setPermissionModel(true);
      return;
    }
    if (!res.allowed) {
      return;
    }
    setEnableScanner(true);
  }, []);

  const handleCaptureCode = useCallback(
    (text: string) => {
      try {
        const scannedDataDecrypted = decryptAES(text);
        const parsed = JSON.parse(scannedDataDecrypted);
        if (parsed?.Type == "bullswipeId") {
          setEnableScanner(false);
          navigation.navigate("TransferAmount", {
            qrData: parsed,
            Currency: "USDT",
          });
          return;
        }
      } catch (decryptError) {
        if (text.startsWith("http://") || text.startsWith("https://")) {
          setEnableScanner(false);
          InvalidQrCodeRef?.current?.open();
          return;
        }
        if (text && text.length > 0) {
          setEnableScanner(false);
          InvalidQrCodeRef?.current?.open();
        }
      }
      InvalidQrCodeRef?.current?.open();
      setEnableScanner(false);
    },
    [navigation, decryptAES]
  );

  const handleCloseScanner = useCallback(() => {
    setEnableScanner(false);
  }, []);

  const handleQrCodeClose = () => {
    InvalidQrCodeRef?.current?.close();
  };
  const handleRecieve = () => {
    navigation.navigate("Receive");
    setEnableScanner(false);
  };
  const CurrencySelector = ({ data = [], selectedItem }: any) => {
    const [imageLoadStatus, setImageLoadStatus] = useState<
      Record<string, boolean>
    >({});

    const handleImageLoad = (itemCode: string) => {
      setImageLoadStatus((prev) => ({ ...prev, [itemCode]: false }));
    };

    const handleImageError = (itemCode: string) => {
      setImageLoadStatus((prev) => ({ ...prev, [itemCode]: false }));
    };

    const currencyListData = Array.isArray(data)
      ? data.map((item: any) => ({
        ...item,
        isLoading: imageLoadStatus[item.code] ?? true,
      }))
      : [];
    return (
      <FlatListComponent
        data={currencyListData}
        keyExtractor={(item: any, index: any) => `${item.code}-${index}`}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isSelected = selectedItem && item.code === selectedItem.code;

          return (
            <TouchableOpacity onPress={() => updateCustomerUserInfoCall(item)}>
              <ViewComponent
                style={[
                  reversCommonStyles.dflex,
                  reversCommonStyles.alignCenter,
                  reversCommonStyles.gap16,
                  isSelected && reversCommonStyles.bgBlack,
                  reversCommonStyles.p10,
                  reversCommonStyles.rounded5,
                ]}
              >
                <ImageUri
                  uri={item.logo}
                  width={s(24)}
                  height={s(24)}
                  style={[
                    reversCommonStyles.rounded25,
                    reversCommonStyles.modalIconbg,
                  ]}
                  isImageLoading={item.isLoading}
                  onLoad={() => handleImageLoad(item.code)}
                  onError={() => handleImageError(item.code)}
                />
                <ViewComponent style={[reversCommonStyles.flex1]}>
                  <ParagraphComponent
                    text={`${item.code?.toUpperCase()}`}
                    style={[
                      reversCommonStyles.fs14,
                      reversCommonStyles.fw600,
                      reversCommonStyles.textWhite,
                    ]}
                  />
                </ViewComponent>
                <ViewComponent
                  style={[
                    reversCommonStyles.dflex,
                    reversCommonStyles.alignEnd,
                    reversCommonStyles.justifyend,
                  ]}
                >
                  {isSelected &&
                    (currencyLoading ? ( // This logic is now correct because item.isLoading will be updated
                      <ActivityIndicator
                        size="small"
                        color={NEW_COLOR.ICON_YELLOW_LOADER}
                      />
                    ) : (
                      <ViewComponent
                        style={[commonStyles.radioDot, commonStyles.dflex]}
                      >
                        <MaterialIcons name="check" size={s(16)} color={NEW_COLOR.TEXT_BLACK} />
                      </ViewComponent>
                    ))}
                </ViewComponent>
              </ViewComponent>
              <ViewComponent style={[reversCommonStyles.listGap]} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <ViewComponent
            style={[reversCommonStyles.py20, reversCommonStyles.alignCenter]}
          >
            <NoDataComponent />
          </ViewComponent>
        )}
      />
    );
  };

  const closeInactiveAccountPopup = () => {
    setIsInactive(false);
    setActiveQuickLink("");
  };
  const closePermissionModel = () => {
    setPermissionModel(false);
  };

  return (
    <ViewComponent>
      {
        <CommonTouchableOpacity
          style={[
            commonStyles.p10,
            commonStyles.sectionGap,
            commonStyles.rounded10,
            {
              backgroundColor: NEW_COLOR.APPLY_CARD_BG,
            }
          ]}
          onPress={handleBalanceDropdownPress}
        >
          <ViewComponent
            style={[
              commonStyles.justifyContent,
              commonStyles.flexRow,
              commonStyles.alignCenter,
              commonStyles.mb10,
            ]}
          >
            <ParagraphComponent
              text={`${t("GLOBAL_CONSTANTS.ACCOUNT_BALANCE")}${userInfo?.currency
                ? ` (${userInfo.currency.toUpperCase()})`
                : ""
                }`}
              style={[
                commonStyles.textGrey,
                commonStyles.fs14,
                commonStyles.fw400,
                commonStyles.flex1,
              ]}
            />
            <Ionicons
              name="chevron-down-outline"
              size={s(20)}
              color={commonStyles.textlinkgrey.color}
            />
          </ViewComponent>
          <CurrencyText
            value={currencyInfo?.totalAmount || 0}
            style={[
              commonStyles.textWhite,
              commonStyles.fs30,
              commonStyles.fw700,

            ]}
          />
        </CommonTouchableOpacity>
      }

      <ViewComponent
        style={[
          commonStyles.flexRow,
          commonStyles.justifyContent,
          // userInfo?.isKYC !== true && commonStyles.sectionGap,
          styles.quickLinksContainer,
        ]}
      >
        {Configuration?.QUCIKLINKS?.Deposit && (
          <CommonTouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => handleQuickLinkPress("DepositCurrencySelect")}
          >
            <ViewComponent
              style={[
                styles.quickLinkIconCircle,
                activeQuickLink === "DepositCurrencySelect"
                  ? commonStyles.bg_yellow
                  : commonStyles.bannerBg,
              ]}
            >
              <DepositIcon
                color={
                  activeQuickLink === "DepositCurrencySelect"
                    ? NEW_COLOR.TEXT_BLACK
                    : commonStyles.textGrey.color
                }
              />
            </ViewComponent>
            <ParagraphComponent
              text={t("GLOBAL_CONSTANTS.DEPOSIT")}
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.alignCenter,
                commonStyles.textWhite,
              ]}
            />
          </CommonTouchableOpacity>
        )}

        {Configuration?.QUCIKLINKS?.send && (
          <CommonTouchableOpacity
            style={[styles.quickLinkItem]}
            onPress={() => handleQuickLinkPress("Send")}
          >
            <ViewComponent
              style={[
                styles.quickLinkIconCircle,
                activeQuickLink === "Send"
                  ? commonStyles.bg_yellow
                  : commonStyles?.bannerBg,
              ]}
            >
              <SendIcon
                color={
                  activeQuickLink === "Send"
                    ? NEW_COLOR.TEXT_BLACK
                    : commonStyles.textGrey.color
                }
              />
            </ViewComponent>
            <ParagraphComponent
              text={t("GLOBAL_CONSTANTS.SEND")}
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.alignCenter,
                commonStyles.textWhite,
              ]}
            />
          </CommonTouchableOpacity>
        )}

        {Configuration?.QUCIKLINKS?.Withdraw && (
          <CommonTouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => handleQuickLinkPress("WithdrawMethodSelect")}
          >
            <ViewComponent
              style={[
                styles.quickLinkIconCircle,
                activeQuickLink === "WithdrawMethodSelect"
                  ? commonStyles.bg_yellow
                  : commonStyles?.bannerBg,
              ]}
            >
              <WithdrawIcon
                color={
                  activeQuickLink === "WithdrawMethodSelect"
                    ? NEW_COLOR.TEXT_BLACK
                    : commonStyles.textGrey.color
                }
              />
            </ViewComponent>
            <ParagraphComponent
              text={t("GLOBAL_CONSTANTS.WITHDRAW")}
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.alignCenter,
                commonStyles.textWhite,
              ]}
            />
          </CommonTouchableOpacity>
        )}

        <CommonTouchableOpacity
          style={styles.quickLinkItem}
          onPress={() => handleQuickLinkPress("More")}
        >
          <ViewComponent
            style={[
              styles.quickLinkIconCircle,
              activeQuickLink === "More"
                ? commonStyles.bg_yellow
                : commonStyles?.bannerBg,
            ]}
          >
            <Feather name="more-horizontal" size={s(24)} color={
              activeQuickLink === "More"
                ? NEW_COLOR.TEXT_BLACK
                : commonStyles.textGrey.color
            } />
          </ViewComponent>
          <ParagraphComponent
            text={t("GLOBAL_CONSTANTS.QUICK_LINKS_MORE")}
            style={[
              commonStyles.fs14,
              commonStyles.fw500,
              commonStyles.alignCenter,
              commonStyles.textWhite,
            ]}
          />
        </CommonTouchableOpacity>
      </ViewComponent>

      <PopupOrSheet
        ref={currencySheetRef}
        height={s(350)}
        title="GLOBAL_CONSTANTS.SELECT_CURRENCY"
        onClose={handleCurrencySheetClose}
        closeOnPressMask={true}
      >
        <CurrencySelector
          data={currencyList}
          selectedItem={userInfo?.currency ? { code: userInfo.currency } : null}
        />
      </PopupOrSheet>

      <PopupOrSheet
        ref={moreQucikLinksSheetRef}
        height={s(120)}
        onClose={handleMoreLinksSheetClose}
        showCloseIcon={false}
        closeOnPressMask={true}
        showCloseIconAndTittle={false}
      >
        <ViewComponent style={[]}>
          {Configuration?.QUCIKLINKS?.convert && (
            <CommonTouchableOpacity
              style={[
                commonStyles.dflex,
                commonStyles.gap16,
                commonStyles.alignCenter,
                commonStyles.listGap,
              ]}
              onPress={() => handleRBSheetItemPress("Convert")}
            >
              <Ionicons
                name="repeat-outline"
                size={s(28)}
                color={REVERSE_NEW_COLOR.TEXT_WHITE}
              />
              <ParagraphComponent
                text={t("GLOBAL_CONSTANTS.CONVERT")}
                style={[commonStyles.fs16, reversCommonStyles.textWhite]}
              />
            </CommonTouchableOpacity>
          )}

          {Configuration?.QUCIKLINKS?.scanQrCode && (
            <CommonTouchableOpacity
              style={[
                commonStyles.dflex,
                commonStyles.gap16,
                commonStyles.alignCenter,
                { backgroundColor: NEW_COLOR.LIST_TEXT },
                commonStyles.p12,
                commonStyles.rounded12,


              ]}
              onPress={() => handleRBSheetItemPress("Scan QR Code")}
            >
              <QrScanLogo
                height={s(28)}
                width={s(28)}
                color={NEW_COLOR.TEXT_GREY}
              />
              <ParagraphComponent
                text={t("GLOBAL_CONSTANTS.SCAN")}
                style={[commonStyles.fs16, reversCommonStyles.textWhite]}
              />
            </CommonTouchableOpacity>
          )}
          <ViewComponent style={[commonStyles.listGap]} />

          {Configuration?.QUCIKLINKS?.Gift && (
            <CommonTouchableOpacity
              style={[
                commonStyles.dflex,
                commonStyles.gap16,
                commonStyles.alignCenter,
              ]}
              onPress={() => handleRBSheetItemPress("Gift")}
            >
              <Ionicons
                name="gift-outline"
                size={s(28)}
                color={REVERSE_NEW_COLOR.TEXT_WHITE}
              />
              <ParagraphComponent
                text={t("GLOBAL_CONSTANTS.GIFT")}
                style={[commonStyles.fs16, reversCommonStyles.textWhite]}
              />
            </CommonTouchableOpacity>
          )}
          <ViewComponent style={[commonStyles.listGap]} />
        </ViewComponent>
      </PopupOrSheet>
      {isInActive && (
        <InactiveAccountPopup
          isVisibleModel={isInActive}
          onClose={closeInactiveAccountPopup}
        />
      )}

      {enableScanner && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={enableScanner}
          onRequestClose={handleCloseScanner}
        >
          <QrScanner
            onCaptureCode={handleCaptureCode}
            onClose={handleCloseScanner}
            showReceiveAndAlbum={false}
            showScannerTittle={true}
            handleReceive={handleRecieve}
          />
        </Modal>
      )}

      <PopupOrSheet
        ref={InvalidQrCodeRef}
        height={s(300)}
        displayType="bottom-sheet"
        title=""
        showCloseIconAndTittle={false}
      >
        <ViewComponent style={[reversCommonStyles.mt10]}>
          <ViewComponent style={[reversCommonStyles.sectionGap]}>
            <TextMultiLanguage
              text={"GLOBAL_CONSTANTS.INVALID_QR_CODE"}
              style={[
                reversCommonStyles.fw500,
                reversCommonStyles.fs18,
                reversCommonStyles?.textWhite,
                reversCommonStyles?.textCenter,
              ]}
            />
          </ViewComponent>
          <ViewComponent style={[reversCommonStyles.sectionGap]} />
          <ViewComponent>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.OK"}
              onPress={handleQrCodeClose}
              capitalizeTitle={false}
            />
          </ViewComponent>
        </ViewComponent>
      </PopupOrSheet>

      <PermissionModel 
        permissionDeniedContent={permissionMessage} 
        permissionTitle={permissionTitle} 
        closeModel={closePermissionModel} 
        addModelVisible={permissionModel} 
      />

      <ViewComponent style={[commonStyles.sectionGap]}>
        {kycModelVisible && (
          <KycVerifyPopup
            closeModel={closekycModel}
            addModelVisible={kycModelVisible}
          />
        )}

      </ViewComponent>
    </ViewComponent>
  );
};

const styles = StyleSheet.create({
  quickLinksContainer: {
    alignItems: "flex-start",
    paddingHorizontal: s(5),
  },
  quickLinkItem: {
    alignItems: "center",
    width: "20%",
  },
  quickLinkIconCircle: {
    borderRadius: 30,
    width: s(48),
    height: s(48),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: s(8),
  },
});

export default AccountDashboardScreen;
