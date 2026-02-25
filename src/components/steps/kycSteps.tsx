import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NEW_COLOR, WINDOW_WIDTH } from '../../constants/styels/variables';
import { SvgUri } from 'react-native-svg';
import { s } from '../../constants/styels/scale';
import { getThemedCommonStyles } from '../CommonStyles';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';

interface exchangeCardInfo {
  totalSteps: any,
  currentStep: any,
  stepContents: any
}

const KycStepComponent = ({ totalSteps, currentStep, stepContents }: exchangeCardInfo) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const renderSteps = () => {
    const steps = [];
    for (let i = 1; i <= totalSteps; i++) {
      const isCurrentStep = i === currentStep;
      const isCompletedStep = i < currentStep;

      const stepContent = isCurrentStep ? (
        <View style={[commonStyles.relative]}>
          <View style={{ backgroundColor: NEW_COLOR.STEPS_INACTIVE_BG, borderWidth: 1, borderColor: NEW_COLOR.TEXT_BLUE, height: 30, width: 30, borderRadius: 100 / 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <ParagraphComponent style={[commonStyles.textBlue, commonStyles.fw600, commonStyles.fs12, commonStyles.textCenter]} text={i.toString()} />
          </View>
          <View style={{ position: "absolute", minWidth: 90, bottom: i === totalSteps ? -20 : -40, left: -30, flexDirection: "row", justifyContent: "center", alignContent: "flex-start", alignItems: "flex-start" }}>
            <ParagraphComponent style={[commonStyles.fw600, commonStyles.textCenter, commonStyles.textBlue, commonStyles.fs12, commonStyles.textCenter]} text={stepContents[i - 1]} />
          </View>
        </View>
      ) : isCompletedStep ? (
        <View style={[commonStyles.relative]}>
          <SvgUri width={s(34)} height={s(34)} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/active_check.svg' />
          <View style={{ position: "absolute", bottom: -40, minWidth: 90, left: currentStep === 3 ? -35 : -30, flexDirection: "row", justifyContent: "center", alignItems: "flex-start" }}>
            <ParagraphComponent style={[commonStyles.textCenter, commonStyles.textBlue, { minHeight: 36 }]} text={stepContents[i - 1]} />
          </View>
        </View>
      ) : (
        <View style={[commonStyles.relative]}>
          <View style={{ height: s(34), width: s(34), borderRadius: 100 / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: NEW_COLOR.STEPS_BORDER_INACTIVE, backgroundColor: NEW_COLOR.STEPS_INACTIVE_BG }}>
            <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fw600, commonStyles.fs12]} text={i.toString()} />
          </View>
          <View style={{ position: "absolute", bottom: -40, minWidth: 90, left: -28, flexDirection: "row", justifyContent: "center", }}>
            <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fw600, commonStyles.fs12, { textAlign: "center", minHeight: 36, }]} text={stepContents[i - 1]} />
          </View>
        </View>
      );

      steps.push(
        <View
          key={i}
          style={[
            styles.stepCircle,
          ]}
        >
          {stepContent}
        </View>
      );

      if (i < totalSteps) {
        const lineColor = isCompletedStep ? NEW_COLOR.STEPS_ACTIVE_BORDER : NEW_COLOR.STEPS_INACTIVE_BORDER;
        steps.push(<View key={`line${i}`} style={[styles.stepLine, { backgroundColor: lineColor }]} />);
      }
    }
    return steps;
  };

  return <View style={styles.stepContainer}>{renderSteps()}</View>;
};

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: WINDOW_WIDTH - 100,
    marginLeft: "auto", marginRight: "auto",
    marginBottom: 50
  },
  stepCircle: {
    width: s(34),
    height: s(34),
    borderRadius: 15,
    backgroundColor: "transparent",
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
});

export default KycStepComponent;
