import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouchableOpacity, StyleProp, ViewStyle, Keyboard, FlatList, Platform } from 'react-native';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import Feather from '@expo/vector-icons/Feather';
import ViewComponent from '../../view/view';
import LiveSearchComponent from '../../searchComponents/liveSearch';
import NoDataComponent from '../../noData/noData';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { ms, s } from '../../../constants/theme/scale';
import ImageUri from "../../../newComponents/imageComponents/image";
import { useThemeColors } from '../../../hooks/useThemeColors';
import RBSheet from 'react-native-raw-bottom-sheet';
import { FieldInputProps, FormikProps } from 'formik';
import PopupOrSheet from '../../models/PopupOrSheet';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import LabelComponent from '../../textComponets/lableComponent/lable';
import { CoinImages } from '../../../assets/blobUrls';

// Define a type for the items in the picker to ensure type safety.
interface PickerItem {
    id?: string | number;
    name?: string;
    code?: string;
    [key: string]: string | number | undefined;
}

interface CustomPickerModalProps {
    field: FieldInputProps<any>;
    form: FormikProps<any>;
    placeholder?: string;
    data: PickerItem[];
    onChange?(selected: PickerItem): void;
    error?: string;
    touched?: boolean;
    label?: string;
    selectionType?: string;
    disabled?: boolean;
    modalTitle?: string;
    isRequired: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    inputCustomStyle?: StyleProp<ViewStyle>;
    sheetHeight?: number;
    searchPlaceholder?: string;
}

