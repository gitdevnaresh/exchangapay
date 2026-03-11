import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { StyleSheet, Dimensions, Animated, Modal } from "react-native";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import { useThemeColors } from "../../hooks/useThemeColors";
import { s } from "../../constants/theme/scale";
import ViewComponent from "../../newComponents/view/view";
import PageHeader from "../../newComponents/pageHeader/pageHeader";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import CommonTouchableOpacity from "../../newComponents/touchableComponents/touchableOpacity";
import TransactionIcon from "../../assets/mainmenuicons/transactionfilter";
import EmailTab from "./emailTab/emailTab";
import PhoneTab from "./phoneTab/phoneTab";
import BullSwipeIdTab from "./bullSwipeIdTab/bullSwipeIdTab";
import TextMultiLanguage from "../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import useEncryptDecrypt from "../../hooks/encDecHook";
import RecentPayees from "./recentPayees/recentPayees";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useHardwareBackHandler } from "../../hooks/HardwareBackHandler";
import QrScanner from "../../newComponents/scannerComponent/scanner";
import PopupOrSheet from "../../newComponents/models/PopupOrSheet";
import ButtonComponent from "../../newComponents/buttons/button";
import QrScanLogo from "../../assets/mainmenuicons/qrScanIcon";
import ProfileService from "../../services/profile";
import { ReferralDetails } from "../profile/profileTypes";
import { ActionLogParams, useActionLogging } from "../../hooks/loggingHook";
import { isErrorDispaly } from "../../utils/helpers";
import ErrorComponent from "../../newComponents/errorDisplay/errorDisplay";
import CustomTabView from "../../newComponents/tabView/customeTabView";
import { checkAppPermissions } from "../../services/mediaPermissionService";
import PermissionModel from "../commonScreens/permissionPopup";

