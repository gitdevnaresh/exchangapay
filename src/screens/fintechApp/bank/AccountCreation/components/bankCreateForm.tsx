import { useNavigation } from "@react-navigation/native";
import CreateAccountForm from "./createAccountForm"
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { BackHandler } from "react-native";
import { walletsTabsNavigation } from '../../../../../../configuration';
import { Logger } from "../../../../../utils/Logger";

const BankCreationForm = (props: any) => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: any) => state.userReducer.userDetails);
  const targetScreen = userInfo?.accountType?.toLowerCase() === "business" ? "BankKybInfoPreview" : "BankKycProfilePreview";
  useEffect(() => {
    try {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => backHandler.remove();
    } catch (error) {
      Logger.error('BackHandler useEffect failed', { error });
    }
  }, []);
  const handleBack = () => {
    try {
      if (props?.route?.params?.screenName === "WalletsAllCoinsList") {
        const initialTab = props?.route?.params?.fromWalletsFiat ? 1 : 0;
        navigation.navigate(walletsTabsNavigation, { initialTab: initialTab, animation: 'slide_from_left' })
        return true;
      }
      if (props?.route?.params?.screenName === "Dashboard") {
        dispatch({ type: 'SET_HAS_ACCOUNT_CREATION_FEE', payload: null });
        navigation.navigate("Dashboard", { animation: 'slide_from_left', initialTab: "GLOBAL_CONSTANTS.HOME" });
        return true;
      }
      if (props?.route?.params?.screenName === "NoBankAccount") {
        navigation.navigate("CreateAccountInformation", { animation: 'slide_from_left', });
        return true;
      }
      else if (props?.route?.params?.screenName === "WalletsAllCoinsList") {
        const initialTab = props?.route?.params?.fromWalletsFiat ? 1 : 0;
        navigation.navigate(walletsTabsNavigation, { initialTab: initialTab, animation: 'slide_from_left' })
        return true;
      }
      else {
        dispatch({ type: 'SET_IDENTITY_DOCUMENTS', payload: [] });
        dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: [] });
        dispatch({ type: 'SET_UBO_FORM_DATA', payload: [] });
        dispatch({ type: 'SET_PERSONAL_DOB', payload: null });
        dispatch({ type: 'SET_DIRECTOR_FORM_DATA', payload: [] });
        dispatch({ type: 'SET_DOCUMENTS_DATA', payload: null });
        dispatch({ type: 'SET_HAS_ACCOUNT_CREATION_FEE', payload: null });
        dispatch({ type: 'SET_IP_ADDRESS', payload: '' });
        dispatch({ type: 'SET_SECTORS', payload: '' });
        dispatch({ type: 'SET_TYPES', payload: '' });
        navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.BANK", animation: 'slide_from_left' });
      }
    } catch (error) {
      Logger.error('handleBack failed', { error, screenName: props?.route?.params?.screenName });
    }
    return true;
  };
  return (
    <CreateAccountForm {...props} handleBack={handleBack} targetScreen={targetScreen} />

  )
}
export default BankCreationForm