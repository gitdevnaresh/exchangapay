import React, {  useState } from "react";
import { useDispatch } from "react-redux";
import { CommonActions, useNavigation } from "@react-navigation/native";
import AuthService from "../../apiServices/onBoarding/auth";
 import { isLogin, loginAction } from "../../redux/actions/actions";
import { useSumsubSDK } from "../sumsubHooks/useSumsubSDK";
import useEncryptDecrypt from "../encDecHook";
import { Logger } from '../../utils/Logger';
interface GetMemDetailsParams {
    isNewLogin?: boolean;
    fcmTken?: string | null;
    isSplashScreen?: boolean;
    handleSetLoading?: (value: boolean) => void;
    isReferralRequired?: boolean;
    isReferralMandatory?: boolean;
    screenName?:string;
}
 
const useMemberLogin = () => {
    const [memberLoader, setLoading] = useState(false)
    const [isOnboarding, setIsOnboarding] = useState(false)
    const dispatch = useDispatch<any>();
    const navigation = useNavigation<any>();
    const [isNewLogin, setIsNewLogin] = React.useState<boolean>(false);
    const { launchSumsubSDK  }=useSumsubSDK();
    const isLaunchingSumsub = React.useRef(false); // Add guard ref
  const { decryptAES } = useEncryptDecrypt();
 
 
   const getMemDetails = async (isOnlyUserUpdate?: boolean,screenName?:string, skip401Check: boolean = false) => {
    setIsOnboarding(true)
        try {
          const userLoginInfo: any = await AuthService.getMemberInfo()
          if (userLoginInfo?.status == 200) {
            setIsOnboarding(false)
            dispatch(loginAction(userLoginInfo.data));
            dispatch(isLogin(true));
            // if (isNewLogin) {
            // }
            if(isOnlyUserUpdate){
              return
            }
             if (decryptAES(userLoginInfo.data?.role, userLoginInfo.data?.clientSecretKey) === 'Admin') {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [{ name: "AccessDenied" }],
                  })
                );
            }
            else if (!userLoginInfo.data?.metadata?.IsEmailVerified) {
              if(screenName=="VerifyEmail"&& !userLoginInfo.data?.metadata?.IsEmailVerified){
                return;
              } else {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [{ name: "VerifyEmail" }],
                  })
                );
              }
             

            } 
            else if (userLoginInfo.data.customerState=="Registered"||userLoginInfo.data.customerState==null) {
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{ name: "ChooseAccountType" }],
                })
              );
            }
             else if (userLoginInfo.data?.accountType?.toLowerCase() == 'business'&&userLoginInfo?.data?.metadata?.chooseAccount?.mobile?.chooseAccount?.toLowerCase()=='personal') {
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{ name: "BusinessLogin" }],
                })
              );
            }
            
          else if (userLoginInfo.data?.metadata?.IsPhoneNumberVerified=== false) {
            if(screenName=="PhoneVerificationScreen"&&userLoginInfo.data?.metadata?.IsPhoneNumberVerified=== false){
              return;
            }
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{ name: "PhoneVerificationScreen" }],
                })
              );
            } 
            else if ((userLoginInfo.data?.metadata?.IsKycRequired==true&&userLoginInfo.data?.metadata?.IsInitialKycRequired===true) && userLoginInfo.data?.kycStatus?.toLowerCase() !== 'approved') {
              // If already on SumsubSuccess and still pending, just return (no navigation)
              if (
                screenName === "SumsubSuccess" &&
                userLoginInfo.data?.kycStatus?.toLowerCase() === "pending" &&
                userLoginInfo.data?.metadata?.kycType?.toLowerCase() === "sumsub"
              ) {
                return;
              }
              // If pending and SumSub, navigate to SumsubSuccess
              if (
                userLoginInfo.data?.kycStatus?.toLowerCase() === "pending" &&
                userLoginInfo.data?.metadata?.kycType?.toLowerCase() === "sumsub"
              ) {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [{ name: "SumsubSuccess" }],
                  })
                );
                return;
              }else if(userLoginInfo.data?.kycStatus?.toLowerCase() ==="rejected"){
                navigation.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [{ name: "SumsubRejected" }],
                  })
                );
                return;
              }
              // If SumSub, navigate to Sumsub
              if (userLoginInfo.data?.metadata?.kycType?.toLowerCase() === "sumsub") {
                if(screenName=="Sumsub"){
                  return;
                }
                navigation.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [{ name: "Sumsub" }],
                  })
                );
                return;
              }
              else{
                if (userLoginInfo.data?.accountType?.toLowerCase() == 'business') {
                  if (userLoginInfo.data?.metadata?.kycLevel == null || userLoginInfo.data?.metadata?.kycLevel == undefined) {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 1,
                        routes: [{ name: "KybCompanyData", params: { ScreenName: "initialKyc" } }],
                      })
                    );
                    return;
                  }
                  else if (userLoginInfo.data?.metadata?.kycLevel == 'Basic') {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 1,
                        routes: [{ name: "KybUboList", params: { ScreenName: "initialKyc" } }],
                      })
                    );
                  } else if (userLoginInfo.data?.metadata?.kycLevel?.toLowerCase() == 'advanced') {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 1,
                        routes: [{ name: "KybDirectorDetailsList", params: { ScreenName: "initialKyc" } }],
                      })
                    );
                    return;
                  } else {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 1,
                        routes: [{ name: "KybInfoPreview", params: { ScreenName: "initialKyc" } }],
                      })
                    );
                    return;
                  }

                } else {
                  if (userLoginInfo.data?.metadata?.kycLevel == null || userLoginInfo.data?.metadata?.kycLevel == undefined) {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 1,
                        routes: [{ name: "KycProfile", params: { ScreenName: "initialKyc" } }],
                      })
                    );
                  }
                  else if (userLoginInfo.data?.metadata?.kycLevel == 'Basic') {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 1,
                        routes: [{ name: "KycProfileStep2", params: { ScreenName: "initialKyc" } }],
                      })
                    );
                  } else {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 1,
                        routes: [{ name: "KycProfilePreview", params: { ScreenName: "initialKyc" } }],
                      })
                    );
                  }
                }
              
            }
          }
          else if (userLoginInfo.data.customerState !== "Approved") {
            if(screenName=="AccountProgress"&&userLoginInfo.data.customerState !== "Approved"){
              return;
            }
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{ name: "AccountProgress" }],
                })
              );
            }
            else {
              checkBio(userLoginInfo.data)
            }

          }else if(userLoginInfo?.status == 401 && skip401Check){
            navigation?.navigate("RelogIn");
            setIsOnboarding(false)
          }
          else {
            navigation?.navigate("SomethingWentWrong");
            setIsOnboarding(false)
          }
        } catch (error: any) {
          // navigation?.navigate("RelogIn");
          setLoading(false);
            setIsOnboarding(false)
        }
      }
 const checkBio = (userInfo: any) => {
     navigation.dispatch(
       CommonActions.reset({
         index: 1,
         routes: [{ name: "Dashboard" }],
       })
     );
     setLoading(false);
   }
    return { memberLoader, getMemDetails, isOnboarding };
    
};
 
 
 
 
export default useMemberLogin;