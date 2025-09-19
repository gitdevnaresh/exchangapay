import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements';
import ParagraphComponent from './Paragraph/Paragraph';
import LabelComponent from './Paragraph/label';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { commonStyles } from './CommonStyles';
import { NEW_COLOR, WINDOW_WIDTH } from '../constants/theme/variables';
import { s } from '../constants/theme/scale';
import Feather from "react-native-vector-icons/Feather";
import NoDataComponent from './nodata';

interface CoinPickerProps {
    field: any;
    form: { setFieldValue: (field: string, value: any) => void };
    placeholder?: string;
    data: any[];
    error: any;
    touched: any;
    onBlur?: (name: string) => void;
    label?: string;
    labelStyle?: any;
    containerStyle?: any;
    modalTitle?: string;
    disable?: boolean;
    Children?: any;
    onChange?: (value: any) => void;
}

const CustomPopupPicker: React.FC<CoinPickerProps> = ({
    field,
    form: { setFieldValue },
    placeholder,
    data = [],
    error,
    touched,
    onBlur,
    label,
    labelStyle,
    containerStyle,
    modalTitle,
    disable,
    Children,
    onChange,
}) => {
    const { name, value } = field;
    const [selectedOption, setSelectedOption] = useState<any>(undefined);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (data?.length > 0 && value) {
            const sel = data.find((option: any) => {
                return (
                    (option?.name && option.name.toUpperCase() === value.toUpperCase()) ||
                    (option?.walletCode && option.walletCode.toUpperCase() === value.toUpperCase())
                );
            });
            setSelectedOption(sel);
        } else {
            setSelectedOption(undefined);
        }
    }, [data, value]);

    const handleSelect = (selected: any) => {
        const selectedValue = selected ? (selected.name || selected.walletCode) : selected;
        if (onBlur) onBlur(name);
        setFieldValue(name, selectedValue);
        if (onChange) onChange(selectedValue);
        setVisible(false);
    };

    return (
        <View style={[containerStyle]}>
            {label && <LabelComponent style={labelStyle} text={label} Children={Children} />}
            <TouchableOpacity onPress={() => setVisible(true)} disabled={disable} style={[styles.inputContainer, commonStyles.dflex, commonStyles.justifyContent]}>

                <ParagraphComponent
                    text={selectedOption ? (selectedOption.name || selectedOption.walletCode) : placeholder || "Select Coin"}
                    style={[styles.inputText, { color: selectedOption ? NEW_COLOR.TEXT_BLACK : NEW_COLOR.PLACEHOLDER_STYLE }]}
                />
                <Feather name="chevron-down" size={18} color={NEW_COLOR.SEARCH_BORDER} style={{ width: s(20) }} />
            </TouchableOpacity>

            {error && touched && <ParagraphComponent style={[styles.error, commonStyles.textError]} text={error} />}
            <Overlay
                isVisible={visible}
                onBackdropPress={() => setVisible(false)}
                overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 40 }]}
            >
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, { marginBottom: s(24) }]}>
                    <ParagraphComponent style={[{ fontSize: s(18), fontWeight: 'bold', color: NEW_COLOR.TEXT_BLACK }]} text={modalTitle || "Select Coin"} />
                    <AntDesign onPress={() => setVisible(false)} name="close" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                </View>
                {data && data?.length > 0 ? (
                    data?.map((item: any, index: number) => (
                        <TouchableOpacity
                            key={index.toString()}
                            style={[
                                styles.option,
                                { backgroundColor: selectedOption && (selectedOption.name === item.name) ? NEW_COLOR.OVERLAY_BG : "transparent" }
                            ]}
                            activeOpacity={0.8}
                            onPress={() => handleSelect(item)}
                        >
                            <ParagraphComponent text={item.name || item.walletCode} style={styles.optionText} />
                        </TouchableOpacity>
                    ))
                ) : (
                    <NoDataComponent />
                )}
            </Overlay>
        </View>
    );
};

export default CustomPopupPicker;

const styles = StyleSheet.create({
    inputContainer: {
        borderWidth: 1,
        borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
        padding: s(12),
        borderRadius: s(8),
    },
    inputText: {
        fontSize: s(13),
        color: NEW_COLOR.TEXT_BLACK,
    },
    error: {
        fontSize: s(12),
        marginTop: s(4),
    },
    overlayContent: {
        paddingHorizontal: s(36),
        paddingVertical: s(36),
        borderRadius: s(35),
        backgroundColor: NEW_COLOR.POP_UP_BG,
    },
    option: {
        padding: s(16),
        borderRadius: s(16),
        borderWidth: 1,
        borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
        marginBottom: s(10),
    },
    optionText: {
        fontSize: s(16),
        color: NEW_COLOR.TEXT_BLACK,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: s(20),
        fontSize: s(16),
        color: NEW_COLOR.TEXT_LIGHTGREY,
    },
});