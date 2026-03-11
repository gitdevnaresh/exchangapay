
import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, Platform} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import TransactionService from '../../services/transaction';
import { isErrorDispaly } from '../../utils/helpers';
import ViewComponent from '../../newComponents/view/view';
import WithdrawDetails from './Withdraw/WithdrawDetails';
import DepositDetails from './Deposit/DepositDetails';
import SafeAreaViewComponent from '../../newComponents/safeArea/safeArea';
import SwokipayDashboardLoader from '../../newComponents/swokipayloader';
import { TransactionDetailsProps } from './interface';
import { ActionLogParams, useActionLogging } from '../../hooks/loggingHook';
import PageHeader from '../../newComponents/pageHeader/pageHeader';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import Container from '../../newComponents/container/container';
import ParagraphComponent from '../../newComponents/textComponets/paragraphText/paragraph';
import TransactionStatus from './status';
import ErrorComponent from '../../newComponents/errorDisplay/errorDisplay';
import ApplyCardDetails from './ApplyCard/applyCardDetails';
import ImageBackgroundWrapper from '../../newComponents/imageComponents/ImageBackground';
import { VisaHorizontalImage } from '../../assets/vectorAssets';
import { s } from '../../newComponents/theme/scale';
import ConsumeDetails from './consume/consumeTransactionDetail';
import { getTransactionSign } from './constants';
import SignupBonus from './signupBonus/signupBonus';
import SendDetails from './send/sendDetails';
import ReceiveDetails from './receive/receive';
import CryptoCashBack from './cryptoCashback/cryptoCashback';
import CardTopUpDetails from './cardTopup/cardTopUp';
import ReferralDetails from './referralDetails/referralDetails';
import { MAsterIcon } from '../../assets/svg';


