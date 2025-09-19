import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const PriceGraph = ({ data }:any) => {

    const formatNumber = (value:any) => {
        if (value >= 1000 && value < 1000000) {
          return (value / 1000).toFixed(2) + 'k';
        } else if (value >= 1000000) {
          return (value / 1000000).toFixed(2) + 'M';
        }
        return value.toString();
      };
    
  return (
    <LineChart
      data={data}
      width={Dimensions.get('window').width - 40}
      height={300}
      yAxisLabel="$"
      chartConfig={{
        backgroundGradientFrom: '#000',
        backgroundGradientTo: '#000',
        decimalPlaces: 2,
        color: (opacity = 1) => `#FE9735`,
        labelColor: (opacity = 1) => `#838383`,
        style: {
          borderRadius: 2,
        },
        propsForDots: {
          r: '0',
          strokeWidth: '2',
          stroke: '#ffa726',
        },
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 10
      }}
      withInnerLines={false}
      formatYLabel={(val)=> formatNumber(val)}
    />
  );
};

export default PriceGraph;
