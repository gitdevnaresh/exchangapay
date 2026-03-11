import React from 'react';
import { View } from 'react-native';
import ViewComponent from '../../../newComponents/view/view';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { FormattedDateText } from '../../../newComponents/textComponets/dateTimeText/dateTimeText';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles, statusColor } from '../../../assets/styles/CommonStyles';
import VisaLogoIcon from '../../../assets/mainmenuicons/visaLogoIcon';
import { SvgUri } from 'react-native-svg';
import { s } from '../../../newComponents/theme/scale';
import ImageUri from '../../../newComponents/imageComponents/image';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';

interface TransactionListItemProps {
  item: any;
  onPress: (item: any) => void;
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({
  item,
  onPress,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  // This function is kept as is, but now it will receive the correct currency variable.
  const formatCurrencyDigit = (amount: any, currency: any) => {
    // Note: The logic inside doesn't currently use the 'currency' parameter,
    // but we pass it correctly in case you enhance this function later.
    return parseFloat(amount).toFixed(2);
  };

  // Extracting necessary data from the item prop
  const transactionTitle = item?.action;
  const transactionDate = item?.date ?? item?.dateTime ?? item?.transactionDate ?? "";
  const amount = item?.amount ?? item?.value ?? 0;
  // This 'currency' variable is correct and should be used.
  const currency = item?.type;
  return (
    <CommonTouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.8}
      key={item?.id ?? item?.transactionId}
      style={commonStyles.transactionsCard}
    >
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>


        {/* {
          item?.logo ? (
            <View style={{ minHeight: s(30), minWidth: s(30) }}>
              <ImageUri width={s(38)} height={s(30)} uri={item?.logo} />
            </View>
          ) : (
            item?.cardNumber && <VisaLogoIcon width={s(48)} height={s(48)} />
          )
        } */}

        {/* 2. Middle section for Title and Date */}
        <ViewComponent style={[commonStyles.flex1]}>
          <ParagraphComponent
            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
            text={transactionTitle}
            numberOfLines={1}
          />
          <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt4, commonStyles.gap4]}>
            {/* <ParagraphComponent
              text={item?.state}
              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
            /> */}
            <FormattedDateText
              value={item?.date || item?.dateTime || item?.transactionDate || ""}
              conversionType="UTC-to-local"
              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
            />
          </View>
        </ViewComponent>

        {/* 3. Right section for Amount (FIXED) */}
        <ViewComponent style={{ alignItems: 'flex-end' }}>
          <View style={[commonStyles.mb4]}>
            <CurrencyText
              currency={currency}
              actionType={item?.action}
              value={item?.cardNumber && amount < 0 ? Math.abs(parseFloat(String(amount)) || 0) : parseFloat(String(amount)) || 0}
              style={[
                commonStyles.fs14,
                commonStyles.fw700,
                item?.cardNumber && {
                  color:
                    amount < 0
                      ? NEW_COLOR.TEXT_RED
                      : NEW_COLOR.TEXT_WHITE
                },
                commonStyles.textRight
              ]}
            />
          </View>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, { flexDirection: 'row', alignItems: 'center' }]}>
            <ViewComponent
              style={{
                width: s(8),
                height: s(8),
                borderRadius: s(4),
                backgroundColor: statusColor[item?.state?.toLowerCase()] || NEW_COLOR.TEXT_GREY,
              }}
            />
            <ParagraphComponent
              text={item?.state}
              style={[commonStyles.secondaryText]}
            />
          </ViewComponent>
        </ViewComponent>

      </ViewComponent>
    </CommonTouchableOpacity>
  );
};

export default TransactionListItem;	