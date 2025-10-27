import React, { useEffect, useState } from "react";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { View, Dimensions, ScrollView, Linking, TouchableOpacity, BackHandler } from "react-native";
import DefaultButton from "../../../components/DefaultButton";
import { commonStyles } from "../../../components/CommonStyles";
import { Overlay } from "react-native-elements";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../../../constants/theme/variables";
import ParagraphComponent from "../../../components/Paragraph/Paragraph";
import AntDesign from "react-native-vector-icons/AntDesign";
import CopyCard from "../../../components/CopyCard";
import Clipboard from "@react-native-clipboard/clipboard";
import { formatCurrency, formatDateLocal } from "../../../utils/helpers";
import CardsModuleService from "../../../services/card";
import { s } from "../../../constants/theme/scale";
const { width } = Dimensions.get('window');
const isPad = width > 600;
interface transaction {
  id: string | null | undefined;
  txDate: string | null | undefined;
  transactionId: string | null | undefined;
  txReference: string | null | undefined;
  amount: number | string | null | undefined;
  currency: string | null | undefined;
  comission: any;
  transactiontype: string | null | undefined;
  transactionSubtype: string | null | undefined;
  receiveWallet: string | null | undefined;
  remarks: string | null | undefined;
  cardNumber: string | null
  from: string | null;
  to: string | null;
  state: string | null;
  transactionHash: string
  explorer: string;
  network: string
  preSettlementAmount: any
  action: any
  withdrawAmount?: any
}

