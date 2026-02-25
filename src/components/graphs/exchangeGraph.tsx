import React from "react";
import { View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../CommonStyles";

interface LineDataProps {
  lineData: any[];
  screenName?: string;
  style?: any;
}

const ExchangeCurvedGraph: React.FC<LineDataProps> = ({ lineData = [], screenName, style }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const customLabel = (val: string) => {
    return (
      <View style={{ width: 80, marginLeft: 7 }}>
        <ParagraphComponent
          style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.ml8]}
        >
          {val}
        </ParagraphComponent>
      </View>
    );
  };

  const exchangeFormateData = lineData && lineData?.map((item: any) => ({
    value: item?.amount,
    labelComponent: () => customLabel(item?.days),
  }));

  const maxValue = Math.max(...exchangeFormateData.map((item) => item.value));
  const minValue = Math.min(...exchangeFormateData.map((item) => item.value));
  const noOfSections = 5;

  const step = Math.ceil((maxValue - minValue) / noOfSections / 10000) * 10000; // Round step to nearest 10k
  const yAxisLabels = Array.from({ length: noOfSections + 1 }, (_, i) => {
    const value = maxValue - i * step;
    return value >= 1000
      ? `${Math.round(value / 1000)}k` // Format as 'k' for values >= 1000
      : `${(value / 1000).toFixed(1)}k`; // Format as '0.5k' for smaller values
  });
  return (
    <View>
      <LineChart
        areaChart
        maxValue={maxValue}
        minValue={minValue}
        // yAxisOffset={5}
        data={exchangeFormateData || []}
        hideDataPoints
        hideRules
        color="#fff"
        width={305}
        startFillColor="rgba(0, 224, 255, 0.4)"
        endFillColor="#e5e7eb"
        startOpacity={0.4}
        endOpacity={0.1}
        adjustToWidth={true}
        noOfSections={noOfSections}
        yAxisTextStyle={[commonStyles.textWhite, commonStyles.fs12]}
        textShiftX={-5}
      />
    </View>
  );
};

export default ExchangeCurvedGraph;
