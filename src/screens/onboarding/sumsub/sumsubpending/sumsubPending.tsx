import React from 'react';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import ViewComponent from '../../../../newComponents/view/view';
import Container from '../../../../newComponents/container/container';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../../newComponents/buttons/button';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';




const KycPendingScreen = ({
  onRefresh,
  onGoHome,
  loading,
}: {
  onRefresh: () => void;
  onGoHome: () => void;
  loading?: boolean;
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  return (
    <ViewComponent  style={[commonStyles.screenBg,commonStyles.flex1]}>
      {loading?(<SwokipayDashboardLoader/>)
   :(  <Container  style={{ flex: 1, justifyContent: 'center'}}>
        <TextMultiLanguage
          text="GLOBAL_CONSTANTS.KYC_PENDING"
          style={[
            commonStyles.textWhite,
            commonStyles.fs24,
            commonStyles.fw700,
            commonStyles.textCenter,
          ]}
        />
        <ViewComponent style={[commonStyles.mb24]}/>
        <TextMultiLanguage
          text="GLOBAL_CONSTANTS.KYC_PENDING_DESC"
          style={[
            commonStyles.textGrey,
            commonStyles.fs16,
            commonStyles.fw400,
            commonStyles.mb24,
            commonStyles.textCenter,
          ]}
        />

          <ViewComponent style={[commonStyles.mb24]}/>
        <ButtonComponent
          title="GLOBAL_CONSTANTS.REFRESH"
          onPress={onRefresh}
          loading={loading}
        />
        <ViewComponent style={[commonStyles.mb24]}/>
        <ButtonComponent
          title="GLOBAL_CONSTANTS.GO_TO_HOME"
          onPress={onGoHome}
    
        />
      </Container>)}
    </ViewComponent>
  );
};

export default KycPendingScreen;