import React, { useMemo } from "react";
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import ViewComponent from '../../../../../../components/view/view';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import { Payee } from '../interface';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';

interface PayeeListItemProps {
  item: Payee;
  isActive: boolean;
  onPress: (item: Payee) => void;
  isLastItem: boolean;
  commonStyles: any;
  NEW_COLOR: any;
}

const PayeeListItem: React.FC<PayeeListItemProps> = ({ item, isActive, onPress, isLastItem }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

  return (
    <CommonTouchableOpacity onPress={() => onPress(item)}>
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, isActive && commonStyles.activeItemBg, commonStyles.rounded5]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.gap16, commonStyles.alignCenter]}>
          <ViewComponent style={[commonStyles.bottomsheetroundediconbg, isActive && commonStyles.bottomsheetroundedactiveiconbg]}>
            <ParagraphComponent style={[commonStyles.twolettertext, isActive && NEW_COLOR.TEXT_WHITE]} text={item.favoriteName?.slice(0, 1)?.toUpperCase() || ''} />
          </ViewComponent>
          <ViewComponent style={{ flex: 1 }}>
            <ParagraphComponent style={[commonStyles.primarytext]} text={item.favoriteName || ''} numberOfLines={1} />
            <ParagraphComponent style={[commonStyles.secondarytext]} text={`${item?.walletAddress?.substring(0, 10)} ****** ${item?.walletAddress?.slice(-10)}`} numberOfLines={1} />
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>
      {!isLastItem && (
        <ViewComponent style={[commonStyles.listGap]} />
      )}
    </CommonTouchableOpacity>
  );
};

export default PayeeListItem;
