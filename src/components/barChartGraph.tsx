import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const BarChartGraph = ({ data }: any) => {
    const [graphData,setGraphData] = useState<any>(data)
    const formatXNumber = (value: any) =>{
        if(typeof value ==="string"){
            return value.substring(0,3)
        }else{
            return value
        }
    }

    useEffect(()=>{
        if(data.labels && data.labels.length>0){
        const info = data.labels.map((item:any)=>formatXNumber(item))
        setGraphData({...graphData,labels:[...info]})
        }
    },[])

    return (<BarChart
                    data={graphData}
                    width={Dimensions.get('window').width - 40}
                    height={200}
                    yAxisLabel="$"
                    withInnerLines={false}
                    withVerticalLabels={true}
                    verticalLabelRotation={0}
                    chartConfig={{
                      backgroundColor: 'linear-gradient(180deg, #0062FF 50.74%, rgba(255, 255, 255, 0.0001) 100%)',
                      backgroundGradientFrom: '#131114',
                      backgroundGradientTo: '#131114',
                      decimalPlaces: 0,
                      barPercentage: 0.3,
                      color: (opacity = 1) => `#1B59F8`,
                      labelColor: (opacity = 1) => `#838383`,
                    }}
                    style={{
                      marginVertical: 8,
                      borderRadius: 10
                  }}
                  />)
};

export default BarChartGraph;
