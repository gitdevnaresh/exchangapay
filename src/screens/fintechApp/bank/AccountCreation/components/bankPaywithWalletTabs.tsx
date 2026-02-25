import { useCallback } from "react";
import PayWithWalletTabs from "./payWithWalletTabs"
import { useSelector } from "react-redux";

const BankPaywithWalletTabs = (props:any) => {
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
        const backArrowButtonHandler = useCallback(() => {
            const isPersonal = userInfo?.accountType?.toLowerCase() === "personal";
            const targetScreen = isPersonal ? "BankKycProfilePreview" : "BankKybInfoPreview";
            props?.navigation.navigate(targetScreen, {...props?.route?.params, animation: "slide_from_left"} );
        }, [userInfo?.accountType]);
  return (
    <PayWithWalletTabs {...props} backArrowButtonHandler={backArrowButtonHandler}/>
  
  )
}
export default BankPaywithWalletTabs