const TransactionDetails = React.memo(({ transId, closePop }: { transId: string, closePop: () => void }) => {
  const styles = useStyleSheet(themedStyles);
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [transactionDetails, setTransactionDetails] = useState<transaction | undefined>();
  useEffect(() => {
    getTransactionDetails();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        closePop();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [])
  const copyToClipboard = async (text: any) => {
    try {
      await Clipboard.setString(text);
    } catch (error: any) {
    }
  };
  const getTransactionDetails = async () => {
    try {
      const response: any = await CardsModuleService.getTransactionDetails(transId);
      if (response?.data) {
        setTransactionDetails(response.data);
      } else {
        setErrorMsg(response)
      }
    } catch (error) {
      setErrorMsg(error)
    }
  };

  const hyperLinkHash = transactionDetails?.explorer?.concat(transactionDetails?.transactionHash);


  return (

    <Overlay
      overlayStyle={[
        styles.overlayContent,
        { width: WINDOW_WIDTH - 40, height: WINDOW_HEIGHT - 50 },
      ]}
      isVisible={true}
      onBackdropPress={closePop}
    >
      <View
        style={[
          commonStyles.dflex,
          commonStyles.alignCenter,
          commonStyles.gap10,
          commonStyles.justifyContent,
          commonStyles.mb43,
        ]}
      >
        <ParagraphComponent
          style={[
            commonStyles.fs16,
            commonStyles.fw800,
            commonStyles.textBlack,
          ]}
          text="Transaction Details"
        />
        <AntDesign
          onPress={closePop}
          name="close"
          size={s(22)}
          color={NEW_COLOR.TEXT_BLACK}
          style={{ marginTop: 3 }}
        />
      </View>
      <ScrollView>
        <View >
          <View
            style={[
              commonStyles.dflex,
              commonStyles.justifyContent,
              commonStyles.gap12,
            ]}
          >
            <ParagraphComponent
              text='Transaction ID'
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textLightGrey, styles.labelStyle
              ]}
            />
            <View
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.gap8,
                commonStyles.flex1,

              ]}
            >
              <ParagraphComponent
                text={transactionDetails?.transactionId || '--'}
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textBlack,
                  commonStyles.flex1,
                  commonStyles.textRight,
                ]}
              />
              {transactionDetails?.transactionId && <View style={{ marginTop: isPad ? 0 : 4 }}>
                <CopyCard
                  onPress={() => copyToClipboard(transactionDetails?.transactionId)}
                  iconShow={true}
                  contentShow={false}
                />
              </View>}
            </View>
          </View>
          <View
            style={[
              commonStyles.dashedLine,
              commonStyles.mt10,
              commonStyles.mb10,
              { opacity: 0.2 },
            ]}
          />
          <View
            style={[
              commonStyles.dflex,
              commonStyles.justifyContent,
              commonStyles.gap12,
            ]}
          >
            <ParagraphComponent
              text='Date'
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textLightGrey, styles.labelStyle
              ]}
            />
            <ParagraphComponent
              text={formatDateLocal(transactionDetails?.txDate)}
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textBlack,
                commonStyles.textRight,
                commonStyles.flex1,
              ]}
            />
          </View>
          <View
            style={[
              commonStyles.dashedLine,
              commonStyles.mt10,
              commonStyles.mb10,
              { opacity: 0.2 },
            ]}
          />
          <View
            style={[
              commonStyles.dflex,
              commonStyles.justifyContent,
              commonStyles.gap12,
            ]}
          >
            <ParagraphComponent
              text='Amount'
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textLightGrey, styles.labelStyle
              ]}
            />
            <ParagraphComponent
              text={
                formatCurrency((transactionDetails?.action === "Consume" && transactionDetails?.state === "Approved") ? transactionDetails?.preSettlementAmount : transactionDetails?.amount || 0, 2)
              }
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textBlack,
                commonStyles.textRight,
                commonStyles.flex1,
              ]}
            />
          </View>
          {((transactionDetails?.action?.toLowerCase() === "withdraw" || transactionDetails?.action?.toLowerCase() === "deposit crypto") && (transactionDetails?.comission || transactionDetails?.comission == 0)) && (<View>
            <View
              style={[
                commonStyles.dashedLine,
                commonStyles.mt10,
                commonStyles.mb10,
                { opacity: 0.2 },
              ]}
            />
            <View
              style={[
                commonStyles.dflex,
                commonStyles.justifyContent,
                commonStyles.gap12,
              ]}
            >
              <ParagraphComponent
                text="Fee"
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textLightGrey, styles.labelStyle
                ]}
              />
              <ParagraphComponent
                text={
                  formatCurrency(transactionDetails?.comission || 0, 2)
                }
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textBlack,
                  commonStyles.textRight,
                  commonStyles.flex1,
                ]}
              />
            </View>
          </View>)}

          {((transactionDetails?.action?.toLowerCase() === "withdraw" || transactionDetails?.action?.toLowerCase() === "deposit crypto") && (transactionDetails?.withdrawAmount || transactionDetails?.withdrawAmount == 0)) && <View>
            <View
              style={[
                commonStyles.dashedLine,
                commonStyles.mt10,
                commonStyles.mb10,
                { opacity: 0.2 },
              ]}
            />
            <View
              style={[
                commonStyles.dflex,
                commonStyles.justifyContent,
                commonStyles.gap12,
              ]}
            >
              <ParagraphComponent
                text='Receive Amount'
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textLightGrey, styles.labelStyle
                ]}
              />
              <ParagraphComponent
                text={
                  formatCurrency(transactionDetails?.withdrawAmount || 0, 2)
                }
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textBlack,
                  commonStyles.textRight,
                  commonStyles.flex1,
                ]}
              />
            </View>
          </View>}


          <View
            style={[
              commonStyles.dashedLine,
              commonStyles.mt10,
              commonStyles.mb10,
              { opacity: 0.2 },
            ]}
          />

          <View
            style={[
              commonStyles.dflex,
              commonStyles.justifyContent,
              commonStyles.gap12,
            ]}
          >
            <ParagraphComponent
              text='Currency'
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textLightGrey, styles.labelStyle
              ]}
            />
            <ParagraphComponent
              text={transactionDetails?.currency || '--'}
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textBlack,
                commonStyles.textRight,
                commonStyles.flex1,
              ]}
            />
          </View>



          <View
            style={[
              commonStyles.dashedLine,
              commonStyles.mt10,
              commonStyles.mb10,
              { opacity: 0.2 },
            ]}
          />
          {transactionDetails?.network && <View>
            <View
              style={[
                commonStyles.dflex,
                commonStyles.justifyContent,
                commonStyles.gap12,
              ]}
            >
              <ParagraphComponent
                text='Network'
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textLightGrey, styles.labelStyle
                ]}
              />
              <ParagraphComponent
                text={transactionDetails?.network || '--'}
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textBlack,
                  commonStyles.textRight,
                  commonStyles.flex1,
                ]}
              />
            </View>



            <View
              style={[
                commonStyles.dashedLine,
                commonStyles.mt10,
                commonStyles.mb10,
                { opacity: 0.2 },
              ]}
            />
          </View>}

          {transactionDetails?.state && <View>
            <View
              style={[
                commonStyles.dflex,
                commonStyles.justifyContent,
                commonStyles.gap12,
              ]}
            >
              <ParagraphComponent
                text='Status'
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textLightGrey, styles.labelStyle
                ]}
              />
              <ParagraphComponent
                text={transactionDetails?.state || '--'}
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textBlack,
                  commonStyles.textRight,
                  commonStyles.flex1,
                ]}
              />
            </View>
            <View
              style={[
                commonStyles.dashedLine,
                commonStyles.mt10,
                commonStyles.mb10,
                { opacity: 0.2 },
              ]}
            />
          </View>}




          <View
            style={[
              commonStyles.dflex,
              commonStyles.justifyContent,
              commonStyles.gap12,
            ]}
          >
            <ParagraphComponent
              text='Transaction  Type'
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textLightGrey, styles.labelStyle
              ]}
            />
            <ParagraphComponent
              text={transactionDetails?.transactiontype || '--'}
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textBlack,
                commonStyles.textRight,
                commonStyles.flex1,
              ]}
            />
          </View>
          <View
            style={[
              commonStyles.dashedLine,
              commonStyles.mt10,
              commonStyles.mb10,
              { opacity: 0.2 },
            ]}
          />

          {transactionDetails?.from && <><View
          >
            <ParagraphComponent
              text='From'
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textLightGrey, styles.labelStyle

              ]}
            />
            <View
              style={[
                commonStyles.dflex, { alignItems: "flex-end" },
                commonStyles.gap8,
              ]}>
              <ParagraphComponent
                text={transactionDetails?.from}
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textBlack,
                  commonStyles.mt10, commonStyles.flex1
                ]}
              />
              <View style={{ marginTop: isPad ? 6 : 4 }}>
                <CopyCard
                  onPress={() => copyToClipboard(transactionDetails?.from)}
                  iconShow={true}
                  contentShow={false}
                />
              </View>
            </View>
          </View>
            <View
              style={[
                commonStyles.dashedLine,
                commonStyles.mt10,
                commonStyles.mb10,
                { opacity: 0.2 },
              ]}
            /></>}





          {transactionDetails?.to && <><View
          >
            <ParagraphComponent
              text='To'
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textLightGrey, styles.labelStyle
              ]}
            />
            <View
              style={[
                commonStyles.dflex, { alignItems: "flex-end" },
                commonStyles.gap8
              ]}>
              <ParagraphComponent
                text={transactionDetails?.to}
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textBlack,
                  commonStyles.mt10, commonStyles.flex1
                ]}
              />
              <View style={{ marginTop: isPad ? 6 : 4 }}>
                <CopyCard
                  onPress={() => copyToClipboard(transactionDetails?.to)}
                  iconShow={true}
                  contentShow={false}
                />
              </View>
            </View>
          </View>
            <View
              style={[
                commonStyles.dashedLine,
                commonStyles.mt10,
                commonStyles.mb10,
                { opacity: 0.2 },
              ]}
            /></>}


          {transactionDetails?.explorer && transactionDetails?.transactionHash && <><View>
            <ParagraphComponent
              text='Transaction Hash'
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textLightGrey, styles.labelStyle

              ]}
            />
            <View
              style={[
                commonStyles.dflex, { alignItems: "flex-end" },
                commonStyles.gap8,

                commonStyles.flex1,
              ]}>
              <TouchableOpacity style={[commonStyles.flex1,]}
                onPress={() => Linking.openURL(hyperLinkHash)}
              >
                <ParagraphComponent
                  text={hyperLinkHash?.split('/').pop()}
                  style={[
                    commonStyles.fs14,
                    commonStyles.fw500,
                    commonStyles.textOrange,
                    commonStyles.mt10, commonStyles.flex1,

                  ]}
                />
              </TouchableOpacity>
              <View style={{ marginTop: isPad ? 6 : 4 }}>
                <CopyCard
                  onPress={() => copyToClipboard(hyperLinkHash)}
                  iconShow={true}
                  contentShow={false}
                />
              </View>
            </View>
          </View>
            <View
              style={[
                commonStyles.dashedLine,
                commonStyles.mt10,
                commonStyles.mb10,
                { opacity: 0.2 },
              ]}
            /></>}


          {transactionDetails?.remarks && <View
          >
            <ParagraphComponent
              text='Remarks'
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textLightGrey, styles.labelStyle
              ]}
            />
            <ParagraphComponent
              text={transactionDetails?.remarks || "--"}
              style={[
                commonStyles.fs14,
                commonStyles.fw500,
                commonStyles.textBlack,
                commonStyles.flex1,
              ]}
            />
          </View>}
        </View>
        <View >
          <View style={[commonStyles.mb24]} />
          <DefaultButton
            title={"Close"}
            transparent={true}
            onPress={closePop}
            iconArrowRight={false}
            closeIcon={true}
          />
        </View>
      </ScrollView>

    </Overlay>

  );
});
export default TransactionDetails;

const themedStyles = StyleService.create({
  labelStyle: {
    width: (WINDOW_WIDTH * 30) / 100,
  },
  overlayContent: {
    paddingHorizontal: s(28),
    paddingVertical: s(24),
    borderRadius: 25, backgroundColor: NEW_COLOR.OVERLAY_BG
  },
  pending: {
    backgroundColor: NEW_COLOR.BG_ORANGE
  },
  activeTabStyle: {
    backgroundColor: NEW_COLOR.BG_ORANGE,
  },
  tabstyle: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    borderRadius: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center", gap: 10,
    marginRight: 8
  },
  mb16: {
    marginBottom: 16,
  },
  iconCircle: {
    padding: 12,
    borderRadius: 100 / 2,
  },
  rowColor: {
    backgroundColor: NEW_COLOR.MENU_CARD_BG, borderRadius: 16, position: 'relative'
  },
  bgGreen: { backgroundColor: NEW_COLOR.BG_GREEN },
  bgPending: { backgroundColor: NEW_COLOR.BG_PENDING },
  status: { position: 'absolute', top: 0, right: 24, paddingHorizontal: 16, paddingVertical: 4, borderBottomRightRadius: 12, borderBottomLeftRadius: 12 },
});
