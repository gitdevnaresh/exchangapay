import { CommonActions, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import BankKybInfoPreview from "./kybReview";
import { useDispatch } from "react-redux";

const WalletsBankKybReview = (props:any) => {
  const navigation = useNavigation<any>();
 const dispatch = useDispatch();
    const handleBack = useCallback(() => {
         dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: [] });
         dispatch({ type: 'SET_UBO_FORM_DATA', payload: [] });
         dispatch({ type: 'SET_DIRECTOR_FORM_DATA', payload: [] });
         dispatch({ type: 'SET_DOCUMENTS_DATA', payload: null });
         dispatch({ type: 'SET_DELETED_API_ITEMS', payload: [] });
 
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
    <BankKybInfoPreview {...props} route={props.route} handleBack={handleBack} targetScreen="WalletsPaywithWalletTabs"/>
  
  )
}
export default WalletsBankKybReview