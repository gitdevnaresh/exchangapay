import React from 'react';
import { FormikProps } from 'formik';
import { CoinImages } from '../../../../../../components/CommonStyles';
import FlatListComponent from '../../../../../../components/flatList/flatList';
import { FormValues, SelectedAsset } from '../interface';
import ImageUri from '../../../../../../components/imageComponents/image';
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import ViewComponent from '../../../../../../components/view/view';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import Feather from '@expo/vector-icons/Feather';

interface CurrencySelectorProps {
  currencyList: SelectedAsset[];
  onSelect: (asset: SelectedAsset, setFieldValue: FormikProps<FormValues>['setFieldValue']) => void;
  selectedAssetToDisplay: SelectedAsset | null;
  formikProps: FormikProps<FormValues>;
  commonStyles: any;
  NEW_COLOR: any;
  s: (val: number) => number;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currencyList,
  onSelect,
  selectedAssetToDisplay,
  formikProps,
  commonStyles,
  s,
  NEW_COLOR,
}) => {

  return (
    <ViewComponent style={{ flex: 1, }}>
      <FlatListComponent
        data={currencyList}
        keyExtractor={(item: SelectedAsset) => `${item.coinCode}-${item.networkCode}-${item.networkName}`}
        renderItem={({ item }: { item: SelectedAsset }) => {
          const isSelected = selectedAssetToDisplay &&
            item.coinCode === selectedAssetToDisplay.coinCode && item.networkCode === selectedAssetToDisplay.networkCode && item.networkName === selectedAssetToDisplay.networkName;
          return (
            <CommonTouchableOpacity onPress={() => onSelect(item, formikProps.setFieldValue)} >
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, isSelected && commonStyles.bgBlack, commonStyles.p10, commonStyles.rounded5]}>
                <ViewComponent style={{ width: s(30), height: s(30) }}>
                  <ImageUri uri={CoinImages[item?.coinCode?.toLowerCase()]} style={{ borderRadius: s(24) }} />
                </ViewComponent>
                <ViewComponent style={{ flex: 1 }}>
                  <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite]} >
                    {item.coinCode} ({item.networkName})
                  </ParagraphComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.alignEnd]}>
                  {isSelected && <Feather name="check" size={18} color={NEW_COLOR.TEXT_GREEN} />}
                </ViewComponent>
              </ViewComponent>
              <ViewComponent style={[commonStyles.rbsheetList]} />
            </CommonTouchableOpacity>
          );
        }}
        ItemSeparatorComponent={null}
        contentContainerStyle={commonStyles.sectionGap}
      />
      <ViewComponent style={[commonStyles.sectionGap, commonStyles.mb38]}>
      </ViewComponent>
    </ViewComponent>
  );
};

export default CurrencySelector;