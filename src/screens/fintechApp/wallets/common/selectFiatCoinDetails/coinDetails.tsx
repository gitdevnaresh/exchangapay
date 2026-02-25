import React, { useState } from "react";
import { useSelector } from "react-redux";
import FiatCoinDetails from "./FiatCoinDetails";
import { getVerificationData } from "../../../../../apiServices/common/countryService";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";

const CoinDetails = (props: any) => {
  const [errormsg, setErrormsg] = useState("");
  const [errormsgLink, setErrormsgLink] = useState("");
  const [kycModelVisible, setKycModelVisible] = useState(false);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const { t } = useLngTranslation();
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false);

  const depositNavigation = (): void => {
    setErrormsg("");
    props.navigation.navigate('FiatDeposit', {
      currency: props.route.params.code,
    });
  };

  const withdrawNavigation = async (): Promise<void> => {
    setErrormsg('');
    setErrormsgLink('');
    if (userInfo?.kycStatus !== "Approved") {
      setKycModelVisible(true);
    } else {
      const securityVerififcationData: any = await getVerificationData();
      if (securityVerififcationData?.ok) {
        if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
          props.navigation.navigate('FiatWithdrawForm', {
            currency: props.route.params?.code,
            screenName: props.route.params?.screenName
          });
        } else {
          setEnableProtectionModel(true);
        }
      } else {
          setEnableProtectionModel(true);

      }
    }
  };
  const backArrowButtonHandler = (): void => {
    props.navigation.goBack();
  };

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

export default CoinDetails;