import { useCallback } from "react";
import PayWithWalletTabs from "./payWithWalletTabs"
import { useSelector } from "react-redux";

const WalletsPaywithWalletTabs = (props:any) => {
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
        const backArrowButtonHandler = useCallback(() => {
            const isPersonal = userInfo?.accountType?.toLowerCase() === "personal";
            const targetScreen = isPersonal ? "WalletsKycPreview" : "WalletsBankKybReview"
            props?.navigation.navigate(targetScreen, { ...props?.route?.params, animation: "slide_from_left" });
        }, [props?.navigation, props?.route?.params, userInfo?.accountType]);
  return (
    <PayWithWalletTabs {...props} backArrowButtonHandler={backArrowButtonHandler} />
  
  )
}
export default WalletsPaywithWalletTabs