import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ParagraphComponent from '../Paragraph/Paragraph';
import { NEW_COLOR, WINDOW_WIDTH } from '../../constants/theme/variables';
import { MenuIcon, ReviewedIcon, StatusIcon } from '../../assets/svg';

const { width } = Dimensions.get('window');
const isPad = width > 600;

const QuickLinkStepComponent = ({ totalSteps, currentStep, stepContents }) => {
  const renderSteps = () => {
    const steps = [];
    for (let i = 1; i <= totalSteps; i++) {
      const isCurrentStep = i === currentStep;
      const isCompletedStep = i < currentStep;
      const isSecondStep = i === 2;
      const isThirdStep = i === 3;

      // Determine the step content based on the step status
      const stepContent = isCurrentStep ? (
        <View>
          <View style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#000', height: 36, width: 36, borderRadius: 100 / 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {currentStep === 1 ? <MenuIcon /> : currentStep === 2 ? <ReviewedIcon /> : <StatusIcon />}
          </View>
          <View style={{ position: "absolute", bottom: isPad && currentStep === 3 ? -35 : isPad && currentStep === 1 ? -50 : isPad && currentStep === 2 ? -50 : currentStep === 2 ? -33 : -36, minWidth: isPad && currentStep === 1 ? 180 : isPad && currentStep === 3 ? 180 : currentStep ? 120 : 90, left: isPad && currentStep === 1 ? -60 : currentStep === 2 ? -42 : isPad && currentStep === 3 ? -80 : -30, flexDirection: "row", justifyContent: "center", minHeight: isPad ? 30 : 0 }}>
            <ParagraphComponent style={{ minHeight: 36, textAlign: "center" }} text={stepContents[i - 1]} />
          </View>
        </View>
      ) : isCompletedStep ? (
        <View >
          <Feather name="check" size={16} color="#fff" />
          <View style={{ position: "absolute", bottom: isPad && currentStep === 3 ? -60 : isPad && currentStep === 2 ? -60 : -45, minWidth: isPad && currentStep === 3 ? 180 : isPad && currentStep === 2 ? 180 : 90, left: isPad && currentStep === 3 ? -75 : isPad && currentStep === 2 ? -70 : currentStep === 3 ? -35 : -30, flexDirection: "row", justifyContent: "center", minHeight: isPad ? 50 : 30 }}>
            <ParagraphComponent style={{ minHeight: 36, textAlign: "center" }} text={stepContents[i - 1]} />
          </View>
        </View>
      ) : (
        <View>
          <View style={{ backgroundColor: NEW_COLOR.BG_PURPLERDARK, borderWidth: 1, borderColor: NEW_COLOR.BG_PURPLERDARK, height: 36, width: 36, borderRadius: 100 / 2, alignItems: 'center', justifyContent: 'center', flexDirection: "row" }}>
            {isSecondStep && <ReviewedIcon />}

            {isThirdStep && <StatusIcon />}

          </View>
          <View style={{ position: "absolute", bottom: isPad ? -55 : -40, minWidth: isPad && currentStep === 3 ? 180 : isPad && currentStep === 2 ? 160 : isPad && currentStep === 1 ? 130 : 120, left: isPad && currentStep === 2 ? -70 : isPad && currentStep === 1 ? -45 : -38, flexDirection: "row", justifyContent: "center", minHeight: isPad ? 50 : 30, }}>
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
        // Determine line color based on step status
        const lineColor = isCompletedStep ? NEW_COLOR.BG_ORANGE : NEW_COLOR.BG_PURPLERDARK;

        // Add connecting line between steps (excluding the last step)
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
    backgroundColor: '#ccc', // Default color
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedStep: {
    backgroundColor: NEW_COLOR.BG_ORANGE, // You can customize the background for completed steps
  },
  currentStep: {
    backgroundColor: '#007bff', // Current color
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
});

export default QuickLinkStepComponent;