const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  modalVisible,
  closePopUp,
  transactionId,
  txType,

}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { logEvent } = useActionLogging();
  const [transactionData, setTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 1. Create a normalized transaction type for reliable checking.
  const normalizedTxType = (txType || transactionData?.action || '')?.toLowerCase().replaceAll(" ", "") || '';
  // 3. Prepare the specific details component if details are to be shown.
  let DetailsComponent = null;

  if (['withdraw', 'withdrawal', 'withdrawcrypto'].includes(normalizedTxType)) {
    DetailsComponent = <WithdrawDetails transaction={transactionData} />;
  } else if (['deposit', 'depositcrypto'].includes(normalizedTxType)) {

    DetailsComponent = <DepositDetails transaction={transactionData} />;
  } else if (['applycard', 'deletecard', 'replacecard','freezecard'].includes(normalizedTxType)) {
    DetailsComponent = <ApplyCardDetails transaction={transactionData} />;

  } else if (['consume', 'consumption', 'refund'].includes(normalizedTxType)) {
    DetailsComponent = <ConsumeDetails transaction={transactionData} />;
  }
  else if (['signupbonus','signupbonus'].includes(normalizedTxType)) {
    DetailsComponent = <SignupBonus transaction={transactionData} />;
  }
   else if (['send','sendCrypto'].includes(normalizedTxType)) {
    DetailsComponent = <SendDetails transaction={transactionData} />;
  }
   else if (['receive'].includes(normalizedTxType)) {
    DetailsComponent = <ReceiveDetails transaction={transactionData} />;
  }
  else if (['cryptoback','cashbackcrypto'].includes(normalizedTxType)) {
    DetailsComponent = <CryptoCashBack transaction={transactionData} />;
  }
   else if (['topupcard','topup'].includes(normalizedTxType)) {
    DetailsComponent = <CardTopUpDetails transaction={transactionData} />;
  }
  else if (['referralcomission'].includes(normalizedTxType)) {
    DetailsComponent = <ReferralDetails transaction={transactionData} />;
  }
  else {
    DetailsComponent = <DepositDetails transaction={transactionData} />;
  }

  // --- END: MODIFIED LOGIC ---
// transactionData?.action?.toLowerCase() === "topupcard"
  useEffect(() => {
    if (modalVisible && transactionId) {
      const screenViewData: ActionLogParams = {
        screename: 'TransactionDetails',
        actionName: 'Screen Loaded',
        actionType: 'View',
        actionObj: {
          postObj: {
            transactionId: transactionId,
            txType: txType,
            modalVisible: modalVisible
          }
        }
      };
      logEvent('screen_view', screenViewData);
    }
  }, [modalVisible, transactionId, txType]);
  const fetchTransactionDetails = async () => {
    setErrorMsg(null);
    if (!transactionId) return;
    setLoading(true);
    try {
      const response: any = await TransactionService.getNeoCardsTansactionBasedOnId(transactionId);
      if (response?.ok) {
        setTransactionData(response?.data);
        const apiLogData: ActionLogParams = {
          screename: 'TransactionDetails',
          actionName: 'Get Transaction Details Success',
          actionType: 'API',
          actionObj: {
            postObj: {
              transactionId: transactionId,
              txType: txType,
              responseData: response?.data || {}
            }
          }
        };
        logEvent('api_success', apiLogData);
      } else {
        setErrorMsg(isErrorDispaly(response));
        setTransactionData([]);
        // Log API error
        const errorLogData: ActionLogParams = {
          screename: 'TransactionDetails',
          actionName: 'Get Transaction Details Error',
          actionType: 'Error',
          actionObj: {
            postObj: {
              transactionId: transactionId,
              txType: txType,
              error: isErrorDispaly(response)
            }
          }
        };
        logEvent('error', errorLogData);
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
      // Log API exception
      const exceptionLogData: ActionLogParams = {
        screename: 'TransactionDetails',
        actionName: 'Get Transaction Details Exception',
        actionType: 'Error',
        actionObj: {
          postObj: {
            transactionId: transactionId,
            txType: txType,
            error: isErrorDispaly(error)
          }
        }
      };
      logEvent('error', exceptionLogData);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (modalVisible && transactionId) {
      fetchTransactionDetails();
    }
  }, [modalVisible, transactionId]);
  const handleCloseModal = () => {
    closePopUp();
  };
  return (
    <SafeAreaView>
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={handleCloseModal}>
        <Container style={[commonStyles.container, commonStyles.flex1, Platform.OS === 'android' ? commonStyles.modalpt : { paddingTop: 55 }]}>
          {loading && (
            <SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>
          )}

          {!loading && (
            <ViewComponent style={[commonStyles.flex1,commonStyles.mt10]}>
              {/* {Platform.OS == 'ios' && <ViewComponent style={[commonStyles.sectionGap]} />} */}
              {/* 4. Use the conditional flag to render the correct header and content */}
              <PageHeader
                title={"GLOBAL_CONSTANTS.TRANSACTIONS"}
                onBackPress={handleCloseModal}
              />
              <ScrollView showsVerticalScrollIndicator={false}>
                {errorMsg && <ErrorComponent message={errorMsg} screen={true} />}

                <>
                  <ViewComponent style={[commonStyles.alignCenter]}>
                    {(transactionData?.action?.toLowerCase() === "withdrawal" || transactionData?.action?.toLowerCase() === "withdraw"||transactionData?.action?.toLowerCase() === "reversal" || transactionData?.action?.toLowerCase() === "refund"|| transactionData?.action?.toLowerCase().replace(/\s/g, '') == "withdrawcrypto" || transactionData?.action?.toLowerCase().replace(/\s/g, '') == "deposit" || transactionData?.action?.toLowerCase().replace(/\s/g, '') == "depositcrypto"||transactionData?.action?.toLowerCase() === "send" || transactionData?.action?.toLowerCase().replace(/\s/g, '') === "signupbonus" || transactionData?.action?.toLowerCase() === "sign up bonus"||transactionData?.action?.toLowerCase() ==="receive"||transactionData?.action?.toLowerCase().replace(/\s/g, '') ==="cashbackcrypto"||transactionData?.action?.toLowerCase().replace(/\s/g, '') ==="cryptoback"||transactionData?.action?.toLowerCase() === "referralcomission"||transactionData?.action?.toLowerCase().replace(/\s/g, '') === "topupcard"||transactionData?.action?.toLowerCase().replace(/\s/g, '') === "fee"||transactionData?.action?.toLowerCase().replace(/\s/g, '')==="cardrechargepayment") && (<>
                      <ViewComponent style={[{ flexDirection: 'row', alignItems: 'baseline' }]}>
                        <ParagraphComponent
                          style={[commonStyles.fs30, commonStyles.mt8, commonStyles.fw700, commonStyles.textWhite]}
                          text={`${(() => {
                            const action = transactionData?.action?.toLowerCase().replace(/\s/g, '');
                            const amount = transactionData?.amount;
                            const fee = transactionData?.fee;
                            const txtype=transactionData?.txType?.toLowerCase();
                            if (action === "deposit" || action === "depositcrypto") {
                              if (!amount || amount === 0) {
                                return "";
                              }
                              return amount >= fee ? "+" : "-";
                            }

                            if (action === "withdrawal" || action === "withdraw" || action === "withdrawcrypto" || action === "send"||action==="topupcard"&&txtype==="withdraw"||action==="fee") {
                              return "-";
                            }

                            if (action === "signupbonus" || action === "receive" || action === "cashbackcrypto" || action === "cryptoback"||action === "reversal"||action === "refund"||transactionData?.action?.toLowerCase() === "referralcomission"||action==="topupcard"&&txtype==="deposit"||action==="cardrechargepayment") {
                              return "+";
                            }

                            return "";
                          })()}${transactionData?.amount?.toFixed(2) || "0.00"} `}
                        />
                        <ParagraphComponent
                          style={[commonStyles.textGrey, commonStyles.fs14, { marginLeft: -1 }]} // Example styles for the currency
                          text={`${(() => {
                            const action = transactionData?.action?.toLowerCase().replace(/\s/g, '');
                            if (action === 'cashbackcrypto' || action === 'cryptoback') {
                              return transactionData?.transactionType || '';
                            }
                            return transactionData?.cardCurrency || '';
                          })()}`}
                        />
                      </ViewComponent>

                      <ViewComponent style={{ marginTop: "-2" }}>
                        <TransactionStatus status={transactionData?.state?.toLowerCase()} />
                        {/* {statusIcons[transactionData?.state?.toLowerCase()]} */}
                      </ViewComponent>

                    </>)}

                    {
                      ["replacecard", "consumption", "applycard", "deletecard", 'refund','freezecard'].includes(
                        transactionData?.action?.toLowerCase().replace(/\s/g, '')
                      )
                      && (<>
                        <ViewComponent style={[commonStyles.alignCenter, { paddingVertical: 20 }]}>
                          {/* Virtual Card Image and Title */}
                          {transactionData?.logo && (<ViewComponent>
                            <ImageBackgroundWrapper
                              source={{ uri: transactionData?.logo }}
                              resizeMode="cover"
                              imageStyle={[commonStyles.rounded4]}
                              style={[{ height: s(40), width: s(60) }]}
                            >{transactionData.assoc.toLowerCase()=== "visa"&&
                              <ViewComponent style={[commonStyles.flex1, { justifyContent: 'flex-end', alignItems: 'flex-end', padding: s(3) }]}>
                                <VisaHorizontalImage width={s(16)} height={s(16)} />
                              </ViewComponent>}
                              {transactionData.assoc.toLowerCase()=== "master"&&<ViewComponent style={[commonStyles.flex1, { justifyContent: 'flex-end', alignItems: 'flex-end', padding: s(3) }]}>
                                <MAsterIcon width={s(16)} height={s(16)} />
                              </ViewComponent>
                              }
                            </ImageBackgroundWrapper>
                          </ViewComponent>)}
                          {["replacecard", "applycard", "deletecard","freezecard"].includes(
                            transactionData?.action?.toLowerCase().replace(/\s/g, '')
                          ) && (<><ParagraphComponent
                            text={transactionData?.cardType || "--"}
                            style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400, commonStyles.mt10]}
                          /></>)}

                          {/* Transaction Amount */}
                          <ViewComponent style={[{ flexDirection: 'row', alignItems: 'baseline', marginTop: 20, marginLeft: 10 }]}>
                            <ParagraphComponent
                              style={[commonStyles.fs26, commonStyles.fw600, commonStyles.textWhite]}
                              text={`${getTransactionSign(transactionData?.action)}${transactionData?.amount?.toFixed(2) || "0.00"} `}

                            />
                            {transactionData?.action?.toLowerCase().replace(/\s/g, '') === "cardtransaction" && (<ParagraphComponent
                              style={[commonStyles.textGrey, commonStyles.fs14, { marginLeft: 2 }]}
                              text={transactionData?.cardCurrency || ""}
                            />)}
                            {transactionData?.action?.toLowerCase().replace(/\s/g, '') !== "cardtransaction" && (<ParagraphComponent
                              style={[commonStyles.textGrey, commonStyles.fs14, { marginLeft: 2 }]}
                              text={transactionData?.type}
                            />)}
                          </ViewComponent>

                          {/* Transaction Statuses */}
                          <ViewComponent style={[commonStyles.flexRow, commonStyles.justifyContent, { width: '80%', marginTop: 3 }]}>
                            <TransactionStatus status={transactionData?.state?.toLowerCase()} />
                          </ViewComponent>
                        </ViewComponent></>)}
                  </ViewComponent>


                  <ViewComponent style={[commonStyles.sectionGap, commonStyles.mt2]} />
                  {DetailsComponent}
                  {/* Share and Download buttons would go here */}
                </>
                {/* ) : (
                  // RENDER COMING SOON VIEW
                  <ComingSoon pageHeader={false} />
                )} */}
              </ScrollView>
            </ViewComponent>
          )}
        </Container>
      </Modal>
    </SafeAreaView>
  );
};

export default TransactionDetails;