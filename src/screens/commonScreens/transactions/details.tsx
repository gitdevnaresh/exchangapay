import React, { useEffect, useRef, useState } from "react";
import { StyleService } from "@ui-kitten/components";
import Container from "../../../components/container/container";
import { Alert, Modal, Share, Platform, ActivityIndicator, Keyboard, KeyboardAvoidingView, Linking } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { ms, s, } from "../../../constants/styels/scale";
import { dateFormates, formatUTCtoLocalDate, isErrorDispaly } from "../../../utils/helpers";
import TransactionService from "../../../apiServices/common/transaction";
import ErrorComponent from "../../../components/errorDisplay/errorDisplay";
import { getStatusColor, getThemedCommonStyles, TransactionBlobIcons } from "../../../components/CommonStyles";
import CopyCard from "../../../components/copyIcon/CopyCard";
import moment from "moment";
import Loadding from "../../../components/skelton/skeltons";
import { transactionsCard } from "../../../skeletons/skeltonViews";
import { SvgUri } from "react-native-svg";
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import { CurrencyText } from "../../../components/textComponets/currencyText/currencyText";
import { useSelector } from "react-redux";
import { EditIcon, EditIconImage, EditImage, ReceivedImages, Transactionwithdraw } from "../../../assets/svg";
import ViewComponent from "../../../components/view/view";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import ButtonComponent from "../../../components/buttons/button";
import DownloadFile from "../../../components/downloadFile";
import TextMultiLangauge from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../components/touchableComponents/touchableOpacity";
import Feather from '@expo/vector-icons/Feather';
import DashboardLoader from "../../../components/loader";
import Clipboard from "@react-native-clipboard/clipboard";
import ScrollViewComponent from "../../../components/scrollView/scrollView";
import NoDataComponent from "../../../components/noData/noData";
import SafeAreaViewComponent from "../../../components/safeArea/safeArea";
import ParagraphComponent from "../../../components/textComponets/paragraphText/paragraph";
import AddIcon from "../../../components/addCommonIcon/addCommonIcon";
import CustomRBSheet from "../../../components/models/commonBottomSheet";
import WithdrawCrypto from "./transactionDetailComponents/withdrawCrypto";
import WithdrawFiat from "./transactionDetailComponents/withdrawFiat";
import DepositFiat from "./transactionDetailComponents/depositFiat";
import DepositCrypto from "./transactionDetailComponents/depositCrypto";
import PayinCrypto from "./transactionDetailComponents/payinCrypto";
import { TransactionComponents } from "./interface";
import SellCrypto from "./transactionDetailComponents/sellCrypto";
import BuyCrypto from "./transactionDetailComponents/buyCrypto";
import PayinFiat from "./transactionDetailComponents/payinFiat";
import PayoutFiat from "./transactionDetailComponents/payoutFiat";
import SecurityIcon from "../../../components/svgIcons/mainmenuicons/securityicon";
import EditPersonalInfo from "../../fintechApp/profile/personalInformation";
import CustomEditIcon from "../../../components/svgIcons/mainmenuicons/edit";
import CustomeditLink from "../../../components/svgIcons/mainmenuicons/linkedit";
import { getTabsConfigation, isDecimalSmall } from '../../../../configuration';

interface TransactionDetailsProps {
  modalVisible: boolean;
  transactionId: string;
  closePopUp: () => void;
  accountType?: string;
  transactionType?: string;
}

