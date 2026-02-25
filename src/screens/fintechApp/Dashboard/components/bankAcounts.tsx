import React from "react";
import { CoinImages, statusColor } from "../../../../components/CommonStyles";
import ViewComponent from "../../../../components/view/view";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import ImageUri from "../../../../components/imageComponents/image";
import { s } from "../../../../components/theme/scale";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import TextMultiLanguage from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import { getTabsConfigation } from "../../../../../cofiguration";


interface BankAccount {
  currency: string;
  bankStatus: string;
  name: string;
  accountNumber?: string;
  amount: number;
}

interface CommonStyles {
  flex1: object;
  Accountbg: object;
  dflex: object;
  alignCenter: object;
  justifyContent: object;
  gap16: object;
  mt8: object;
  justifyCenter: object;
  Accountsecondarytext: object;
  Accountprimarytext: object;
  mt4: object;
  colorstatus: object;
}

// ✅ Keep UI exactly same as your old inline renderItem
const AccountRow = React.memo(function AccountRow({
  item,
  onPress,
  commonStyles,
  decryptAES,
}: {
  item: BankAccount;
  onPress: (val: BankAccount) => void;
  commonStyles: CommonStyles;
  decryptAES: (val: string) => string;
}) {
  const currencyKey = item?.currency?.toLowerCase();
  const iconUri =
    currencyKey === "usd"
      ? CoinImages["bankusd"]
      : CoinImages[currencyKey as keyof typeof CoinImages] || "";

  const bankStatus = item?.bankStatus?.toLowerCase() || "pending";
  const isApproved = bankStatus === "approved";
  const BankConfig = getTabsConfigation('BANK').DASH_BOARD;
  return (
    <ViewComponent style={[commonStyles.flex1]}>
      <CommonTouchableOpacity
        onPress={() => onPress(item)}
        style={[commonStyles.Accountbg]}
      >
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
            {BankConfig?.isAccountNumberShow && <ViewComponent style={{ width: s(32), height: s(32) }}>
              <ImageUri uri={iconUri} />
            </ViewComponent>}

            <ViewComponent style={isApproved ? [commonStyles.mt8] : [commonStyles.justifyCenter]}>
              <ParagraphComponent style={[commonStyles.Accountsecondarytext]} text={item?.name} />
              {BankConfig?.isAccountNumberShow && (<>
                {isApproved && item?.accountNumber ? (
                  <ParagraphComponent
                    style={[commonStyles.Accountprimarytext, commonStyles.mt4]}
                    text={decryptAES(item?.accountNumber)}
                  />
                ) : (
                  <TextMultiLanguage
                    style={[
                      commonStyles.colorstatus,
                      { color: statusColor[bankStatus] || statusColor["pending"] },
                    ]}
                    text={item?.bankStatus || "GLOBAL_CONSTANTS.PENDING"}
                  />
                )}
              </>)}
            </ViewComponent>

          </ViewComponent>

          <ViewComponent style={[commonStyles.mt8]}>
            <CurrencyText value={item?.amount} symboles={true} style={[commonStyles.Accountprimarytext]} />
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    </ViewComponent>
  );
});

AccountRow.displayName = "AccountRow";

export default AccountRow;