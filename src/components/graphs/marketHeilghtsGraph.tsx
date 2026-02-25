// components/MarketHighlights.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import Loadding from '../skelton/skeltons';
import { MarketHeilightsLoader } from '../../skeletons/cardsSkeletons';
import NoDataComponent from '../noData/noData';
import { getThemedCommonStyles } from '../CommonStyles';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { NEW_COLOR } from '../../constants/styels/variables';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { Logger } from '../../utils/Logger';
interface CoinCodeInterface {
  name?: string;
  coinName?: string;
}
const MarketHighlights = ({ coinCode }: { coinCode: CoinCodeInterface }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0, label: '' });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const transactionCardContent = MarketHeilightsLoader();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { width: screenWidth } = Dimensions.get('window');
  const TIME_RANGES = [
    { label: '1D', period: '24_hours', apiDays: '1' },
    { label: '7D', period: '7_days', apiDays: '7' },
    { label: '1M', period: '30_days', apiDays: '30' },
    { label: '3M', period: '90_days', apiDays: '90' },
    { label: '1Y', period: '365_days', apiDays: '365' },
  ];
  const [selectedRange, setSelectedRange] = useState('1D');

  const isStablecoin = (code: string) => ['usdt', 'tether', 'usdc', 'dai', 'busd'].includes(code?.toLowerCase());

  const chartConfig = {
    backgroundColor: commonStyles.marketHelightsBackgroundColor?.backgroundColor,
    backgroundGradientFrom: commonStyles.marketHelightsBackgroundColor?.backgroundColor,
    backgroundGradientTo: commonStyles?.marketHelightsBackgroundColor?.backgroundColor,
    decimalPlaces: isStablecoin(coinCode.name ?? coinCode?.coinName) ? 4 : 2,
    color: (opacity = 1) => `rgba(255,50,50,${opacity})`,
    labelColor: (opacity = 1) => `rgba(102,102,102,${opacity})`,
    style: { borderRadius: 8 },
    fillShadowGradient: '#FFA07A',
    fillShadowGradientOpacity: 0.5,
    propsForDots: {
      r: "0",
      strokeWidth: "0",
      stroke: "#FFA07A",
      fill: "#FFA07A"
    }
  };

  const formatChartData = (data: any[]) => {
    if (!data.length) return { labels: [], datasets: [{ data: [] }] };
    const maxLabels = 6;
    const step = Math.ceil(data.length / maxLabels);
    const labels = data.filter((_: any, ix: number) => ix % step === 0 || ix === data.length - 1).map(item => item.label);
    const values = data.map(item => item.value);
    return {
      labels,
      datasets: [{
        data: values,
        color: (opacity = 1) => `rgba(255,160,122,${opacity})`,
        strokeWidth: 2,
      }]
    };
  };

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const id = coinCode?.name?.toLowerCase() || coinCode?.coinName?.toLowerCase();
      const range = TIME_RANGES.find(r => r.label === selectedRange);
      // Using a more reliable public API endpoint from CoinGecko
      const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${range?.apiDays}`);

      const stats = res.data.prices || [];
      const formatted = stats.map((tuple: [number, number]) => {
        const dt = new Date(tuple[0]);
        const label = selectedRange === '1D'
          ? dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
          : selectedRange === '7D' || selectedRange === '1M'
            ? dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        return { value: parseFloat(tuple[1].toFixed(isStablecoin(coinCode.name || coinCode?.coinName) ? 5 : 2)), label };
      });
      setChartData(formatted);
    } catch (error) {
      Logger.error("Error fetching market data:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [coinCode.name || coinCode?.coinName, selectedRange]);

  const formatYAxisLabel = (val: any) => {
    const n = parseFloat(val);
    if (isNaN(n)) return val;
    if (isStablecoin(coinCode?.name ?? coinCode?.coinName)) return n.toFixed(4);
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
    return n.toFixed(2);
  };

  const renderChart = () => {
    if (loading) return <Loadding contenthtml={transactionCardContent} />;
    if (!chartData.length) return <NoDataComponent Description="No data available" />;

    const data = formatChartData(chartData);

    // --- FIX START: Manually calculate Y-axis range to fix scaling ---
    const values = chartData.map(c => c.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Add padding to min/max to ensure the line is visible and not flat against the edge
    const range = maxValue - minValue;
    let yAxisMin, yAxisMax;

    if (range < 0.005) { // If the price range is very small (typical for stablecoins in 1D)
      const padding = 0.001; // Add a small fixed padding
      yAxisMin = minValue - padding;
      yAxisMax = maxValue + padding;
    } else { // For larger price ranges
      const padding = range * 0.1; // Add 10% padding
      yAxisMin = minValue - padding;
      yAxisMax = maxValue + padding;
    }
    // --- FIX END ---

    return (
      <TouchableOpacity activeOpacity={1} onPress={() => { setTooltipPos(prev => ({ ...prev, visible: false })); setSelectedIndex(null); }}>
        <LineChart
          data={data}
          width={screenWidth}
          height={200}
          chartConfig={chartConfig}
          bezier
          formatYLabel={formatYAxisLabel}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={false}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          withDots={true}
          withShadow={true}
          fromZero={false} // This is important
          // --- FIX START: Apply the calculated min/max to the chart ---
          yAxisMin={yAxisMin}
          yAxisMax={yAxisMax}
          // --- FIX END ---
          segments={4}
          style={styles.chartStyle}
          onDataPointClick={({ value, x, y, index }) => {
            const item = chartData[index];
            if (item) {
              setSelectedIndex(index);
              setTooltipPos({ x, y, visible: true, value: item.value, label: item.label });
            }
          }}
          getDotColor={(dataPoint, dataPointIndex) => {
            return dataPointIndex === selectedIndex ? '#FFA07A' : 'transparent';
          }}
        />
        {tooltipPos.visible && (
          <>
            <View style={[styles.vline, { left: tooltipPos.x }]} />
            <View style={{
              position: 'absolute',
              left: tooltipPos.x,
              top: 16, // Default chart padding
              height: 152, // Chart height (200) - top padding (16) - bottom padding (32)
              width: 1,
              backgroundColor: '#FFA07A'
            }} />
            <View style={[styles.tooltip, { left: tooltipPos.x - 50, top: tooltipPos.y - 60 }]}>
              <ParagraphComponent style={{ color: NEW_COLOR.TEXT_ALWAYS_BLACK, fontSize: 14, marginBottom: 6, textAlign: 'center' }}>
                {tooltipPos.label}
              </ParagraphComponent>
              <View style={[commonStyles.graphpointer, commonStyles.rounded50, { paddingHorizontal: 14, paddingVertical: 6 }]}>
                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textCenter, commonStyles.textAlwaysWhite]}>
                  {`$${tooltipPos.value.toFixed(isStablecoin(coinCode.name || coinCode?.coinName) ? 4 : 2)}`}
                </ParagraphComponent>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginVertical: 16 }}>
      {renderChart()}
      <View style={styles.rangeContainer}>
        {TIME_RANGES.map(r => (
          <TouchableOpacity
            key={r.label}
            style={[styles.timeRangeBtn, selectedRange === r.label && styles.timeRangeBtnSelected]}
            onPress={() => {
              setSelectedRange(r.label);
              setTooltipPos(prev => ({ ...prev, visible: false }));
              setSelectedIndex(null);
            }}
          >
            <ParagraphComponent style={[styles.rangeText, selectedRange === r.label && styles.rangeTextSelected]}>
              {r.label}
            </ParagraphComponent>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartStyle: { paddingRight: 0, paddingLeft: 0, marginLeft: -4, marginBottom: -20 },
  vline: { position: 'absolute', top: 16, bottom: 32, width: 1, backgroundColor: '#FFA07A' },
  tooltip: { position: 'absolute', width: 100, alignItems: 'center' },
  rangeContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  timeRangeBtn: {
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  timeRangeBtnSelected: { backgroundColor: "#4768E0" },
  rangeText: { fontSize: 12, fontWeight: '600', color: NEW_COLOR.TEXT_LINK },
  rangeTextSelected: { color: '#fff' },
});

export default MarketHighlights;

