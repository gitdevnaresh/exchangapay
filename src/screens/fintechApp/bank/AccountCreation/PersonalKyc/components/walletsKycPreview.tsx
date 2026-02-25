import { useCallback } from "react";
import { useDispatch } from "react-redux";
import BankKycProfilePreview from "./kycProfilePriview";
import { CommonActions, useNavigation } from "@react-navigation/native";

const WalletsKycPreview = (props:any) => {
const navigation=useNavigation<any>();
const dispatch=useDispatch()
 const handleBack = useCallback(() => {
        dispatch({ type: 'SET_IDENTITY_DOCUMENTS', payload: [] });
        dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: [] });
        dispatch({ type: 'SET_PERSONAL_DOB', payload: null });
         navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "WalletsBankCreation", params: { 
                    ...props?.route?.params,
                    animation: 'slide_from_left' } }],
            })
        );
     }, [navigation, dispatch]);
  return (
    <BankKycProfilePreview {...props} screenName={props?.route?.params?.screenName} handleBack={handleBack} targetScreen="WalletsPaywithWalletTabs" />
  
  )
}
export default WalletsKycPreview