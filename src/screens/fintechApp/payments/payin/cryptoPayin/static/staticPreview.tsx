import React from "react";
import { Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import Container from '../../../../../../components/container/container';
import { s } from '../../../../../../constants/styels/scale';
import { PAYMENT_LINK_CONSTENTS } from '../../../constants';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import ButtonComponent from '../../../../../../components/buttons/button';

interface StaticPreviewProps {
  visible: boolean;
  data: { renderedTemplate: string };
  onClose: () => void;
  title?: string;
}

const StaticPreview: React.FC<StaticPreviewProps> = ({ visible, data, onClose, title }) => {
  const htmlTemplate = data?.renderedTemplate;
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (

    <Modal animationType="slide"
      transparent={false}
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
        <Container style={[commonStyles.container, commonStyles.modalpt]}>
          <PageHeader title={title || PAYMENT_LINK_CONSTENTS.PREVIEW} onBackPress={onClose} />
          <WebView
            originWhitelist={['*']}
            tagsStyles={{
              body: {
                color: NEW_COLOR.TEXT_BLACK,
                fontSize: s(14),
                fontFamily: "Manrope-Regular",
                backgroundColor: NEW_COLOR.SCREENBG_BLACK
              },
            }}
            source={{ html: htmlTemplate }}
            style={{ flex: 1 }} />

          <View style={[commonStyles.mb43]} />
          <ButtonComponent title={PAYMENT_LINK_CONSTENTS.STATIC_PAYMENT_LINK_CONSTANTS.CLOSE}
            customTitleStyle={undefined}
            icon={undefined}
            onPress={onClose} />

        </Container>
      </SafeAreaView>
    </Modal>

  );
};

export default StaticPreview;