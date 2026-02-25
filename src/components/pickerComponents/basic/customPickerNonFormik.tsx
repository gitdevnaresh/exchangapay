import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import Feather from '@expo/vector-icons/Feather';
import ViewComponent from '../../view/view';
import ScrollViewComponent from '../../scrollView/scrollView';
import SearchComponent from '../../searchComponents/searchComponent';
import NoDataComponent from '../../noData/noData';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import { getThemedCommonStyles, CoinImages } from '../../CommonStyles';
import { ms, s } from '../../../constants/styels/scale';
import ImageUri from '../../imageComponents/image';
import CustomRBSheet from '../../models/commonBottomSheet';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import LabelComponent from '../../textComponets/lableComponent/lable';

// Define a type for the items in the picker to ensure type safety.
interface PickerItem {
    id?: string | number;
    name?: string;
    code?: string;
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
    value
}: CustomPickerNonFormikProps) => {
    const [filteredData, setFilteredData] = useState<PickerItem[]>(data);
    const { t } = useLngTranslation();
    const rbSheetRef = useRef<RBSheet | null>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

    useEffect(() => {
        // When the sheet is opened, reset the filtered data
        // This logic might need adjustment depending on when you want to reset filters
        // For now, we assume data is fresh when the sheet opens.
        setFilteredData(data);
    }, [data]);

    const handleSelect = (selected: PickerItem) => {
        if (disabled) return;
        if (onChange) {
            onChange(selected);
        }
        rbSheetRef.current?.close();
    };

    const handleSearchResult = (result: PickerItem[]) => {
        setFilteredData(result);
    };

    const selectedOption = data.find((option) => option[selectionType] == value);
    const displayText = selectedOption ? selectedOption[selectionType] : value ?? placeholder;

    return (
        <ViewComponent style={containerStyle}>
            <TouchableOpacity
                onPress={() => !disabled && rbSheetRef.current?.open()}
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
                title={modalTitle ?? 'Select'}
                height={"Medium"} // Adjust height as needed
                onClose={() => {
                    // Optional: any action on close if needed beyond what PageHeader does
                }}
            >
                <ViewComponent >
                    <SearchComponent data={data} customBind={selectionType} onSearchResult={handleSearchResult} placeholder={`Search ${selectionType}...`} />
                    <ScrollViewComponent>
                        <ViewComponent style={[]}>
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => {
                                    const coinImage = item.code ? CoinImages[item.code.toLowerCase()] : undefined;
                                    return (
                                        <React.Fragment key={`${index}-${item.code ?? item.name ?? item.id}`}>
                                            <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.8}>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                                    {coinImage && <ViewComponent style={{ width: s(26), height: s(26) }}><ImageUri uri={coinImage} /></ViewComponent>}
                                                    <ParagraphComponent
                                                        text={item?.[selectionType] ?? item?.name ?? ''}
                                                        style={[commonStyles.bottomsheetprimarytext]}
                                                    />
                                                </ViewComponent>
                                            </TouchableOpacity>
                                            {index !== filteredData.length - 1 && <ViewComponent style={[commonStyles.listGap]} />}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <NoDataComponent />
                            )}
                        </ViewComponent>
                    </ScrollViewComponent>
                </ViewComponent>
            </CustomRBSheet>

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

