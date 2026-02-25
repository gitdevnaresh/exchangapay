import React from "react";
import { s } from "../../../../constants/styels/scale";
import { dateFormates, formatUTCtoLocalDate } from "../../../../utils/helpers";
import CopyCard from "../../../../components/copyIcon/CopyCard";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import ViewComponent from "../../../../components/view/view";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";

const SellCrypto = (props: any) => {
  const {
    transactionIdList,
    decimalPlaces,
    renderTransactionField,
    renderFieldIfExists,
    renderAddressField,
    copyTransactionIdToClipboard,
    statusColor,
    NEW_COLOR,
    commonStyles,
  } = props;
  const formatAmount = (value: number, decimalPlaces: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  };
  const renderTransactionAmount = (amount: string) => {
    if (!amount) return null;

    if (amount.includes('/')) {
      const parts = amount.split('/');
      return (
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.textRight, commonStyles.flexWrap]}>
          <ParagraphComponent
            text={formatAmount(Number.parseFloat(parts[0].trim()) || 0, 4)}
            style={[commonStyles.listprimarytext]}
          />
          <ParagraphComponent text=" / " style={[commonStyles.listprimarytext]} />
          <ParagraphComponent
            text={formatAmount(Number.parseFloat(parts[1].trim()) || 0, 2)}
            style={[commonStyles.listprimarytext]}
          />
        </ViewComponent>
      );
    }

    return (
      <CurrencyText
        value={parseFloat(amount) || 0}
        decimalPlaces={4}
        style={[commonStyles.listprimarytext, commonStyles.textRight]}
      />
    );
  };

  return (
    <ViewComponent>
      {/* Date */}
      {renderTransactionField?.("GLOBAL_CONSTANTS.TRANSACTIONS_DATE", formatUTCtoLocalDate(transactionIdList?.date || "--", dateFormates?.dateTimeWithSeconds))}

      {/* Transaction ID */}
      {renderTransactionField?.("GLOBAL_CONSTANTS.TRANSACTIONS_ID", transactionIdList?.txId || "--",
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8, commonStyles.flex1,]} >
          <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.flex1, commonStyles.textRight,]} text={transactionIdList?.txId || "--"} />
          <ViewComponent style={[commonStyles.mt2]}>
            <CopyCard
              size={s(18)}
              onPress={copyTransactionIdToClipboard}
              copyIconColor={NEW_COLOR.textlinkgrey}
            />
          </ViewComponent>
        </ViewComponent>
      )}

      {/* Common fields */}
      {renderFieldIfExists?.("GLOBAL_CONSTANTS.TRANSACTIONS_TYPE", transactionIdList?.actionType || transactionIdList?.type)}
      {renderTransactionField?.("GLOBAL_CONSTANTS.TRANSACTIONS_WALLET", transactionIdList?.wallet || "")}
      {renderFieldIfExists?.("GLOBAL_CONSTANTS.NETWORK", transactionIdList?.network)}
      {renderTransactionField?.("GLOBAL_CONSTANTS.FEE", transactionIdList?.fee || "0",
        <CurrencyText
          decimalPlaces={decimalPlaces}
          value={transactionIdList?.fee || 0}
          style={[commonStyles.listprimarytext, commonStyles.textRight]}
        />
      )}
      {renderTransactionField?.("GLOBAL_CONSTANTS.TRANSACTION_AMOUNT", "", renderTransactionAmount(transactionIdList?.amount || ""))}
      {/* Address and Status */}
      {renderAddressField?.()}
      {renderTransactionField?.("GLOBAL_CONSTANTS.STATUS", transactionIdList?.status || transactionIdList?.state || "--",
        <ParagraphComponent
          text={transactionIdList?.status || transactionIdList?.state || "--"}
          style={[commonStyles.colorstatus,
          { color: statusColor?.[transactionIdList?.status?.toLowerCase?.()] ?? NEW_COLOR.TEXT_GREEN, },
          ]}
        />
      )}

      {renderFieldIfExists?.("GLOBAL_CONSTANTS.MERCHANT_NAME", transactionIdList?.merchantName)}
    </ViewComponent>
  );
};

export default SellCrypto;

