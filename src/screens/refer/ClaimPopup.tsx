import React from 'react';
import ViewComponent from '../../newComponents/view/view';
import PopupOrSheet from '../../newComponents/models/PopupOrSheet';
import ButtonComponent from '../../newComponents/buttons/button';
import TextMultiLanguage from '../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ImageUri from '../../newComponents/imageComponents/image';
import ErrorComponent from '../../newComponents/errorDisplay/errorDisplay';
import { COMMON_SVG_URLS } from '../../assets/blobUrls';
import { s } from '../../constants/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import { CurrencyText } from '../../newComponents/textComponets/currencyText/currencyText';

interface ClaimPopupProps {
  claimSheetRef: any;
  claimAmountLoader: boolean;
  error: string;
  setError: (error: string) => void;
  onClaim: () => void;
  onClose: () => void;
  amount?: number;
  currency?: string;
}

const ClaimPopup: React.FC<ClaimPopupProps> = ({
  claimSheetRef,
  claimAmountLoader,
  error,
  setError,
  onClaim,
  onClose,
  amount,
  currency
}) => {
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reverseCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const commonStyles = getThemedCommonStyles(useThemeColors());

  const closeError = () => {
    setError("")
  }
  return (
    <PopupOrSheet
      showCloseIcon={false}
      ref={claimSheetRef}
      height={s(350)}
      draggable={!claimAmountLoader}
      closeOnDragDown={!claimAmountLoader}
      closeOnPressMask={!claimAmountLoader}
      showCloseIconAndTittle={false}
    >
      <ViewComponent>
        {error && <ErrorComponent message={error} onClose={closeError} />}
        <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
          <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
        </ViewComponent>
          <TextMultiLanguage
            text={"GLOBAL_CONSTANTS.ARE_YOU_SURE_YOU_WANT_TO_CLAIM"}
            style={[reverseCommonStyles.fw700, reverseCommonStyles.textWhite, reverseCommonStyles.fs16, commonStyles.textCenter,commonStyles.mb16
            ]} />
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.dflex, commonStyles.flexRow, commonStyles.flexWrap, commonStyles.justifyCenter]}>
          <TextMultiLanguage
            text={"GLOBAL_CONSTANTS.ARE_YOU_SURE_YOU_WANT_TO_CLAIM"}
            style={[reverseCommonStyles.fw400, reverseCommonStyles.textWhite, reverseCommonStyles.fs14, commonStyles.textCenter
            ]} />
          <CurrencyText
            value={amount || 0}
            currency={currency}
            symboles={true}
            style={[reverseCommonStyles.fw700, reverseCommonStyles.textWhite, reverseCommonStyles.fs14, commonStyles.textCenter
            ]} />
          <TextMultiLanguage
            text={"GLOBAL_CONSTANTS.INTO_YOUR_ACCOUNT"}
            style={[reverseCommonStyles.fw400, reverseCommonStyles.textWhite, reverseCommonStyles.fs14, commonStyles.textCenter
            ]} />
        </ViewComponent>

        <ViewComponent style={[reverseCommonStyles.mb16]} />
        <ViewComponent
          style={[reverseCommonStyles.dflex, reverseCommonStyles.flexRow, reverseCommonStyles.gap16, reverseCommonStyles.mt16]}
        >
          <ViewComponent style={[reverseCommonStyles.flex1]}>
            <ButtonComponent
              title="GLOBAL_CONSTANTS.CANCEL"
              onPress={onClose}
              solidBackground={true}
              disable={claimAmountLoader}
            />
          </ViewComponent>
          <ViewComponent style={[reverseCommonStyles.flex1]}>
            <ButtonComponent
              title="GLOBAL_CONSTANTS.CONFIRM"
              onPress={onClaim}
              loading={claimAmountLoader}
              disable={claimAmountLoader}
            />
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>
    </PopupOrSheet>
  );
};

export default ClaimPopup;