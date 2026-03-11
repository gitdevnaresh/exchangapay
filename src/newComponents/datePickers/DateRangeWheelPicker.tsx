import React, { useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import WheelPicker from 'react-native-wheel-picker-expo';
import { useThemeColors } from '../../hooks/useThemeColors';
import { s } from '../theme/scale';
import ViewComponent from '../view/view';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';

interface DateRangeWheelPickerProps {
    startDate: Date | null;
    endDate: Date | null;
    onChangeStart: (date: Date | null) => void;
    onChangeEnd: (date: Date | null) => void;
    minDate?: Date;
    maxDate?: Date;
    onConfirm?:any;
    onReset?:any
}

// Helper functions
const getYears = (min: number, max: number) => {
    const years = [];
    for (let y = min; y <= max; y++) years.push(y);
    return years;
};
const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
};
const formatDate = (date: Date | null) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const DateRangeWheelPicker: React.FC<DateRangeWheelPickerProps> = ({
    startDate,
    endDate,
    onChangeStart,
    onChangeEnd,
    minDate = new Date(2000, 0, 1),
    maxDate = new Date(), // Default maxDate to today
}) => {
    const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const styles = themedStyles(REVERSE_NEW_COLOR);

    // Determine which date is currently being edited
    const activeDate = activeTab === 'start' ? startDate : endDate;
    const dateToDisplay = activeDate || new Date(); // Use today as a fallback for the wheel's initial position

    const currentYear = dateToDisplay.getFullYear();
    const currentMonth = dateToDisplay.getMonth() + 1;
    const currentDay = dateToDisplay.getDate();
    
    // Create dynamic lists for the wheel pickers that respect the min/max dates
    const availableYears = useMemo(() => getYears(minDate.getFullYear(), maxDate.getFullYear()), [minDate, maxDate]);
    
    const availableMonths = useMemo(() => {
        let months = Array.from({ length: 12 }, (_, i) => i + 1);
        if (currentYear === minDate.getFullYear()) {
            months = months.slice(minDate.getMonth());
        }
        if (currentYear === maxDate.getFullYear()) {
            months = months.slice(0, maxDate.getMonth() + 1);
        }
        return months;
    }, [currentYear, minDate, maxDate]);

    const availableDays = useMemo(() => {
        let lastDay = getDaysInMonth(currentYear, currentMonth);
        if (currentYear === maxDate.getFullYear() && currentMonth === maxDate.getMonth() + 1) {
            lastDay = maxDate.getDate();
        }
        
        let firstDay = 1;
        if (currentYear === minDate.getFullYear() && currentMonth === minDate.getMonth() + 1) {
            firstDay = minDate.getDate();
        }
        
        return Array.from({ length: lastDay - firstDay + 1 }, (_, i) => i + firstDay);
    }, [currentYear, currentMonth, minDate, maxDate]);
    

    const handleDateChange = (type: 'year' | 'month' | 'day', value: number) => {
        let newDate = new Date(dateToDisplay);

        // Set the changed part of the date
        if (type === 'year') newDate.setFullYear(value);
        if (type === 'month') newDate.setMonth(value - 1);
        if (type === 'day') newDate.setDate(value);

        // --- Validation and Clamping ---
        // Clamp to maxDate
        if (newDate > maxDate) {
            newDate = new Date(maxDate);
        }
        // Clamp to minDate
        if (newDate < minDate) {
            newDate = new Date(minDate);
        }

        // Final check to prevent invalid days like "Feb 30"
        const maxDayForMonth = getDaysInMonth(newDate.getFullYear(), newDate.getMonth() + 1);
        if (newDate.getDate() > maxDayForMonth) {
            newDate.setDate(maxDayForMonth);
        }
        
        // Call the parent's handler
        if (activeTab === 'start') {
            onChangeStart(newDate);
        } else {
            onChangeEnd(newDate);
        }
    };
    
    // Find index for wheel picker, ensuring it's not -1
    const yearIndex = availableYears.indexOf(currentYear);
    const monthIndex = availableMonths.indexOf(currentMonth);
    const dayIndex = availableDays.indexOf(currentDay);

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]}/>
            {/* Date Selection Tabs */}
            <ViewComponent style={styles.tabs}>
                <CommonTouchableOpacity
                    style={[styles.tab, activeTab === 'start' && styles.tabActive]}
                    onPress={() => setActiveTab('start')}
                >
                    <ParagraphComponent style={[styles.tabText, startDate && styles.tabTextWithValue, activeTab === 'start' && styles.tabTextActive]}>
                        {formatDate(startDate) || 'Start date'}
                    </ParagraphComponent>
                </CommonTouchableOpacity>
                <ParagraphComponent style={styles.toText}>To</ParagraphComponent>
                <CommonTouchableOpacity
                    style={[styles.tab, activeTab === 'end' && styles.tabActive]}
                    onPress={() => setActiveTab('end')}
                >
                     <ParagraphComponent style={[styles.tabText, endDate && styles.tabTextWithValue, activeTab === 'end' && styles.tabTextActive]}>
                        {formatDate(endDate) || 'End date'}
                    </ParagraphComponent>
                </CommonTouchableOpacity>
            </ViewComponent>

            {/* Wheel Pickers */}
            <ViewComponent style={styles.pickerRow}>
                <ViewComponent key={`year-picker-${activeTab}`} style={[commonStyles.rounded12, { overflow: 'hidden' }]}>
                    <WheelPicker
                        items={availableYears.map(y => ({ label: String(y), value: y }))}
                        initialSelectedIndex={yearIndex > -1 ? yearIndex : 0}
                        onChange={({ index }) => handleDateChange('year', availableYears[index])}
                        height={s(180)}
                        width={s(80)}
                        haptics={true}
                        backgroundColor={REVERSE_NEW_COLOR.BANNER_BG}
                    />
                </ViewComponent>
                <ViewComponent key={`month-picker-${activeTab}`} style={[commonStyles.rounded12, { overflow: 'hidden' }]}>
                    <WheelPicker
                        items={availableMonths.map(m => ({ label: m.toString().padStart(2, '0'), value: m }))}
                        initialSelectedIndex={monthIndex > -1 ? monthIndex : 0}
                        onChange={({ index }) => handleDateChange('month', availableMonths[index])}
                        height={s(180)}
                        width={s(80)}
                        haptics={true}
                        backgroundColor={REVERSE_NEW_COLOR.BANNER_BG}
                    />
                </ViewComponent>
                <ViewComponent key={`day-picker-${activeTab}`} style={[commonStyles.rounded12, { overflow: 'hidden' }]}>
                    <WheelPicker
                        items={availableDays.map(d => ({ label: d.toString().padStart(2, '0'), value: d }))}
                        initialSelectedIndex={dayIndex > -1 ? dayIndex : 0}
                        onChange={({ index }) => handleDateChange('day', availableDays[index])}
                        height={s(180)}
                        width={s(80)}
                        haptics={true}
                        backgroundColor={REVERSE_NEW_COLOR.BANNER_BG}
                    />
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    );
};

const themedStyles = (REVERSE_NEW_COLOR: any) => StyleSheet.create({
    tabs: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tab: {
        flex: 1,
        paddingVertical: s(10),
        borderRadius: s(24),
        backgroundColor: REVERSE_NEW_COLOR.BANNER_BG,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    tabActive: {
        borderColor: REVERSE_NEW_COLOR.BORDER || '#bdbdbd',
    },
    tabText: {
        fontSize: s(14),
        color: REVERSE_NEW_COLOR.TEXT_GREY || '#888',
        fontWeight: '400' as '400',
    },
    tabTextWithValue: {
       color: REVERSE_NEW_COLOR.TEXT_WHITE,
    },
    tabTextActive: {
        fontWeight: '700' as '700',
    },
    toText: {
        marginHorizontal: 8,
        fontSize: 16,
        color: '#888',
        fontWeight: '500' as '500',
    },
    pickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: s(16),
    },
});

export default DateRangeWheelPicker;