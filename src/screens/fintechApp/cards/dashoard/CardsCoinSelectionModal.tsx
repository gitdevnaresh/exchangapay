import React, { useState, useEffect } from 'react';
import CustomRBSheet from '../../../../components/models/commonBottomSheet';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import ViewComponent from '../../../../components/view/view';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { CoinImages, getThemedCommonStyles } from '../../../../components/CommonStyles';
import { s } from '../../../../constants/styels/scale';
import ImageUri from '../../../../components/imageComponents/image';
import ButtonComponent from '../../../../components/buttons/button';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import RBSheet from 'react-native-raw-bottom-sheet';


interface CardsCoinSelectionModalProps {
  modelVisible: boolean;
  rbSheetRef: React.RefObject<RBSheet>;
  handleCloseModel: () => void;
  coins: string;
  selectedCoin: string;
  handleCoinSelection: (coin: string) => void;
}

const CardsCoinSelectionModal: React.FC<CardsCoinSelectionModalProps> = ({
  modelVisible,
  rbSheetRef,
  handleCloseModel,
  coins,
  selectedCoin,
  handleCoinSelection,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [internalSelectedCoin, setInternalSelectedCoin] = useState<string>(selectedCoin);

  const coinArray = coins ? coins.split(',') : [];

  useEffect(() => {
    if (modelVisible) {
      setInternalSelectedCoin(selectedCoin);
    }
  }, [modelVisible, selectedCoin]);

  if (!modelVisible) {
    return null;
  }

  const handleItemPress = (item: string) => {
    setInternalSelectedCoin(item);
  };

  const handleDonePress = () => {
    handleCoinSelection(internalSelectedCoin);
    rbSheetRef.current?.close();
  };

  return (
    <CustomRBSheet refRBSheet={rbSheetRef} height={'Small'} title={"GLOBAL_CONSTANTS.SELECT_CURRENCY"} onClose={handleCloseModel}>
      <ScrollViewComponent keyboardShouldPersistTaps="handled">
        <ViewComponent style={[commonStyles.sectionGap, { overflow: 'hidden' }]}>
          {coinArray?.map((item, index: number) => {
            const isSelected = item === internalSelectedCoin;
            return (
              <CommonTouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleItemPress(item)}
                key={item}
              >
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, isSelected && commonStyles.tabactivebg, commonStyles.px4, commonStyles.py8, commonStyles.rounded11]}>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent]}>
                    <ViewComponent style={{ width: s(32), height: s(32) }}>
                      <ImageUri uri={CoinImages[item?.toLowerCase()]} width={s(32)} height={s(32)} />
                    </ViewComponent>
                    <ViewComponent style={commonStyles.flex1} >
                      <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite]}>{item}</ParagraphComponent>
                    </ViewComponent>
                  </ViewComponent>
                </ViewComponent>
                {index !== coinArray.length - 1 && (<ViewComponent style={[commonStyles.listGap]} />)}
              </CommonTouchableOpacity>
            );
          })}

        </ViewComponent>
        <ViewComponent style={[commonStyles.titleSectionGap]} />

        <ViewComponent style={[]}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.DONE"}
            onPress={handleDonePress}
            solidBackground={true}
          />
        </ViewComponent>
      </ScrollViewComponent>

    </CustomRBSheet>
  );
};

export default CardsCoinSelectionModal;
