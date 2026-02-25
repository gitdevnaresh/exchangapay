import React from "react";
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { s } from '../../../../constants/styels/scale';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import ViewComponent from '../../../../components/view/view';
// import { CardsArthaMoney } from '../../../../assets/svg';
import AntDesign from '@expo/vector-icons/AntDesign';
import { t } from 'i18next';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import { ApplyCardImage } from '../../../../assets/svg';

interface CardsApplyCardSectionProps {
  handleApplycard: () => void;
}

const CardsApplyCardSection: React.FC<CardsApplyCardSectionProps> = ({
  handleApplycard,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  return (
    <ViewComponent style={[commonStyles.cardbannerbg]}>
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
        <CommonTouchableOpacity onPress={handleApplycard} style={[commonStyles.flex1]}>
          <ViewComponent style={[commonStyles.px10]} >
            <ParagraphComponent
              text={'GLOBAL_CONSTANTS.GET_NEW_CARD_TODAY'}
              style={[
                commonStyles.cardbannertext,
              ]}
            />
            <ViewComponent
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.gap4,
              ]}
            >
              <ParagraphComponent
                text={t('GLOBAL_CONSTANTS.APPLY_CARDS')}
                style={[commonStyles.sectionLink]}
              />
              <AntDesign name="arrowright" size={s(20)} style={[commonStyles.arrowiconprimary]} />
            </ViewComponent>
          </ViewComponent>
        </CommonTouchableOpacity>
        <ViewComponent >
          <ViewComponent style={[commonStyles.cardbannerimg]} >
            <ApplyCardImage />
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>
    </ViewComponent>













  );
};

export default CardsApplyCardSection;