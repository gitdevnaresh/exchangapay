
import FiatPayinAdd from '.';
import { FIAT_PAYIN_CONSTANTS } from '../constants';


const WalletsAddFiatPayin = (props: any) => {
  return <FiatPayinAdd
    {...props}
    navigation={FIAT_PAYIN_CONSTANTS.WALLETS_FIAT_PAYIN_LIST}
    screenType={FIAT_PAYIN_CONSTANTS.DEPOSIT}
    screenName={props?.route?.params?.screenName}
  />;
};

export default WalletsAddFiatPayin;