const TransactionDetails = React.memo((props: TransactionDetailsProps) => {
  const refRBSheet = useRef<any>(null);
  const [transactionIdList, setTransactionIdList] = useState<any>(null);
  const [transactionObjLoading, setTransactionObjLoading] = useState(false);;
  const [inputValue, setInputValue] = useState("");
  const [textData, setTextData] = useState("");
  const [errormsg, setErrormsg] = useState<any>(null);
  const [copyTransactionId, setCopyTransactionId] = useState<any>("");
  const [noteEorrorMsg, setnoteErrorMsg] = useState<any>("");
  const [downloadList, setDownloadList] = useState<string | null>(null)
  const NEW_COLOR = useThemeColors();
  const currency = getTabsConfigation('CURRENCY')
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = themedStyles(NEW_COLOR);
  const statusColor = getStatusColor(NEW_COLOR);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [addNoteLoader, setAddNoteLoader] = useState<boolean>(false);
  const [state, setState] = useState<any>({
    index: 0, routes: [
      { key: "first", title: "Details" },
      { key: "second", title: "Update" },
    ],
  });
  const [isPreparingPdfUrl, setIsPreparingPdfUrl] = useState(false);
  const [shouldAutoStartActualDownload, setShouldAutoStartActualDownload] = useState(false);
  const [onClose, setOnClose] = useState(false);
  const { transactionType } = props;
  const copyToClipboard = (copiedText: string) => {
    Clipboard.setString(copiedText);
  }
  const copyTransactionIdToClipboard = () => {
    Clipboard.setString(copyTransactionId);
  }
  const copyHashIdToClipboard = () => {
    Clipboard.setString(transactionIdList?.hashId);
  }
  const handleHashRedirect = () => {
    const url = transactionIdList?.hashId;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        }
      })
      .catch((err) => {
      });

  };
  const iconsList = {
    buy: (
      <ViewComponent style={[commonStyles.buy, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.buy}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    purchase: (
      <SvgUri
        width={s(26)}
        height={s(26)}
        uri={TransactionBlobIcons.purchase}
      />
    ),
    purchasefiat: (
      <SvgUri
        width={s(26)}
        height={s(26)}
        uri={TransactionBlobIcons.purchasefiat}
      />
    ),
    purchasecrypto: (
      <SvgUri
        width={s(26)}
        height={s(26)}
        uri={TransactionBlobIcons.purchasecrypto}
      />
    ),
    sell: (
      <ViewComponent style={[commonStyles.sell, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.sell}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    withdraw: (
      <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(20)}
            height={s(20)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    deposit: (
      <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(20)}
            height={s(20)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    accountdeposit: (
      <SvgUri
        width={s(20)}
        height={s(20)}
        uri={TransactionBlobIcons.accountdeposit}
      />
    ),
    withdrawcrypto: (
      <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(20)}
            height={s(20)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    depositfiat: (
      <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(20)}
            height={s(20)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payinfiat: (
      <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    exchangewallettransfer: (
      <SvgUri
        width={s(26)}
        height={s(26)}
        uri={TransactionBlobIcons.exchangewallettransfer}
      />
    ),
    depositcrypto: (
      <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(20)}
            height={s(20)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    withdrawfiat: (
      <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(20)}
            height={s(20)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payoutfiat: (
      <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payoutcrypto: (
      <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payincrypto: (
      <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    refund: (
      <ViewComponent style={[commonStyles.refumdbg, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.refund}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    buyreferralbonus: (
      <ViewComponent style={[commonStyles.buy, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.buy}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    sellreferralbonus: (
      <ViewComponent style={[commonStyles.sell, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.sell}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payoutcryptolevelbonus: (
      <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payincryptolevelbonus: (
      <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    depositcryptolevelbonus: (
      <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    depositlevelbonus: (
      <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    withdrawcryptolevelbonus: (
      <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    withdrawlevelbonus: (
      <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    levelbonus: (
      <ViewComponent style={[commonStyles.refumdbg, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.referralbonus}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    applycard: (
      <ViewComponent style={[commonStyles.cardapply, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.applycard}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    fee: (
      <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.applycard}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    consume: (
      <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.applycard}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    topupcard:
      (
        <ViewComponent style={[commonStyles.bgdeposist, commonStyles.transactiondetail]}>
          <ViewComponent>
            <SvgUri
              width={s(14)}
              height={s(14)}
              uri={TransactionBlobIcons.applycard}
            />
          </ViewComponent>
        </ViewComponent>
      ),
    bankwithdrawfiat:
      (
        <ViewComponent style={[commonStyles.bgwithdraw]}>
          <ViewComponent>
            <SvgUri
              width={s(12)}
              height={s(12)}
              uri={TransactionBlobIcons.withdraw}
            />
          </ViewComponent>
        </ViewComponent>
      ),
    bankdepositfiat: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    default: (
      <ViewComponent style={[commonStyles.refumdbg, commonStyles.transactiondetail]}>
        <ViewComponent>
          <SvgUri
            width={s(26)}
            height={s(26)}
            uri={TransactionBlobIcons.refund}
          />
        </ViewComponent>
      </ViewComponent>
    ),
  };
  const transactionsCardDesign = transactionsCard();
  const _renderTabBar = (props: any) => {
    const active = props.navigationState.index;
    return (
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, styles.tabBarContainer]}>
        {props.navigationState.routes.map((route: any, i: number) => {
          const isActive = active === i;
          const isFirstTab = i === 0;
          const isLastTab = i === props.navigationState.routes.length - 1;
          const tabStyleList: any[] = [
            styles.tabButton,
            isActive ? styles.activeTabButton : styles.inactiveTabButton,
          ];

          if (isFirstTab) {
            if (isLastTab) {
              tabStyleList.push({
                borderTopRightRadius: s(30), // Add right radii for a single, fully rounded tab
                borderBottomRightRadius: s(30),
              });
            }
          } else if (isLastTab) {
            tabStyleList.push({
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: s(30),
              borderBottomRightRadius: s(30),
            });
          } else {
            tabStyleList.push({
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            });
          }

          return (
            <CommonTouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              style={tabStyleList}
              onPress={() => setState({ ...state, index: i })}
            >
              <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={route.title} />
            </CommonTouchableOpacity>
          );
        })}
      </ViewComponent>
    );
  };
  const status = transactionIdList?.status || transactionIdList?.state


  const renderTransactionField = (label: string, value: string, rightComponent?: React.ReactNode) => (
    <ViewComponent>
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
        <ParagraphComponent text={label} style={[commonStyles.secondarytext]} />
        {rightComponent || <ParagraphComponent text={value} style={[commonStyles.listprimarytext, commonStyles.textRight]} />}
      </ViewComponent>
      <ViewComponent style={[commonStyles.listGap]} />
    </ViewComponent>
  );

  const renderFieldIfExists = (label: string, value: string, rightComponent?: React.ReactNode) => {
    if (!value) return null;
    return renderTransactionField(label, value, rightComponent);
  };

  const renderHashField = () => {
    if (!transactionIdList?.txRef || transactionIdList?.type === "Purchase" || transactionIdList?.type === "Buy") return null;

    const displayText = transactionIdList.txRef.length > 10
      ? `${transactionIdList.txRef.slice(0, 8)}...${transactionIdList.txRef.slice(-8)}`
      : transactionIdList.txRef || '--';

    return (
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
        <ParagraphComponent text={"GLOBAL_CONSTANTS.HASH"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey, commonStyles.flex1]} />
        <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.flex1]}>
          <ParagraphComponent text={displayText} style={[commonStyles.listprimarytext, commonStyles.flex1, commonStyles.textRight]} />
          <ViewComponent><CopyCard size={s(14)} onPress={() => copyToClipboard(transactionIdList?.txRef)} /></ViewComponent>
        </ViewComponent>
      </ViewComponent>
    );
  };

  const renderAddressField = () => {
    if (!transactionIdList?.accNoOrCryptoAddress || (transactionIdList?.type !== "Deposit" && transactionIdList?.type !== "Withdraw")) return null;

    const displayText = transactionIdList.accNoOrCryptoAddress.length > 10
      ? `${transactionIdList.accNoOrCryptoAddress.slice(0, 8)}...${transactionIdList.accNoOrCryptoAddress.slice(-8)}`
      : transactionIdList.accNoOrCryptoAddress || '--';

    const labelText = transactionIdList?.type === "Deposit" ? "GLOBAL_CONSTANTS.SENDERS_ADDRESS" : "GLOBAL_CONSTANTS.RECEIVER'S_ADDRESS";

    return (
      <ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
          <ParagraphComponent text={labelText} style={[commonStyles.listsecondarytext]} />
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
            <ParagraphComponent text={displayText} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite, commonStyles.textRight]} />
            <CopyCard size={s(14)} onPress={() => copyToClipboard(transactionIdList?.accNoOrCryptoAddress)} />
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.listGap]} />
      </ViewComponent>
    );
  };

  const renderActionButtons = () => {
    const isApproved = transactionIdList?.status === "Approved" || transactionIdList?.state === "Approved";

    if (isApproved) {
      return (
        <>
          <ViewComponent style={commonStyles.sectionGap} />
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.gap10, commonStyles.sectionGap]}>
            <ViewComponent style={[commonStyles.flex1]}>
              <CommonTouchableOpacity
                activeOpacity={0.7}
                onPress={handleInitiatePdfDownload}
                disabled={isPreparingPdfUrl}
                style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.transactiongenerate]}
              >
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                  {isPreparingPdfUrl ? (
                    <ActivityIndicator size="small" color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                  ) : (
                    <DownloadFile
                      imageURL={downloadList || ""}
                      autoStartDownload={shouldAutoStartActualDownload && !!downloadList}
                      onAutoStartProcessed={() => setShouldAutoStartActualDownload(false)}
                    />
                  )}
                  <ParagraphComponent text={"GLOBAL_CONSTANTS.GENERATE_PDF"} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textAlwaysWhite]} />
                </ViewComponent>
              </CommonTouchableOpacity>
            </ViewComponent>
            <ViewComponent style={[commonStyles.flex1]}>
              <ButtonComponent title={"GLOBAL_CONSTANTS.SHARE"} icon={<Feather name="share" size={s(20)} color={NEW_COLOR.SHARE_ICON} />} onPress={onShare} solidBackground={true} />
            </ViewComponent>
          </ViewComponent>
        </>
      );
    }

    return (
      <ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ViewComponent style={[commonStyles.titleSectionGap]} />
        <ButtonComponent title={"GLOBAL_CONSTANTS.SHARE"} icon={<Feather name="share" size={s(20)} color={NEW_COLOR.SHARE_ICON} />} onPress={onShare} solidBackground={true} />
      </ViewComponent>
    );
  };
  const _frist = () => {
    if (!transactionIdList || Object.keys(transactionIdList).length === 0) {
      return (
        <ViewComponent style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <NoDataComponent Description="GLOBAL_CONSTANTS.NO_TRANSACTION_DETAILS_AVILABLE" />
        </ViewComponent>
      );
    }

    const renderCommonDetails = () => {
      const commonProps = {
        transactionType,
        transactionIdList,
        decimalPlaces,
        renderTransactionField,
        renderFieldIfExists,
        renderAddressField,
        renderHashField,
        copyTransactionIdToClipboard,
        statusColor,
        NEW_COLOR,
        commonStyles,
        copyHashIdToClipboard,
        handleHashRedirect,
        ...props,
      };

      const type = transactionIdList?.type?.toLowerCase()?.trim()?.replace(/\s+/g, "");
      const components: TransactionComponents = {
        withdrawcrypto: <WithdrawCrypto {...commonProps} />,
        withdrawfiat: <WithdrawFiat {...commonProps} />,
        depositfiat: <DepositFiat {...commonProps} />,
        depositcrypto: <DepositCrypto {...commonProps} />,
        payincrypto: <PayinCrypto {...commonProps} />,
        sell: <SellCrypto {...commonProps} />,
        buy: <BuyCrypto {...commonProps} />,
        sellcrypto: <SellCrypto {...commonProps} />,
        buycrypto: <BuyCrypto {...commonProps} />,
        payinfiat: <PayinFiat {...commonProps} />,
        Payoutfiat: <PayoutFiat {...commonProps} />,
      };
      return components[type] || <WithdrawCrypto {...commonProps} />; // default fallback
    };

    return (
      <ViewComponent>
        {/* <ViewComponent style={[commonStyles.sectionGap]} /> */}
        {renderCommonDetails()}
        {transactionIdList?.hasOwnProperty('remarks') && (
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
            <CommonTouchableOpacity
              activeOpacity={0.7} style={commonStyles.dflex}
              onPress={() => {
                setInputValue(textData);
                refRBSheet?.current?.open();
              }}>
              <ViewComponent style={[commonStyles.flex1]}>
                {!textData ? (
                  <TextMultiLangauge
                    text={"GLOBAL_CONSTANTS.NOTE_LABLE"}
                    style={[commonStyles.listsecondarytext]}
                  />
                ) : (
                  <TextMultiLangauge
                    text={textData}
                    style={[commonStyles.listprimarytext, { width: s(200) }]}
                  />
                )}
              </ViewComponent>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                <ViewComponent>
                  {textData ? (
                    <CustomeditLink />
                  ) : (<>
                    <ViewComponent style={[commonStyles.actioniconbg]}>
                      <AddIcon />
                    </ViewComponent>

                  </>
                  )}
                </ViewComponent>
                <ParagraphComponent
                  text={textData ? "GLOBAL_CONSTANTS.EDIT_NOTE" : "GLOBAL_CONSTANTS.ADD_NOTE"}
                  style={[commonStyles.listprimarytext, commonStyles.mt6]}
                />
              </ViewComponent>
            </CommonTouchableOpacity>
          </ViewComponent>
        )}
        <ViewComponent style={[commonStyles.sectionGap]} />
        {renderActionButtons()}
      </ViewComponent>
    );
  };


  const handleInputChange = (text: any) => {
    const input = text.replace(/[^\w\s,\-.#()&'"]/gi, '');
    if (!onClose) {
      setInputValue(input);
    }
    setnoteErrorMsg("");
  };
  useEffect(() => {
    if (props?.transactionId) {
      transactionsDetailsData();
    }
  }, [props?.transactionId]);
  const { t } = useLngTranslation();

  const formatAmountForShare = (amount: number | string) => {
    const amountStr = amount?.toString() || '0';
    // Handle slash-separated amounts for exchange transactions
    if (amountStr.includes('/')) {
      const [fromAmount, toAmount] = amountStr.split('/');
      return `${parseFloat(fromAmount.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/${parseFloat(toAmount.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    // Handle single amounts
    return parseFloat(amountStr.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });
  };

  const onShare = async () => {
    try {
      const formattedAmount = formatAmountForShare(transactionIdList?.amount || 0);
      await Share.share({
        message: `${t("GLOBAL_CONSTANTS.YOUR_TRANSACTION_DETAILS")}:\n ${t("GLOBAL_CONSTANTS.TRANSACTIONS_ID")}: ${transactionIdList?.txId || ""}\n ${t("GLOBAL_CONSTANTS.TRANSACTIONS_TYPE")}: ${transactionIdList?.actionType || transactionIdList?.type || ""}\n ${t("GLOBAL_CONSTANTS.WALLET")}: ${transactionIdList?.wallet || ""}\n ${t("GLOBAL_CONSTANTS.AMOUNT")}: ${formattedAmount}\n ${t("GLOBAL_CONSTANTS.TRANSACTIONS_DATE")}: ${formatUTCtoLocalDate(transactionIdList?.date, dateFormates?.dateTimeWithSeconds)} `
      });

    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleInitiatePdfDownload = () => {
    if (isPreparingPdfUrl) return;
    if (props?.transactionId && transactionIdList?.type) {
      if (props?.transactionId && transactionIdList?.type) {
        (async () => {
          setIsPreparingPdfUrl(true);
          setShouldAutoStartActualDownload(false);
          try {
            const response: any = await TransactionService.getDownloadTemplete(props.transactionId, transactionIdList.type);
            if (response?.ok && response?.data) {
              setDownloadList(response.data);
              setShouldAutoStartActualDownload(true);
            } else {
              setDownloadList(null);
              setErrormsg(isErrorDispaly(response) || t("GLOBAL_CONSTANTS.FAILED_TO_GET_DOWNLOAD_LINK"));
            }
          } catch (error) {
            setDownloadList(null);
            setErrormsg(isErrorDispaly(error));
          } finally {
            setIsPreparingPdfUrl(false);
          }
        })();
      } else {
        setErrormsg(t("GLOBAL_CONSTANTS.MISSING_TRANSACTION_DETAILS_TO_GENERATE_PDF"));
      }
    }
  };

  const addNoteData = async () => {
    Keyboard.dismiss();
    setAddNoteLoader(true);
    try {
      let Obj = {
        id: props?.transactionId,
        remarks: inputValue?.trim(),
      };
      await TransactionService.putNote(Obj);
      setAddNoteLoader(false);
      setTextData(inputValue?.trim());
      refRBSheet?.current?.close();
      transactionsDetailsData()
    } catch (error) {
      setnoteErrorMsg(error);
      setTextData("");
      setAddNoteLoader(false);
    }
  };
  const formatAmount = (value: number, decimalPlaces: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  };
  const transactionsDetailsData = async () => {
    setErrormsg('')
    setTransactionObjLoading(true);
    try {
      let response: any;
      if (props?.accountType == "TeamMemberTransactions") {
        response = await TransactionService.getSelectedMemberCardTansactionBasedOnId(props?.transactionId);
      } else {
        response = await TransactionService.getNeoCardsTansactionBasedOnId(props?.transactionId);
      }

      if (response?.ok) {
        setTransactionIdList(response?.data);
        setTextData(response?.data?.remarks);
        setInputValue(response?.data?.remarks);
        setCopyTransactionId(response?.data?.txId)
        setTransactionObjLoading(false);
      } else {
        setErrormsg(isErrorDispaly(response));
        setTransactionObjLoading(false);
      }
    } catch (error) {

      setErrormsg(isErrorDispaly(error));
      setTransactionObjLoading(false);
    }
  };
  const handleClose = () => {
    setInputValue(textData);
    setnoteErrorMsg(null)
  };
  const handleFontSize = (amount: number | string) => {
    const totalAmount = amount?.toString();
    if (totalAmount?.length > 9) {
      return commonStyles.fs22
    } else {
      return commonStyles.fs28
    }
  }

  const renderTransactionAmount = (amount: string) => {
    if (!amount) return null;

    if (amount.includes('/')) {
      const parts = amount.split('/');
      return (
        <ViewComponent style={[commonStyles.alignCenter]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.justifyCenter]}>
            <ParagraphComponent
              text={formatAmount(Number.parseFloat(parts[0].trim()) || 0, 4)}
              style={[commonStyles.transactionamounttext]}
            />
            <ParagraphComponent text=" / " style={[handleFontSize(transactionIdList?.volume), commonStyles.transactionamounttext]} />
            <ParagraphComponent
              text={formatAmount(Number.parseFloat(parts[1].trim()) || 0, 2)}
              style={[commonStyles.transactionamounttext]}
            />
          </ViewComponent>
        </ViewComponent>
      );
    }

    return (
      <CurrencyText
        value={parseFloat(amount) || 0}
        decimalPlaces={decimalPlaces}
        style={[handleFontSize(transactionIdList?.volume), commonStyles.transactionamounttext]}
      />
    );
  };


  const decimalPlaces = transactionIdList?.txSubtype?.toLowerCase() === "fiat" ? 2 : 4;
  return (
    <ViewComponent style={[commonStyles?.flex1]}>
      <Container style={[commonStyles.container]}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={props.modalVisible}
          onRequestClose={() => {
            if (props.closePopUp) props.closePopUp();
          }}
        >
          <ViewComponent style={[commonStyles.screenBg, commonStyles.px24, commonStyles.flex1, Platform.OS === 'android' ? commonStyles.modalpt : { paddingTop: s(75) }]}>
            {transactionObjLoading && (
              <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>
            )}
            {!transactionObjLoading && (
              <ScrollViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.sectionGap]}>
                  <TextMultiLangauge style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.TRANSACTIONS_DETAILS"} />
                  <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter]} onPress={() => {
                    if (props.closePopUp) props.closePopUp()
                  }}>
                    <Ionicons name="close" size={s(25)} color={NEW_COLOR.TEXT_WHITE} style={[commonStyles.mt8]} />
                  </CommonTouchableOpacity>
                </ViewComponent>
                {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
                <ViewComponent>
                  {transactionObjLoading ? (
                    <Loadding contenthtml={transactionsCardDesign} />
                  ) : (
                    <ViewComponent>
                      <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.gap6]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter,]}>
                          {(transactionIdList?.type || transactionIdList?.action) && iconsList[transactionIdList?.action?.toLowerCase()?.replaceAll(" ", "") as keyof typeof iconsList] || iconsList[transactionIdList?.type?.toLowerCase()?.replaceAll(" ", "") as keyof typeof iconsList] || iconsList['default']}
                        </ViewComponent>
                      </ViewComponent>
                      <ParagraphComponent style={[(commonStyles.transactionamounttextlabel)]} text={transactionIdList?.actionType || ""} />
                      {(transactionIdList?.type.toLowerCase() === 'buy' || transactionIdList?.type?.toLowerCase() === 'sell') ? renderTransactionAmount(transactionIdList?.amount || '') : <CurrencyText decimalPlaces={decimalPlaces} currency={transactionIdList?.wallet} value={transactionIdList?.volume || 0} style={[handleFontSize(transactionIdList?.volume), commonStyles.transactionamounttext]} smallDecimal={isDecimalSmall} />}
                    </ViewComponent>
                  )}
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]} />
                {!transactionObjLoading && _frist()}
              </ScrollViewComponent>)}
          </ViewComponent>


          <CustomRBSheet
            height={'Small'}
            refRBSheet={refRBSheet}
            onClose={() => {
              handleClose();
              setOnClose(true);
              setTimeout(() => setOnClose(false), 100);
            }}
          >
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <ViewComponent style={[commonStyles.sheetHeaderbg]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                  <ViewComponent >
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>
              <ViewComponent style={[commonStyles.flex1, commonStyles.sheetbg,]}>
                <ViewComponent>
                  {noteEorrorMsg && <ErrorComponent message={noteEorrorMsg} onClose={handleClose} />}
                  <ViewComponent style={[commonStyles.relative]}>
                    <TextInput
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      style={[commonStyles.input, commonStyles.pt16, { height: s(100) }]}
                      editable
                      multiline
                      textAlignVertical="top"
                      value={inputValue}
                      onChangeText={(e) => handleInputChange(e)}
                      numberOfLines={4}
                      maxLength={100}
                      placeholder="Enter your text here"
                    />
                  </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]} />
                <ViewComponent style={[commonStyles.sectionGap]} />

                <ViewComponent>
                  <ButtonComponent
                    title={"GLOBAL_CONSTANTS.SAVE"}
                    onPress={() => {
                      addNoteData();
                      Keyboard.dismiss();
                    }}
                    loading={addNoteLoader}
                  />
                  <ViewComponent style={[commonStyles.sectionGap]} />
                </ViewComponent>
              </ViewComponent>
            </KeyboardAvoidingView>
          </CustomRBSheet>
        </Modal>
      </Container>

    </ViewComponent>
  );
});
export default TransactionDetails;

const themedStyles = (NEW_COLOR: any) => StyleService.create({
  tabItem: {
    alignItems: "center",
    padding: ms(14), paddingTop: 0,
    paddingBottom: 0,
  },
  circle: {
    backgroundColor: NEW_COLOR.ICON_BG,
    borderRadius: s(44) / 2,
    height: s(44),
    width: s(44),
  },
  profile: {
    width: s(36),
    height: s(36),
    borderRadius: 50, marginRight: s(10),
  },
  tabBarContainer: {
    backgroundColor: NEW_COLOR.TAB_BAR_BG, // Define this color in your theme
    borderRadius: s(100) / 2, // Adjust as needed for roundness
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: s(42),
    borderTopLeftRadius: s(100) / 2,        // Adjust the value as needed
    borderBottomLeftRadius: s(100) / 2,
    borderTopRightRadius: s(100) / 2,
    borderBottomRightRadius: s(100) / 2,

  },
  activeTabButton: {
    backgroundColor: NEW_COLOR.TAB_ACTIVE_BG,
  },
  inactiveTabButton: {
    backgroundColor: "transparent",
  },
});
