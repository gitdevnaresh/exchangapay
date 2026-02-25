import React from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { NEW_COLOR, WINDOW_WIDTH } from '../../constants/styels/variables';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';

interface exchangeCardInfo {
  totalSteps: any,
  currentStep: any,
  stepContents: any
}

const StepComponent = ({ totalSteps, currentStep, stepContents }: exchangeCardInfo) => {
  const renderSteps = () => {
    const steps = [];
    for (let i = 1; i <= totalSteps; i++) {
      const isCurrentStep = i === currentStep;
      const isCompletedStep = i < currentStep;

      const stepContent = isCurrentStep ? (
        <View>
          <View style={{ backgroundColor: '#0484FF', borderWidth: 1, borderColor: '#000', height: 30, width: 30, borderRadius: 100 / 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ backgroundColor: '#fff', height: 8, width: 8, borderRadius: 100 / 2, }}>

            </View>
          </View>
          <View style={{ position: "absolute", bottom: currentStep === 2 ? -20 : -36, minWidth: 90, left: -30, flexDirection: "row", justifyContent: "center" }}>
            <ParagraphComponent style={{ textAlign: "center" }} text={stepContents[i - 1]} />
          </View>
        </View>
      ) : isCompletedStep ? (
        <View >
          <Feather name="check" size={16} color="#fff" />
          <View style={{ position: "absolute", bottom: -45, minWidth: 90, left: currentStep === 3 ? -35 : -30, flexDirection: "row", justifyContent: "center" }}>
            <ParagraphComponent style={{ minHeight: 36 }} text={stepContents[i - 1]} />
          </View>
        </View>
      ) : (
        <View>
          <View style={{ backgroundColor: NEW_COLOR.STEPS_INACTIVE_BG, borderWidth: 1, borderColor: '#555555', height: 30, width: 30, borderRadius: 100 / 2, alignItems: 'center', justifyContent: 'center' }}>
          </View>
          <View style={{ position: "absolute", bottom: -40, minWidth:90, left: -28, flexDirection: "row", justifyContent: "center", }}>
            <ParagraphComponent style={{ textAlign: "center", minHeight: 36, }} text={stepContents[i - 1]} />
          </View>
        </View>
      );

      steps.push(
        <View
          key={i}
          style={[
            styles.stepCircle,
            isCompletedStep ? styles.completedStep : null,
            isCurrentStep ? styles.currentStep : null,
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
    marginBottom: 60
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedStep: {
    backgroundColor: '#67BE23',borderWidth:1,borderColor:NEW_COLOR.TEXT_WHITE
  },
  currentStep: {
    backgroundColor: '#007bff',
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
});

export default StepComponent;
