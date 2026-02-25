import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import Feather from '@expo/vector-icons/Feather';
import ViewComponent from '../../view/view';
import ScrollViewComponent from '../../scrollView/scrollView';
import SearchComponent from '../../searchComponents/searchComponent';
import NoDataComponent from '../../noData/noData';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import { CoinImages, getThemedCommonStyles } from '../../CommonStyles';
import { ms, s } from '../../../constants/styels/scale';
import CustomRBSheet from '../../models/commonBottomSheet';
import ImageUri from "../../imageComponents/image";
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import RBSheet from 'react-native-raw-bottom-sheet';
import { FieldInputProps, FormikProps } from 'formik';
import LabelComponent from '../../textComponets/lableComponent/lable';

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
    onChange?(selected: PickerItem): void; // Fix: accept 'selected' argument
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
    data = [], // Data is now PickerItem[]
    onChange,
    error,
    touched,
    label,
    selectionType = 'name',
    disabled = false,
    isRequired, // isRequired is not optional in the interface, so no default needed here.
    modalTitle,
    containerStyle,
    inputCustomStyle,
    sheetHeight = ms(400), // Default sheet height
    searchPlaceholder
}: CustomPickerModalProps) => {
    const { name, value } = field;
    const rbSheetRef = useRef<RBSheet | null>(null); // More specific type for RBSheet ref
    const [filteredData, setFilteredData] = useState<PickerItem[]>(data); // Changed from any[] to PickerItem[]
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    useEffect(() => {
        setFilteredData(data); // Keep filteredData in sync if `data` prop changes externally
    }, [data]);

    const handleOpenPicker = () => {
        if (disabled) return;
        setFilteredData(data); // Reset data before opening
        requestAnimationFrame(() => {
            rbSheetRef.current?.open();
        });
    };

    const handleSelect = (selected: PickerItem) => { // Use PickerItem here
        const selectedValue = selected[selectionType];
        if (disabled) return;
        setFieldValue(name, selectedValue);
        if (onChange) {
            onChange(selected);
        }
        rbSheetRef.current?.close(); // No need for requestAnimationFrame here, close is usually synchronous enough.
    };
    const handleSearchResult = (result: PickerItem[]) => { // Use PickerItem[] here
        setFilteredData(result);
    };
    // Ensure selectedOption is typed as PickerItem
    const selectedOption: PickerItem = data.find((option: PickerItem) => option[selectionType] == value) || {
        [selectionType]: value,
    };

    const displayText = selectedOption?.[selectionType];

    return (
        <ViewComponent style={containerStyle}>
            <TouchableOpacity
                onPress={handleOpenPicker}
                disabled={disabled}
                activeOpacity={disabled ? 1 : 0.7}
            >
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
                    <ViewComponent style={[
                        commonStyles.dflex,
                        commonStyles.alignCenter,
                        commonStyles.justifyContent,
                        commonStyles.relative,
                        commonStyles.textInput,
                        ((touched && error) && commonStyles.errorBorder), inputCustomStyle
                    ]}>
                        <ParagraphComponent
                            style={[
                                commonStyles.fw400,
                                commonStyles.fs16,
                                { color: value ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.PLACEHOLDER_COLOR },
                            ]}
                            text={t(String(displayText ?? placeholder ?? ''))}
                        />
                        <Feather name="chevron-down" size={ms(24)} color={NEW_COLOR.TEXT_WHITE} />
                    </ViewComponent>
                </ViewComponent>
            </TouchableOpacity>

            <CustomRBSheet
                refRBSheet={rbSheetRef}
                title={t(modalTitle ?? 'Select Option')}
                height={sheetHeight}
                onClose={() => { /* Optional: Handle sheet close by user interaction */ }}
            >
                <ViewComponent style={[{ flex: 1 }]}>
                    <SearchComponent
                        data={data}
                        customBind={selectionType}
                        onSearchResult={handleSearchResult}
                        placeholder={searchPlaceholder}
                    />
                    <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
                        <ViewComponent >
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <React.Fragment key={item.id ?? item.name ?? index}>
                                        {/* Make the whole row tappable */}
                                        <TouchableOpacity
                                            onPress={() => handleSelect(item)}
                                            activeOpacity={0.8}
                                            style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}
                                        >
                                            {/* Conditionally render ImageUri to avoid errors if item.name is undefined or CoinImages key is missing */}
                                            {item.name && CoinImages[item.name.toLowerCase()] && (
                                                <ViewComponent style={{ width: s(26), height: s(26) }}>
                                                    <ImageUri uri={CoinImages[item.name.toLowerCase()]} />
                                                </ViewComponent>
                                            )}
                                            {/* Ensure text is always rendered, even if image is not */}
                                            <ViewComponent style={commonStyles.flex1}>
                                                <ParagraphComponent
                                                    text={item?.[selectionType] ?? item?.name ?? ""}
                                                    style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
                                                />
                                            </ViewComponent>
                                        </TouchableOpacity>
                                        {index !== filteredData.length - 1 && (
                                            <ViewComponent style={[commonStyles.hLine, commonStyles.my10]} />
                                        )}
                                    </React.Fragment>

                                ))
                            ) : (
                                <NoDataComponent />
                            )}
                        </ViewComponent>
                    </ScrollViewComponent>
                </ViewComponent>
            </CustomRBSheet>

            {error && touched && (
                <ParagraphComponent
                    style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw400]}
                    text={t(error)}
                />
            )}
        </ViewComponent>
    );
};

export default CustomPickerModal;

