import { useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import FiatCoinDetails from "./FiatCoinDetails";
import { FIAT_CONSTANTS } from "../../constant";
import { useSelector } from "react-redux";
import { getVerificationData } from "../../../../../apiServices/common/countryService";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";

const WalletsFiatCoinDetails = (props: any) => {
  const navigation = useNavigation<any>();
    const userInfo:any = useSelector((state: any) => state.userReducer?.userDetails);
  const coinData = props.route.params?.data ? props.route.params.data : props.route.params;
  const [errormsg, setErrormsg] = useState("");
  const [errormsgLink, setErrormsgLink] = useState("");
  const [kycModelVisible, setKycModelVisible] = useState(false);
  const { t } = useLngTranslation();
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)

  const depositNavigation = (): void => {
    setErrormsg("");
    const actionType = coinData?.actionType?.toLowerCase() || '';
    if (actionType?.includes(FIAT_CONSTANTS.PAYINFIAT)) {
      props.navigation.navigate(FIAT_CONSTANTS.WALLETS_FIAT_PAYINS_LIST, {
        data: coinData, amount: coinData?.amount, screenName: "WalletsFiatCoinDetails"
      });
    }
    else if (actionType.includes('bankaccountcreation') || actionType.includes('bankdepositfiat')) {
      if (coinData?.accountStatus?.toLowerCase() === 'approved' || coinData?.accountStatus?.toLowerCase() === 'submitted'||coinData?.accountStatus?.toLowerCase() ==='rejected') {
        navigation.navigate('Bank', { currency: coinData.code, screenName: "WalletsAllCoinsList" });
      } else if (coinData?.accountStatus?.toLowerCase() == null) {
        navigation.navigate('WalletsBankCreation', { selectedVault: coinData, screenName: "WalletsAllCoinsList" });
      }
    } else if (actionType.includes('depositfiat')&&coinData.code?.toLowerCase() === 'brl') {
      if (userInfo?.accountType?.toLowerCase() !== 'personal') {
         props.navigation.navigate('BrlDepositView', {
            currency: coinData.code,
            screenName: coinData.screenName,
            selectedItem: coinData
          });
      } else {
        if (coinData?.accountStatus?.toLowerCase() === 'approved') {
          props.navigation.navigate('BrlDepositView', {
            currency: coinData.code,
            screenName: coinData.screenName,
            selectedItem: coinData
          });
        } else if (coinData?.accountStatus?.toLowerCase() == null) {
          navigation.navigate("BrlEnableProvider", {
            VaultData: coinData,
            screenName: coinData?.screenName
          });
        }
              else if (coinData?.accountStatus.toLowerCase() == 'submitted') {
                navigation.navigate("PaymentPending", { screenName: "Wallets" })
            }
            else if (coinData?.accountStatus.toLowerCase() == 'rejected') {
                navigation.navigate("PaymentPending", { 
                    screenName: "Wallets", 
                    status: "rejected", 
                    remarks: coinData?.remarks 
                })
            } 
        else {
          navigation.navigate("PaymentPending", { screenName: "Wallets" })
        }
      }

    }

    else {
      props.navigation.navigate('FiatDeposit', {
        currency: coinData.code,
        screenName: coinData.screenName
      });
    }
  }
  const withdrawNavigation = async (): Promise<void> => {
    setErrormsg('');
    setErrormsgLink('');
    if (userInfo?.kycStatus !== "Approved") {
      setKycModelVisible(true);
    } else {
      const securityVerififcationData: any = await getVerificationData();
      if (securityVerififcationData?.ok) {
        if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
          const actionType = coinData?.actionType?.toLowerCase() || '';
          if (actionType?.includes(FIAT_CONSTANTS.PAYOUTFIAT)) {
            navigation.navigate("WalletsFiatPayoutWithdraw", {
              selectedVault: coinData,
              screenName: coinData?.screenName,
            });
          }
          else if (actionType.includes('bankaccountcreation') || actionType.includes('bankwithdrawfiat')) {
            if (coinData?.accountStatus?.toLowerCase() === 'approved') {
              navigation.navigate('SendAmount', { walletCode: coinData.code, name: coinData.name, selectedId: coinData.id, screenName: "WalletsAllCoinsList" });
            } else if (coinData?.accountStatus?.toLowerCase() == null) {
              navigation.navigate('WalletsBankCreation', { selectedVault: coinData, screenName: "WalletsAllCoinsList" });
            } else {
              navigation.navigate('Bank', { currency: coinData.code, screenName: "WalletsAllCoinsList", });
            }
          } else {
            navigation.navigate('FiatWithdrawForm', {
              currency: coinData?.code,
              screenName: "WalletsAllCoinsList"
            });
          }
        } else {
          setEnableProtectionModel(true);
        }
      } else {
          setEnableProtectionModel(true);

      }
    }
  };
  const backArrowButtonHandler = useCallback((): void => {
    const actionType = coinData?.actionType?.toLowerCase() || '';
    const screenType = actionType ? (actionType.includes(FIAT_CONSTANTS.PAYINFIAT) ? FIAT_CONSTANTS.DEPOSIT : FIAT_CONSTANTS.WITHDRAW) : undefined;
    props.navigation.navigate('WalletsAllCoinsList', { animation: 'slide_from_left', initialTab: 1, screenType: screenType });
  }, [coinData?.actionType, props.navigation]);

  const closeKycModel = () => {
    setKycModelVisible(false);
  };

  const handleErrorClose = () => {
    setErrormsg("");
  };

  const handleLink = () => {
    props.navigation.navigate('Security');
    setErrormsg("");
    setErrormsgLink("");
  };
 const closeEnableProtectionModel = () => {
    setEnableProtectionModel(false);
  };
  return (
    <FiatCoinDetails 
      {...props} 
      depositNavigation={depositNavigation} 
      withdrawNavigation={withdrawNavigation} 
      backArrowButtonHandler={backArrowButtonHandler}
      errormsg={errormsg}
      errormsgLink={errormsgLink}
      kycModelVisible={kycModelVisible}
      closeKycModel={closeKycModel}
      handleErrorClose={handleErrorClose}
      handleLink={handleLink}
      enableProtectionModel={enableProtectionModel}
      closeEnableProtectionModel={closeEnableProtectionModel}
    />
  )
};

export default WalletsFiatCoinDetails;