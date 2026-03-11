import { useState } from "react";
import { useDispatch } from "react-redux";
import { CommonActions, useNavigation } from "@react-navigation/native";
import AuthService from "../../services/auth";
import { isLogin, loginAction } from "../../redux/actions/actions";


const useMemberLogin = () => {
  const [memberLoader, setLoading] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();



  const getMemDetails = async (isOnlyUserUpdate?: boolean) => {
    setIsOnboarding(true);
    try {
      const userLoginInfo: any = await AuthService.getMemberInfo();
      if (userLoginInfo?.status == 200) {
        setIsOnboarding(false);
        dispatch(loginAction(userLoginInfo.data));
        dispatch(isLogin(true));

        if (isOnlyUserUpdate) {
          return
        }
        if (userLoginInfo?.data?.role.toLowerCase() !== "customer") {
          return (navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: "actionRestricted" }],
            })
          ));
        }
        if (!userLoginInfo?.data?.isPhoneNumberVerified) {
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: "bindPhone" }],
            })
          );
        }
        else {
          checkBio(userLoginInfo.data)
        }

      } else if (userLoginInfo?.status == 401) {
        navigation?.navigate("RelogIn");
        setIsOnboarding(false);
      }
      else {
        navigation?.navigate("SomethingWentWrong");
        setIsOnboarding(false);
      }
    } catch (error: any) {
      setLoading(false);
      setIsOnboarding(false);
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