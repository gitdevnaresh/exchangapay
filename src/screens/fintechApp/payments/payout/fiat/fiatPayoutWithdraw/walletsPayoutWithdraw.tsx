import { useEffect, useState } from "react";
import FiatPayout from "../fiatPayout"
import PaymentService from "../../../../../../apiServices/payments";

const WalletsFiatPayoutWithdraw = (props: any) => {
    const [filteredCoinsList, setFilteredCoinsList] = useState<any>([]);
    useEffect(() => {
        getVaultsList();
    }, [])

      const getVaultsList = async () => {
        try {
            let response: any;
            response = await PaymentService.payOutCurrencies('fiat');
            if (response?.ok) {
                setFilteredCoinsList(response.data);
            } 
        } catch (error) {};
    }
    return (
        <FiatPayout {...props}  allCoinsList={filteredCoinsList} screenName="WalletsAllAssets"/>
    )
}
export default WalletsFiatPayoutWithdraw;

