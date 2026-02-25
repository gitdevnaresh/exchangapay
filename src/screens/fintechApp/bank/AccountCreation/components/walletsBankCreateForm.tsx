import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import CreateAccountForm from "./createAccountForm"
import { useSelector } from "react-redux";
import { BackHandler } from "react-native";

const WalletsBankCreation = (props:any) => {
  const navigation = useNavigation<any>();
  const userInfo = useSelector((state: any) => state.userReducer.userDetails);
const targetScreen = userInfo?.accountType?.toLowerCase() === "business" ? "WalletsBankKybReview" : "WalletsKycPreview";

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, []);

  const handleBack = useCallback(() => {
    if (props?.route?.params?.screenName === "NoBankAccount") {
      navigation.navigate("CreateAccountInformation", { 
        screenName: props?.route?.params?.originalScreenName,
        selectedVault: props?.route?.params?.selectedVault,
        ...props?.route?.params?.originalParams,
        animation: 'slide_from_left' 
      });
      return true;
    }
    else{
      navigation.goBack();
    }
    return true;
  }, [navigation, props?.route?.params]);
  return (
    <CreateAccountForm {...props} screenName={props?.route?.params?.screenName} handleBack={handleBack} targetScreen={targetScreen}/>
  
  )
}
export default WalletsBankCreation