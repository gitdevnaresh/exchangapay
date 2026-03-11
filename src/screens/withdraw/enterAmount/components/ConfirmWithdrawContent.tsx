import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ViewComponent from '../../../../newComponents/view/view';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { CurrencyText } from '../../../../newComponents/textComponets/currencyText/currencyText';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { s } from '../../../../newComponents/theme/scale';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import AuthVerification from '../../../commonScreens/authentication';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { WithDrawServices } from '../../../../apiServices/withdrawApis/withdrawServices';
import { isErrorDispaly } from '../../../../utils/helpers';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../../assets/blobUrls';

interface ConfirmWithdrawContentProps {
  amount: string;
  coinCode: string;
  selectedPayee: {
    label: string;
    address: string;
    payeeId: string;
  } | null;
  selectedNetwork: {
    name: string;
    code: string;
  };
  feeDetails: {
    fee: string;
    concurrencyStamp?: string;
  };
  onClose: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

const ConfirmWithdrawContent: React.FC<ConfirmWithdrawContentProps> = ({
  amount,
  coinCode,
  selectedPayee,
  selectedNetwork,
  feeDetails,
  onClose,
  onLoadingChange,
}) => {
  const navigation = useNavigation<any>();
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const { logEvent } = useActionLogging();
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const userName = decryptAES(userInfo?.userName);
  const [loading, setLoading] = useState<boolean>(false);
  const [authOpen, setAuthOpen] = useState(false);
  const NEW_COLOR = useThemeColors();
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const [error,setError]=useState<string|null>();

  const handleWithdraw = async () => {
    setError(null);
    setLoading(true);
    onLoadingChange?.(true);
    let obj = {
      customerId: userInfo?.id,
      network: selectedNetwork.code,
      walletAddress: selectedPayee?.address || "",
      payeeId: selectedPayee?.payeeId || "",
      walletCode: coinCode,
      amount: amount,
      createdby: encryptAES(userName),
      ConcurrencyStamp: feeDetails?.concurrencyStamp || ""
    };
    try {
      const response = await WithDrawServices.Withdrawsave(obj);
      if (response.status === 200) {
        onClose();
        navigation.navigate({ name: "WithdrawSuccess", params: { transactionId: response?.data, amount: amount }, merge: true });
        const actionData: ActionLogParams = {
          screename: 'ConfirmWithdraw',
          actionName: 'Withdraw',
          actionType: 'Button',
          nextScreenName: "success page",
          actionObj: {
            postObj: { obj }
          }
        };
        logEvent('withdraw_button', actionData);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  const handlePopupClose = () => {
    onClose();
  }
  const handleAuthClose = () => {
    setAuthOpen(false);
    setLoading(false);
    onLoadingChange?.(false);
  };

  const handleAuthSuccess = (verifications: any) => {
    setAuthOpen(false);
    handleWithdraw();
  };

  const verifyAuth = () => {
    setError(null);
    setAuthOpen(true);
    setLoading(true);
  };
  return (
    <ViewComponent style={[commonStyles.flex1]}>
      {error&&<ErrorComponent message={error}/>}
      {/* Amount */}
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
        <TextMultiLanguage
          text="GLOBAL_CONSTANTS.CONFIRM_WITHDRAW"
          style={[commonStyles.fs16, commonStyles.fw700, reversCommonStyles.textWhite, commonStyles.mb16]}
        />
      </ViewComponent>
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter,commonStyles.mb16]}>
       <ViewComponent style={[]}>
        <ParagraphComponent style={[commonStyles.fs30, commonStyles.fw700, reversCommonStyles.textWhite]} text={"-"} />
        </ViewComponent>
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
        <CurrencyText 
          value={amount} 
          style={[commonStyles.fs30, commonStyles.fw700, reversCommonStyles.textWhite]} 
          symboles={true}
        />
        <ParagraphComponent
          text={coinCode}
          style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.alignCenter, commonStyles.mt12]}
        />
      </ViewComponent>
      </ViewComponent>

      {/* Details Section Title */}
      <TextMultiLanguage
        text="GLOBAL_CONSTANTS.WITHDRAWAL_INFORMATION"
        style={[commonStyles.fs14_24, commonStyles.fw700, reversCommonStyles.textWhite, commonStyles.mb24]}
      />

      <ViewComponent style={[commonStyles.bordered, reversCommonStyles.borderColor, commonStyles.p10]}>
        {/* Address */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb5]}>
          <TextMultiLanguage text="GLOBAL_CONSTANTS.ADDRESS" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
          <ParagraphComponent text={selectedPayee?.label ? decryptAES(selectedPayee.label) : ''} style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite]} numberOfLines={1} />
        </ViewComponent>

        {/* Network */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb5]}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.NETWORK"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} numberOfLines={1} />
          <ParagraphComponent text={selectedNetwork?.name} style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite]} numberOfLines={1} />
        </ViewComponent>

        {/* Fee */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb5]}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.WITHDRAW_FEE"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} numberOfLines={1} />
          <ParagraphComponent text={`${feeDetails?.fee} ${coinCode}`} style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite]} numberOfLines={1} />
        </ViewComponent>
      </ViewComponent>

      {/* Warning Message */}
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.mt16, commonStyles.gap12, commonStyles.p8, commonStyles.mb16]}>
        <ImageUri  uri={COMMON_SVG_URLS.shieldIcon} width={s(24)} height={s(24)}/>
        <TextMultiLanguage text={"GLOBAL_CONSTANTS.WITHDRAW_WARNING"} style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite,commonStyles.flex1]} />
      </ViewComponent>
      <ViewComponent style={[commonStyles.flex1]}/>
         <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16,commonStyles.flex1,commonStyles.sectionGap]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CANCEL"}
                            onPress={handlePopupClose}
                            solidBackground={true}
                            disable={loading}
                        />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CONFIRM"}
                            onPress={verifyAuth}
                            customContainerStyle={[reversCommonStyles.bg_yellow, reversCommonStyles.rounded100, { height: s(55) }]}
                            customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack]}
                            loading={loading}
                            disable={loading}
                        />
                    </ViewComponent>
                </ViewComponent>
      {authOpen && (
        <AuthVerification 
          onClose={handleAuthClose} 
          onSuccess={handleAuthSuccess} 
          feature={'Withdraw'} 
        />
      )}
    </ViewComponent>
  );
};

export default ConfirmWithdrawContent;