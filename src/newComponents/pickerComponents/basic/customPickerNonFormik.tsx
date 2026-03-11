import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouchableOpacity, StyleProp, ViewStyle, FlatList, Keyboard } from 'react-native';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import Feather from '@expo/vector-icons/Feather';
import ViewComponent from '../../view/view';
import NoDataComponent from '../../noData/noData';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { ms, s } from '../../../constants/theme/scale';
import ImageUri from '../../imageComponents/image';
import PopupOrSheet, { PopupOrSheetRef } from '../../models/PopupOrSheet';
import { useThemeColors } from '../../../hooks/useThemeColors';
import LiveSearchComponent from '../../searchComponents/liveSearch';
import { MaterialIcons } from '@expo/vector-icons';
import {getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import LabelComponent from '../../textComponets/lableComponent/lable';

interface PickerItem {
    id?: string | number;
    name?: string;
    code?: string;
    flag?: string;
    [key: string]: string | number | undefined;
}

interface CustomPickerNonFormikProps {
    placeholder?: string;
    data: PickerItem[];
    onChange?(selected: PickerItem): void;
    error?: string;
    touched?: boolean;
    label?: string;
    selectionType?: string;
    disabled?: boolean;
    modalTitle?: string;
    isRequired?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    inputCustomStyle?: StyleProp<ViewStyle>;
    value?: string | number;
    modalPlaceholder?: string;
}

const CustomPicker: React.FC<CustomPickerNonFormikProps> = ({
    placeholder,
    data = [],
    onChange,
    error,
    touched,
    label,
    selectionType = 'name',
    disabled = false,
    isRequired = false,
    modalTitle,
    containerStyle,
    inputCustomStyle,
    value,
    modalPlaceholder,
}) => {
    const [filteredData, setFilteredData] = useState<PickerItem[]>(data);
    const { t } = useLngTranslation();
    const rbSheetRef = useRef<PopupOrSheetRef>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);

    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    const handleSearchResult = useCallback((result: PickerItem[]) => {
        setFilteredData(result);
    }, []);

    const handleSelect = (selected: PickerItem) => {
        Keyboard.dismiss();
        rbSheetRef.current?.close();
        if (disabled) return;
        onChange?.(selected);
    };

    const selectedOption = data.find((option) => option[selectionType] == value);
    // const displayText = selectedOption ? selectedOption[selectionType] : value ?? placeholder;
    const displayText = selectedOption ? selectedOption[selectionType] : value ?? "";

    const renderItem = ({ item, index }: { item: PickerItem; index: number }) => {
        const isSelected = item[selectionType] == value;
        const logo = item?.flag;

        return (
            <React.Fragment>
                <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.8}>
                    <ViewComponent
                        style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.gap10,
                            isSelected && reversCommonStyles.bgBlack,
                            commonStyles.p10,
                            commonStyles.rounded5,
                            { justifyContent: 'space-between' },
                        ]}
                    >
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                            {logo && (
                                <ViewComponent style={{ width: s(26), height: s(26) }}>
                                    <ImageUri
                                        uri={logo}
                                        width={s(24)}
                                        height={s(24)}
                                        style={{ borderRadius: 100 / 2 }}
                                    />
                                </ViewComponent>
                            )}
                            <ParagraphComponent
                                text={item?.[selectionType] ?? item?.name ?? ''}
                                style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textBlack]}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.listGap]} />
                        {isSelected && (
                            <ViewComponent style={[commonStyles.radioDot, commonStyles.dflex]}>
                                <MaterialIcons name="check" size={s(16)} color={'black'} />
                            </ViewComponent>
                        )}
                    </ViewComponent>
                </TouchableOpacity>
                {index !== filteredData.length - 1 && <ViewComponent style={[commonStyles.rbsheetList]} />}
            </React.Fragment>
        );
    };

    return (
        <ViewComponent style={containerStyle}>
            <TouchableOpacity
                onPress={() => !disabled && rbSheetRef.current?.open()}
                disabled={disabled}
                activeOpacity={disabled ? 1 : 0.7}
            >
                <ViewComponent style={[commonStyles.relative, touched && error && commonStyles.errorBorder]}>
                    {label && (
                        <LabelComponent style={commonStyles.inputLabel}>
                            {t(label)}
                            {isRequired && <LabelComponent style={[commonStyles.textRed]}> *</LabelComponent>}
                        </LabelComponent>
                    )}
                    <ViewComponent
                        style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.justifyContent,
                            commonStyles.relative,
                            commonStyles.textInput,
                            touched && error && commonStyles.errorBorder,
                            inputCustomStyle,
                        ]}
                    >
                        <ParagraphComponent
                            style={[
                                commonStyles.fw500,
                                commonStyles.fs16,
                                { color: value ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.PLACEHOLDER_TEXTCOLOR },
                            ]}
                            text={t(String(displayText ?? placeholder ?? ''))}
                        />
                        <Feather name="chevron-down" size={s(24)} color={NEW_COLOR.TEXT_GREY} />
                    </ViewComponent>
                </ViewComponent>
            </TouchableOpacity>

            <PopupOrSheet ref={rbSheetRef} title={modalTitle ?? 'Select'} height={ms(500)}>
                <LiveSearchComponent
                    data={data}
                    customBind={selectionType}
                    onSearchResult={handleSearchResult}
                    placeholder={modalPlaceholder || `Search ${selectionType}...`}
                />

                {filteredData.length > 0 ? (
                    <FlatList
                        data={filteredData}
                        keyExtractor={(item, index) => `${item.id ?? item.name ?? 'item'}-${index}`}
                        renderItem={renderItem}
                        contentContainerStyle={[commonStyles.mb20]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <NoDataComponent isPopup />
                )}
            </PopupOrSheet>

            {error && touched && (
                <ParagraphComponent
                    style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw500]}
                    text={t(error)}
                />
            )}
        </ViewComponent>
    );
};

export default CustomPicker;
