import { stubString } from 'lodash';
import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const LineChartGraph = ({ data }: any) => {

    const formatYNumber = (value: any) => {
        if (value >= 1000 && value < 1000000) {
            return (value / 1000).toFixed(2) + 'k';
        } else if (value >= 1000000) {
            return (value / 1000000).toFixed(2) + 'M';
        }
        return value.toString();
    };
    const formatXNumber = (value: any) =>{
        if(typeof value ==="string"){
            return value.substring(0,3)
        }else{
            return value
        }
    }

    return (
        <LineChart
            data={data}
            width={Dimensions.get('window').width - 20} // from react-native
            height={220}
            yAxisLabel="$"
            chartConfig={{
                backgroundColor: "linear-gradient(180deg, #0062FF 50.74%, rgba(255, 255, 255, 0.0001) 100%)",
                backgroundGradientFrom: "#131114",
                backgroundGradientTo: "#131114",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `#1B59F8`,
                labelColor: (opacity = 1) => `#838383`,
                style: {
                    borderRadius: 16
                },
                propsForDots: {
                    r: "1",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                }
            }}
            bezier
            style={{
                marginVertical: 8,
                borderRadius: 10
            }}
            withInnerLines={false}
            formatYLabel={(val) => formatYNumber(val)}
            formatXLabel={(val) => formatXNumber(val)}
        />
    );
};

export default LineChartGraph;
