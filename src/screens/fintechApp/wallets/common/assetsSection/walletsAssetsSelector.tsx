// import { FiatAsset } from "../vaults/vaultsInterface";
import AssetSelector from "./AssetSelector";
import { useNavigation } from "@react-navigation/native";
import { FIAT_CONSTANTS } from "../../constant";
import { useSelector, useDispatch } from "react-redux";
import * as types from '../../../../../redux/actionTypes/actionsType';
import { FiatAsset } from "../vaults/interface";

const WalletsAssetsSelector = (props: any) => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const userInfo:any = useSelector((state: any) => state.userReducer?.userDetails);
  const handleItemPress = (item: FiatAsset): void => {
    if (props.route.params.screenType === 'deposit') {
      const actionType = item?.actionType?.toLowerCase() || '';
      if (actionType.includes(FIAT_CONSTANTS.PAYINFIAT)) {
        navigation.navigate(FIAT_CONSTANTS.WALLETS_FIAT_PAYINS_LIST, { data: item, amount: item?.amount, screenName: FIAT_CONSTANTS.WALLETS_ASSETS_SELECTOR });
      } else if (actionType.includes('bankaccountcreation') || actionType.includes('bankdepositfiat')) {
        if (item?.accountStatus?.toLowerCase() === 'approved' || item?.accountStatus?.toLowerCase() === 'submitted'||item?.accountStatus?.toLowerCase() ==='rejected'){
          navigation.navigate('Bank', { currency: item?.code, screenName: "WalletsAllCoinsList", screenType: null });
        }
          else {
          dispatch({ type: types.SET_NAVIGATION_SOURCE, payload: 'WalletsAssetsSelector' });
          navigation.navigate('CreateAccountInformation', { 
            selectedVault: item, 
            screenName: "WalletsAllCoinsListSelection",
            originalParams: props.route.params
          });
        }
      }
      else if (actionType.includes('depositfiat')&&item.code?.toLowerCase() === 'brl') {
        if (userInfo?.accountType.toLowerCase() !== 'personal') {
            navigation.navigate('BrlDepositView', {
              currency: item.code,
              screenName: props.route.params.screenName,
              selectedItem: item
            });
        } else {
          if (item?.accountStatus?.toLowerCase() === 'approved') {
            navigation.navigate('BrlDepositView', {
              currency: item.code,
              screenName: props.route.params.screenName,
              selectedItem: item
            });
          } else if (item?.accountStatus?.toLowerCase() == null) {
            navigation.navigate("BrlEnableProvider", {
              VaultData: item,
              screenName: props.route.params?.screenName
            });
          }
          else if(item?.accountStatus.toLowerCase()=='submitted') {
            navigation.navigate("PaymentPending", { 
              screenName: "Wallets",
              sourceScreen: "WalletsAssetsSelector"
            })
          }
               else if (item?.accountStatus.toLowerCase() == 'rejected') {
                navigation.navigate("PaymentPending", { 
                    screenName: "Wallets", 
                    status: "rejected", 
                    remarks: item?.remarks,
                    VaultData: item,
                    sourceScreen: "WalletsAssetsSelector"
                })
            }
          else {
            navigation.navigate("PaymentPending", { 
              screenName: "Wallets",
              sourceScreen: "WalletsAssetsSelector"
            })
          }
        }

      }
      else {
        props.navigation.navigate(FIAT_CONSTANTS.FIAT_DEPOSIT, { currency: item.code });
      }
    }

    else if (props.route.params.screenType === 'withdraw') {
      const actionType = item?.actionType?.toLowerCase() || '';
      if (actionType.includes(FIAT_CONSTANTS.PAYOUTFIAT)) {
        navigation.navigate("WalletsFiatPayoutWithdraw", {
          selectedVault: item,
          screenName: props.route.params?.screenName,
        });
      }
      else if (actionType.includes('bankaccountcreation') || actionType.includes('bankwithdrawfiat')) {
        if (item?.accountStatus?.toLowerCase() === 'approved') {
          navigation.navigate('SendAmount', { walletCode: item.code, name: item.name, selectedId: item.id, screenName: "WalletsAllCoinsList", });
        } else if (item?.accountStatus?.toLowerCase() == null) {
          dispatch({ type: types.SET_NAVIGATION_SOURCE, payload: 'WalletsAssetsSelector' });
          navigation.navigate('CreateAccountInformation', { 
            selectedVault: item, 
            screenName: "WalletsAllCoinsListSelection",
            originalParams: props.route.params
          });
        } else {
          navigation.navigate('Bank', { currency: item.code, screenName: "WalletsAllCoinsList" });
        }
      }
        else {
      props.navigation.navigate(FIAT_CONSTANTS.FIAT_WITHDRAW_FORM, { currency: item.code,screenName:"WalletsAllCoinsList" });
    }
    }
  
  };
  const handleBack = () => {
    navigation.navigate(FIAT_CONSTANTS.WALLETS_FIAT_PORTFOLIO, { animation: 'slide_from_left', initialTab: 1 });
  }
  return (
    <AssetSelector
      {...props}
      screenType={props.route.params.screenType}
      title={props.route.params.title}
      handleItemPress={handleItemPress}
      backNavigation={handleBack}
    />
  )
}
export default WalletsAssetsSelector;