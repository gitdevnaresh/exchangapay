import React from "react";
import { s } from "../../../../constants/styels/scale";
import { dateFormates, formatUTCtoLocalDate } from "../../../../utils/helpers";
import CopyCard from "../../../../components/copyIcon/CopyCard";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import ViewComponent from "../../../../components/view/view";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";

const WithdrawFiat = (props: any) => {
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
    handleHashRedirect,
    copyHashIdToClipboard
  } = props;

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

      {transactionIdList?.hashId && renderTransactionField?.("GLOBAL_CONSTANTS.HASH", transactionIdList?.hashId || "--",
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1,]} >
          <CommonTouchableOpacity onPress={handleHashRedirect} style={[commonStyles.flex1]}>
            <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.textRight, commonStyles.paymentLinkprimarytext]} text={`${transactionIdList?.hashId?.substring(0, 5)}......${transactionIdList?.hashId?.slice(-10)}`} />
          </CommonTouchableOpacity>
          <ViewComponent style={[commonStyles.mt2]}>
            <CopyCard
              size={s(18)}
              onPress={copyHashIdToClipboard}
              copyIconColor={NEW_COLOR.textlinkgrey}
            />
          </ViewComponent>
        </ViewComponent>
      )}

      {/* Amount, Fee, Net Amount */}
      {renderFieldIfExists?.("GLOBAL_CONSTANTS.WITHDRAW_AMOUNT", transactionIdList?.volume,
        <CurrencyText
          decimalPlaces={decimalPlaces}
          value={transactionIdList?.volume || 0}
          style={[commonStyles.listprimarytext, commonStyles.textRight]}
        />
      )}

      {renderTransactionField?.("GLOBAL_CONSTANTS.FEE", transactionIdList?.fee || "0",
        <CurrencyText
          decimalPlaces={decimalPlaces}
          value={transactionIdList?.fee || 0}
          style={[commonStyles.listprimarytext, commonStyles.textRight]}
        />
      )}

      {renderTransactionField?.("GLOBAL_CONSTANTS.NET_AMOUNT", transactionIdList?.amount || "",
        <CurrencyText
          decimalPlaces={decimalPlaces}
          value={typeof transactionIdList?.amount === 'number' ? transactionIdList.amount : Number.parseFloat(String(transactionIdList?.amount || 0).replaceAll(',', '')) || 0}
          style={[commonStyles.listprimarytext, commonStyles.textRight]}
        />
      )}
      {transactionIdList?.postSettlementAmount && renderTransactionField?.("GLOBAL_CONSTANTS.POST_SETTLLEMENT_AMOUNT", transactionIdList?.postSettlementAmount || "",
        <CurrencyText
          decimalPlaces={decimalPlaces}
          value={transactionIdList?.postSettlementAmount || 0}
          style={[commonStyles.listprimarytext, commonStyles.textRight]}
        />
      )}
      {transactionIdList?.postSettlementDate && renderTransactionField?.("GLOBAL_CONSTANTS.POST_SETTLEMENT_DATE", formatUTCtoLocalDate(transactionIdList?.postSettlementDate || "--", dateFormates?.dateTime))}
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

export default WithdrawFiat;
