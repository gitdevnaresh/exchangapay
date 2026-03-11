import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { useActionLogging } from "../../../../hooks/loggingHook";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import { useSelector } from "react-redux";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import { formatDateTimeAPI, isErrorDispaly } from "../../../../utils/helpers";
import { WithDrawServices } from "../../../../apiServices/withdrawApis/withdrawServices";
import ViewComponent from "../../../../newComponents/view/view";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ConfirmDetailsComponent from "../../../commonScreens/whitelistWalletaddress/confirmDetailsComponent/ConfirmDetailsComponent";
import AuthVerification from "../../../commonScreens/authentication";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";


interface CryptoToken {
  address: string | null;
  amount: number;
  chainId: string | null;
  code: string;
  decimals: number | null;
  depositMaxLimit: number;
  depositMinLimit: number;
  hexId: string | null;
  id: string;
  maxLimit: number;
  minLimit: number;
  multiSendAddress: string | null;
  name: string;
  coinData: any;
}

const WhitelistConfirmDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { logEvent } = useActionLogging();
  const [loading, setLoading] = useState(false);
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [ipAddress, setIpAddress] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [authOpen, setAuthOpen] = useState(false);
  const [error,setError]=useState<string>("")

  const { walletAddress, nickname, selectedNetwork, coinCode, coinData } = route.params as {
    walletAddress: string;
    nickname: string;
    selectedNetwork: CryptoToken;
    coinCode: string;
    coinData: any;
  };

  const userName = decryptAES(userInfo?.userName);

  useHardwareBackHandler(() => {
    handleBackPress();
  });

  const getIpAndLocation = async () => {
    setError("");
    try {
      const response = await fetch('https://ipinfo.io/json');
      const data = await response.json();
      if (data.ip) setIpAddress(data.ip);
      if (data.city && data.country) {
        setLocation(`${data.city}, ${data.country}`);
      }
    } catch (fallbackError) {
      setError(isErrorDispaly(fallbackError));
      setIpAddress("Unknown");
      setLocation("Unknown");
    }
  };

  useEffect(() => {
    setError("");
    getIpAndLocation();
  }, []);

  const handleEditAddress = () => {
    navigation.navigate("AddProfileWalletaddress", {
      selectedNetwork: selectedNetwork,
      walletAddress: walletAddress,
      nickname: nickname,
      isEditFlow: true,
      coinCode: coinCode,
      coinData: coinData
    });
  };

  const handleEditNickname = () => {
    navigation.navigate("AddWhiteListNickname", {
      walletAddress,
      selectedNetwork,
      nickname,
      isEditFlow: true,
      coinCode: coinCode,
      coinData: coinData
    });
  };
  const handleContinue = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = {
        id: "00000000-0000-0000-0000-000000000000",
        customerId: userInfo?.id,
        favouriteName: encryptAES(nickname),
        currency: coinCode,
        network: selectedNetwork?.code,
        createddate: formatDateTimeAPI(new Date()),
        userCreated: encryptAES(userName),
        modifiedDate: null,
        modifiedBy: null,
        status: 1,
        adressstate: "",
        currencyType: "Crypto",
        walletAddress: walletAddress,
        createdBy: encryptAES(userName),
        AnalyticsId: "",
        proofType: "",
        amount: null,
        info: {
          IPAddress: ipAddress,
          Location: location
        }
      };
      const response: any = await WithDrawServices.savePayee(payload);
      if (response.status == 200) {
        navigation.navigate({ 
          name: "WhiteListSuccess", 
          params: { selectedNetwork: selectedNetwork, coinCode: coinCode, coinData: coinData }, 
          merge: true 
        });
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };
  const handleBackPress = () => {
    const actionData = {
      action: "back_press",
      actionType: "button_click",
      screen: "ConfirmDetails",
      nextscreen: "AddNewAddress||AddAccountNickname",
      actionObj: { walletAddress, nickname, selectedNetwork },
    };
    logEvent("back_press", actionData);
    navigation.goBack();
  };

  const handleAuthClose = () => {
    setAuthOpen(false);
    setLoading(false);
  };

  const handleAuthSuccess = (verifications: any) => {
    setAuthOpen(false);
    handleContinue();
  };

  const verifyAuth = () => {
    setError("");
    setAuthOpen(true);
    setLoading(true);
  };
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.sectionGap]}>
        <PageHeader title={"GLOBAL_CONSTANTS.CONFIRM_DETAILS"} onBackPress={handleBackPress} />
        {error&&<ErrorComponent message={error} screen={true}/>}
        <ConfirmDetailsComponent
          walletAddress={walletAddress}
          nickname={nickname}
          onEditAddress={handleEditAddress}
          onEditNickname={handleEditNickname}
          onContinue={verifyAuth}
          loading={loading}
        />

           {authOpen && (
        <AuthVerification
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
          feature={'WhiteList Add'}
          requiredVerifys={1}
        />
      )}
      </Container>
    </ViewComponent>
  );
};

export default WhitelistConfirmDetails;