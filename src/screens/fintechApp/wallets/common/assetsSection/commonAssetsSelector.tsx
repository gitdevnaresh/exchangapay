import { useNavigation } from "@react-navigation/native";
import { FiatAsset } from "../vaults/vaultsInterface";
import AssetSelector from "./AssetSelector";

const CoomonAssetsSelector = (props: any) => {
      const navigation = useNavigation<any>();
     const handleItemPress = (item: FiatAsset): void => {
        if (props.route.params.screenType === 'deposit') {
          props.navigation.navigate('FiatDeposit', { currency: item.code });
        } else {
          props.navigation.navigate('FiatWithdrawForm', { currency: item.code });
        }
      };
       const handleBack = () => {
          navigation.navigate('AllAssetsTabs', { animation: 'slide_from_left', initialTab: 1 });
        }
    return(
        <AssetSelector    
         {...props}
        screenType={props.route.params.screenType} 
        title={props.route.params.title}
        handleItemPress={handleItemPress}
        backNavigation={handleBack}
        />
    )
}
export default CoomonAssetsSelector;