const Send = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },
    { key: "bullswipe", title: "BullSwipe ID" },
  ]);

  // Animation and layout calculations
  const { tabWidth } = useMemo(() => {
    const screenWidth = Dimensions.get("window").width;
    const width = screenWidth - s(32) - s(4); // -32 for margins, -4 for border width
    const calculatedTabWidth = width / routes.length;
    return {
      containerWidth: width,
      tabWidth: calculatedTabWidth,
    };
  }, [routes.length]);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const styles = customStyles(NEW_COLOR, tabWidth); // Pass tabWidth to the styles
  const { decryptAES } = useEncryptDecrypt();
  const [enableScanner, setEnableScanner] = useState(false);
  const InvalidQrCodeRef = useRef<any>(null);
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const [referralDetails, setReferralDetails] =
    useState<ReferralDetails | null>(null);
  const { logEvent } = useActionLogging();
  const isFoused = useIsFocused();
  const [error, setError] = useState("");
  const [permissionModel, setPermissionModel] = useState<boolean>(false);
  const [permissionTitle, setPermissionTitle] = useState<string>('');
  const [permissionMessage, setPermissionMessage] = useState<string>('');

  useEffect(() => {
    getRefferalDetails();
  }, [isFoused]);

  const closePermissionModel = () => {
    setPermissionModel(false);
  };

  useHardwareBackHandler(() => {
    handleBackPress();
    return true;
  });
  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "email":
        return <EmailTab key="email" onError={setError} />;
      case "phone":
        return <PhoneTab key="phone" onError={setError} />;
      case "bullswipe":
        return <BullSwipeIdTab key="bullswipe" onError={setError} />;
      default:
        return null;
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTransactions = () => {
    navigation.navigate("TransactionList", { trasactionType: "send" });
  };

  const getRefferalDetails = useCallback(async () => {
    try {
      const response = await ProfileService.getReferralDetails();

      if (response.ok) {
        setReferralDetails(response.data as ReferralDetails);

        // Store referral details in state
      } else {
        const errorData: ActionLogParams = {
          screename: "Receive",
          actionName: "API Error - getReferralDetails",
          actionType: "Error",
          actionObj: { error: isErrorDispaly(response) },
        };
        logEvent("error", errorData);
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      const errorData: ActionLogParams = {
        screename: "Receive",
        actionName: "API Exception - getReferralDetails",
        actionType: "Error",
        actionObj: { error: isErrorDispaly(error) },
      };
      logEvent("error", errorData);
      setError(isErrorDispaly(error));
    }
  }, []);
  const handleRecieve = () => {
    navigation.navigate("Receive", { referralDetails: referralDetails });
    setEnableScanner(false);
  };
  const handleRightAction = (
    <ViewComponent
      style={[
        commonStyles.dflex,
        commonStyles.justifyCenter,
        commonStyles.alignCenter,
        commonStyles.gap16,
      ]}
    >
      <CommonTouchableOpacity
        style={[
          commonStyles.radioBg,
          commonStyles.p6,
          commonStyles.rounded12,
          commonStyles.px16,
        ]}
        onPress={handleRecieve}
      >
        <TextMultiLanguage
          text={"GLOBAL_CONSTANTS.RECEIVE"}
          style={[
            commonStyles.fs12,
            commonStyles.fw500,
            commonStyles.textWhite,
          ]}
        />
      </CommonTouchableOpacity>

      <CommonTouchableOpacity onPress={handleTransactions}>
        <TransactionIcon />
      </CommonTouchableOpacity>
    </ViewComponent>
  );

  // This function renders the custom toggle button bar
  const renderTabBar = useCallback((props: any) => (
    <ViewComponent style={styles.tabBarContainer}>
      {props.navigationState.routes.map((route: any, i: number) => {
        const isActive = props.navigationState.index === i;
        return (
          <CommonTouchableOpacity
            key={route.key}
            style={[
              styles.tabButton,
              isActive ? styles.activeTabButton : styles.inactiveTabButton,
            ]}
            activeOpacity={0.8}
            onPress={() => setIndex(i)}
          >
            <Animated.Text
              style={[
                commonStyles.fs14,
                commonStyles.fw600,
                commonStyles.textCenter,
                { color: NEW_COLOR.TEXT_WHITE },
              ]}
            >
              {route.title}
            </Animated.Text>
          </CommonTouchableOpacity>
        );
      })}
    </ViewComponent>
  ), [NEW_COLOR.TEXT_WHITE, commonStyles, styles, setIndex]);
  const handleScan = useCallback(async () => {
    setError("");
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
        // If decryption fails, check if it's a plain URL or text
        // Check if it's a URL
        if (text.startsWith("http://") || text.startsWith("https://")) {
          setEnableScanner(false);
          InvalidQrCodeRef?.current?.open();

          return;
        }

        // Check if it's other plain text
        if (text && text.length > 0) {
          setEnableScanner(false);
          InvalidQrCodeRef?.current?.open();
        }
      }
      InvalidQrCodeRef?.current?.open();
      // If we reach here, it's neither a valid BullSwipe ID nor recognizable content
      setEnableScanner(false);
    },
    [navigation]
  );

  const handleCloseScanner = useCallback(() => {
    setEnableScanner(false);
  }, []);

  const handleQrCodeClose = () => {
    InvalidQrCodeRef?.current?.close();
  };
  const handleNavigateToSend = (item: any) => {
    navigation.navigate("TransferAmount", {
      RecipientName: decryptAES(item?.customerId),
      actionType: "BULLSWIPE_ID",
      isFromRecentPayees: true,
      fullName: item?.fullName,
      Details: {
        id: item?.receiverId,
        customerId: item?.customerId,
        fullName: item?.fullName
      },
    });
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ViewComponent style={{ flex: 1, paddingHorizontal: (24), paddingTop: (24) }}>
        <PageHeader
          title={"GLOBAL_CONSTANTS.SEND"} // Using a direct string for clarity
          onBackPress={handleBackPress}
          rightActions={handleRightAction}
        />
        {error && <ErrorComponent message={error} screen={true} />}
        <KeyboardAwareScrollView
          contentContainerStyle={[{ flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
        >
          <ViewComponent style={[commonStyles.sectionGap]}>
            <CommonTouchableOpacity
              onPress={() => handleScan()}
              style={[{
                position: "absolute",
                right: -s(8),
              }, commonStyles.p12, commonStyles.rounded8]}
            >
              <QrScanLogo
                height={s(24)}
                width={s(24)}
                color={NEW_COLOR.TEXT_WHITE}
              />
            </CommonTouchableOpacity>
          </ViewComponent>
          {/* The custom tab bar is rendered here */}
          {/* {renderTabBar()} */}
          <ViewComponent style={[commonStyles.flex1]}>
            <ViewComponent style={{ height: s(280) }}>
              <CustomTabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get("window").width }}
                renderTabBar={renderTabBar}
                lazy={true}
              />
            </ViewComponent>
            <ViewComponent style={{ flex: 1, marginBottom: s(16) }}>
              <RecentPayees onPress={handleNavigateToSend} onError={setError} />
            </ViewComponent>
          </ViewComponent>
        </KeyboardAwareScrollView>
        {enableScanner && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={enableScanner}
            onRequestClose={handleCloseScanner}
          >
            <QrScanner
              onCaptureCode={handleCaptureCode} // directly call
              onClose={handleCloseScanner}
              showReceiveAndAlbum={false}
              handleReceive={handleRecieve}
              showScannerTittle={true}
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
      </ViewComponent>
    </ViewComponent>
  );
};

// Styles for the custom toggle button
const customStyles = (NEW_COLOR: any, tabWidth: number) =>
  StyleSheet.create({
    tabBarContainer: {
      backgroundColor: NEW_COLOR.TAB_BAR_BG || NEW_COLOR.BG_CARD,
      borderRadius: s(100) / 2,
      height: s(36),
      borderWidth: s(2),
      borderColor: NEW_COLOR.INPUT_BORDER || NEW_COLOR.BORDER_LIGHT,
      flexDirection: "row",
      marginTop: s(16),
    },
    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: s(8),
    },
    activeTabButton: {
      backgroundColor: NEW_COLOR.TAB_ACTIVE_COLOR || NEW_COLOR.PAY_ACTIVE_BG,
      borderRadius: s(100) / 2,
    },
    inactiveTabButton: {
      backgroundColor: "transparent",
    },
  });
export default Send;