const CustomPickerModal: React.FC<CustomPickerModalProps> = ({
    field,
    form: { setFieldValue },
    placeholder,
    data = [],
    onChange,
    error,
    touched,
    label,
    selectionType = 'name',
    disabled = false,
    isRequired,
    modalTitle,
    containerStyle,
    inputCustomStyle,
    sheetHeight = ms(400),
    searchPlaceholder
}: CustomPickerModalProps) => {
    const { name, value } = field;
    const rbSheetRef = useRef<RBSheet | null>(null);
    const [filteredData, setFilteredData] = useState<PickerItem[]>(data);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    // FIX: Updated function to handle keyboard dismissal smoothly
    const handleOpenPicker = () => {
        if (disabled) return;
        Keyboard.dismiss();
        setFilteredData(data);
        setTimeout(() => {
            rbSheetRef.current?.open();
        }, 100);
    };

    const handleSelect = useCallback((selected: PickerItem) => {
        const selectedValue = selected[selectionType];
        if (disabled) return;
        setFieldValue(name, selectedValue);
        if (onChange) {
            onChange(selected);
        }
        rbSheetRef.current?.close();
    }, [disabled, name, onChange, selectionType, setFieldValue]);

    const handleSearchResult = useCallback((result: PickerItem[]) => {
        setFilteredData(result);
    }, []);

    const selectedOption: PickerItem = data.find((option: PickerItem) => option[selectionType] == value) || {
        [selectionType]: value,
    };

    const displayText = selectedOption?.[selectionType];
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);

    const renderItem = ({ item }: { item: PickerItem }) => {
        const isSelected = value === item[selectionType];
        const coinImage = item.name && CoinImages[item.name.toLowerCase()];
        const logo = item?.flag || item.logo;

        return (
            <TouchableOpacity
                onPress={() => handleSelect(item)}
                activeOpacity={0.8}
            >
                <ViewComponent style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                    isSelected && reversCommonStyles.bgBlack,
                    commonStyles.p10,
                    commonStyles.rounded5,
                    { justifyContent: 'space-between' }
                ]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                        {logo && <ViewComponent style={{ width: s(26), height: s(26) }}> <ImageUri uri={logo} width={s(24)} height={s(24)} style={{ borderRadius: 100 / 2, }} /></ViewComponent>}
                        <ParagraphComponent
                            text={item?.[selectionType] ?? item?.name ?? ''}
                            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textBlack]}
                        />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.listGap]} />
                    {isSelected && (
                        <ViewComponent style={[commonStyles.radioDot, commonStyles.dflex]}>
                            <MaterialIcons name="check" size={s(16)} color={REVERSE_NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    )}
                </ViewComponent>
            </TouchableOpacity>
        );
    };


    return (
        <ViewComponent style={containerStyle}>
            <ViewComponent
                style={[
                    commonStyles.relative,
                    touched && error && commonStyles.errorBorder,
                ]}
            >
                {label && (
                    <LabelComponent style={commonStyles.inputLabel}>
                        {t(label)}
                        {isRequired && <LabelComponent style={[commonStyles.textRed]}> *</LabelComponent>}
                    </LabelComponent>
                )}
                <TouchableOpacity
                    onPress={handleOpenPicker}
                    disabled={disabled}
                    activeOpacity={disabled ? 1 : 0.7}
                >
                    <ViewComponent style={[
                        commonStyles.dflex,
                        commonStyles.alignCenter,
                        commonStyles.justifyContent,
                        commonStyles.textInput,
                        ((touched && error) && commonStyles.errorBorder),
                        { backgroundColor: disabled ? NEW_COLOR.INPUT_BORDER : NEW_COLOR.INPUTFIELD_BG },
                        inputCustomStyle
                    ]}>
                        {/* <ParagraphComponent
                            style={[
                                commonStyles.fw400,
                                commonStyles.fs16,
                                { color: value ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.PLACEHOLDER_TEXTCOLOR }
                            ]}
                            text={t(String(displayText || placeholder || ''))}
                        /> */}
                        <ParagraphComponent
                            style={[
                                commonStyles.fw400,
                                commonStyles.flex1,
                                {fontSize:s(16), color: value ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.PLACEHOLDER_TEXTCOLOR }
                            ]}
                            text={t(String(displayText ))}
                        />
                        <Feather name="chevron-down" size={ms(24)} color={NEW_COLOR.TEXT_GREY} />
                    </ViewComponent>
                </TouchableOpacity>
            </ViewComponent>

            <PopupOrSheet
                ref={rbSheetRef}
                title={t(modalTitle ?? 'Select Option')}
                height={sheetHeight}
                onClose={() => { /* Optional */ }}
            >

                <LiveSearchComponent
                    data={data}
                    customBind={selectionType}
                    onSearchResult={handleSearchResult}
                    placeholder={searchPlaceholder || `Search ${selectionType}...`}
                />
                {Platform.OS === 'android' ? (
                    <KeyboardAwareScrollView
                        contentContainerStyle={[{ flexGrow: 1 }]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <FlatList
                            data={filteredData}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => `${item.id ?? item.name ?? 'item'}-${index}`}
                            ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.rbsheetList]} />}
                            ListEmptyComponent={<NoDataComponent isPopup={true} />}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            contentContainerStyle={{ flexGrow: 1, paddingVertical: ms(10) }}
                            style={[commonStyles.flex1]}
                        />
                    </KeyboardAwareScrollView>
                ) : (
                    <FlatList
                        data={filteredData}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `${item.id ?? item.name ?? 'item'}-${index}`}
                        ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.rbsheetList]} />}
                        ListEmptyComponent={<NoDataComponent isPopup={true} />}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        contentContainerStyle={{ flexGrow: 1, paddingVertical: ms(10) }}
                        style={[commonStyles.flex1]}
                    />
                )}
            </PopupOrSheet>

            {error && touched && (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                    <AntDesign
                        name="closecircleo"
                        size={s(14)}
                        color={NEW_COLOR.TEXT_RED}
                        style={[commonStyles.mt6]}
                    />
                    <ParagraphComponent
                        style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw400]}
                        text={t(error)}
                    />
                </ViewComponent>
            )}
        </ViewComponent>
    );
};

export default CustomPickerModal;