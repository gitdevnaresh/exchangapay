import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from 'react-native';
import {
    format,
    subMonths,
    startOfMonth,
    endOfMonth,
    isSameDay,
    addDays,
    getDay,
    getDaysInMonth,
    addMonths as addMonthsDateFns,
    isAfter,
    setMonth,
    setYear,
} from 'date-fns';
import { s } from '../../constants/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';

const CustomCalendar = ({ initialDate, onDateSelect, onClose, maxDate }: any) => {
    const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());
    const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
    const [isMonthYearPickerVisible, setIsMonthYearPickerVisible] = useState(false);
    const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());

    const NEW_COLOR = useThemeColors();
    const reversCommonStyles = getThemedCommonStyles(useThemeColors(true));

    const yearListRef = useRef<FlatList>(null);
    const monthListRef = useRef<FlatList>(null);

    useEffect(() => {
        const newInitial = initialDate || new Date();
        setCurrentMonth(newInitial);
        setSelectedDate(newInitial);
        setPickerYear(newInitial.getFullYear());
    }, [initialDate]);

    const startYear = 2000;
    const endYear = 2050;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    const months = Array.from({ length: 12 }, (_, i) => format(new Date(0, i), 'MMMM'));

    // --- REMOVED: The useEffect hook for automatic scrolling has been deleted ---

    const generateCalendarDays = (date: Date) => {
        const startOfMonthDate = startOfMonth(date);
        const endOfMonthDate = endOfMonth(date);
        const daysInMonth = getDaysInMonth(date);
        const startDayOfWeek = getDay(startOfMonthDate);
        const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

        const days = [];
        for (let i = adjustedStartDay; i > 0; i--) {
            days.push({ date: addDays(startOfMonthDate, -i), isCurrentMonth: false });
        }
        for (let i = 0; i < daysInMonth; i++) {
            days.push({ date: addDays(startOfMonthDate, i), isCurrentMonth: true });
        }
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: addDays(endOfMonthDate, i), isCurrentMonth: false });
        }
        return days;
    };

    const calendarDays = generateCalendarDays(currentMonth);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const handleDayPress = (day: any) => {
        setSelectedDate(day.date);
        onDateSelect(day.date);
        onClose?.();
    };

    const renderMonthYearPicker = () => (
        <View style={{ height: s(300), flexDirection: 'row' }}>
            <FlatList
                ref={yearListRef}
                style={{ flex: 1 }}
                data={years}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setPickerYear(item)}>
                        <Text style={[
                            reversCommonStyles.fs16,
                            reversCommonStyles.textWhite,
                            reversCommonStyles.p10,
                            { textAlign: 'center' },
                            item === pickerYear && { fontWeight: 'bold', color: NEW_COLOR.BG_YELLOW }
                        ]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.toString()}
                showsVerticalScrollIndicator={false}
                getItemLayout={(data, index) => (
                    { length: s(40), offset: s(40) * index, index }
                )}
            />
            <FlatList
                ref={monthListRef}
                style={{ flex: 1 }}
                data={months}
                renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={() => {
                        const newDate = setYear(setMonth(currentMonth, index), pickerYear);
                        setCurrentMonth(newDate);
                        setIsMonthYearPickerVisible(false);
                    }}>
                        <Text style={[
                            reversCommonStyles.fs16,
                            reversCommonStyles.textWhite,
                            reversCommonStyles.p10,
                            { textAlign: 'center' },
                            // This style will now only highlight the month if the selected year also matches
                            index === currentMonth.getMonth() && pickerYear === currentMonth.getFullYear() && { fontWeight: 'bold', color: NEW_COLOR.BG_YELLOW }
                        ]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
                getItemLayout={(data, index) => (
                    { length: s(40), offset: s(40) * index, index }
                )}
            />
        </View>
    );

    return (
        <View style={reversCommonStyles.container}>
            <View style={[reversCommonStyles.flexRow, reversCommonStyles.justifyContent, reversCommonStyles.alignCenter, reversCommonStyles.mb16]}>
                <TouchableOpacity
                    onPress={() => {
                        // When opening the picker, set the picker's year to the calendar's current year
                        if (!isMonthYearPickerVisible) {
                            setPickerYear(currentMonth.getFullYear());
                        }
                        setIsMonthYearPickerVisible(!isMonthYearPickerVisible)
                    }}
                    style={[reversCommonStyles.flexRow, reversCommonStyles.alignCenter]}
                >
                    <Text style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.textWhite, { fontWeight: 'bold' }]}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </Text>
                    <Text style={[reversCommonStyles.fw500, reversCommonStyles.fs20, reversCommonStyles.textGrey, reversCommonStyles.ml8]}>
                        {!isMonthYearPickerVisible && '>'}
                    </Text>
                </TouchableOpacity>
                {!isMonthYearPickerVisible && (
                    <View style={[reversCommonStyles.flexRow, reversCommonStyles.gap4]}>
                        <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <Text style={[reversCommonStyles.fw500, reversCommonStyles.fs20, reversCommonStyles.textGrey]}>{'<'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCurrentMonth(addMonthsDateFns(currentMonth, 1))}>
                            <Text style={[reversCommonStyles.fw500, reversCommonStyles.fs20, reversCommonStyles.textGrey, reversCommonStyles.mr16]}>{'>'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {isMonthYearPickerVisible ? renderMonthYearPicker() : (
                <>
                    <View style={[reversCommonStyles.flexRow, reversCommonStyles.justifyAround, reversCommonStyles.mb10]}>
                        {weekDays.map(day => (
                            <Text key={day} style={[{ width: `${100 / 7}%` }, reversCommonStyles.fs14, reversCommonStyles.textWhite, reversCommonStyles.fw500, { textAlign: 'center' }]}>{day}</Text>
                        ))}
                    </View>

                    <FlatList
                        data={calendarDays}
                        renderItem={({ item }) => {
                            const isSelected = isSameDay(item.date, selectedDate);
                            const isDisabled = (maxDate ? isAfter(item.date, maxDate) : false) || !item.isCurrentMonth;

                            return (
                                <View style={[reversCommonStyles.alignCenter, reversCommonStyles.justifyCenter, { width: `${100 / 7}%`, marginVertical: s(4) }]}>
                                    <TouchableOpacity
                                        onPress={() => handleDayPress(item)}
                                        disabled={isDisabled}
                                        style={[
                                            reversCommonStyles.rounded20,
                                            reversCommonStyles.justifyCenter,
                                            reversCommonStyles.alignCenter,
                                            {
                                                width: s(40),
                                                height: s(40),
                                                backgroundColor: '#F0F0F0',
                                            },
                                            isSelected && { backgroundColor: NEW_COLOR.BG_YELLOW },
                                            !item.isCurrentMonth && { backgroundColor: 'transparent' }
                                        ]}
                                    >
                                        <Text style={[
                                            reversCommonStyles.fs16,
                                            reversCommonStyles.textWhite,
                                            isSelected && {
                                                color: '#000',
                                                fontWeight: 'bold',
                                            },
                                            !item.isCurrentMonth && { color: '#C7C7CD' },
                                            isDisabled && { color: '#555' }
                                        ]}>
                                            {format(item.date, 'd')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        }}
                        keyExtractor={(item) => item.date.toISOString()}
                        numColumns={7}
                    />
                </>
            )}
        </View>
    );
};

export default CustomCalendar;