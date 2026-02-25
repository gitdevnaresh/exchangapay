import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { LineChart } from "react-native-gifted-charts"
interface lineDataProps{
    lineData:[];
    screenName?:string;
    style?:any;
}
const CurvedGraph : React.FC<lineDataProps>=({lineData,screenName,style}) => {
   
      const [formattedData,setFormattedData] =useState([]);
      const [maxVal] =useState(Math.max(...lineData))
      const [minVal] =useState(Math.min(...lineData)/2)
      useEffect(()=>{
         const finalData = lineData?.map(value => ({ value }));
         setFormattedData(finalData);
      },[lineData])
    
    return (
        <View>
            <LineChart
                areaChart
                initialSpacing={0}
                maxValue={maxVal}
                yAxisOffset={minVal}
                noOfSections={20}
                data={formattedData||[]}
                spacing={screenName=='dashBoard'?0.6:0.9}
                hideDataPoints
                hideRules
                color="red"
                width={screenName=='dashBoard' ? 120  : 500}
                height={screenName=='dashBoard' ? 20 : 60}
                startFillColor="green"
                endFillColor={'#87CEEB'}
                startOpacity={0.4}
                endOpacity={0.1}
                adjustToWidth={true}
            />
        </View>
    );
};
export default CurvedGraph;