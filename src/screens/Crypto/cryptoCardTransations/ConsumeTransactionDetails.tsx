import React, { useEffect, useState } from "react";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import {
  View,
  Dimensions,
  ScrollView,
  Linking,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import DefaultButton from "../../../components/DefaultButton";
import { commonStyles } from "../../../components/CommonStyles";
import { Overlay } from "react-native-elements";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../../../constants/theme/variables";
import ParagraphComponent from "../../../components/Paragraph/Paragraph";
import AntDesign from "react-native-vector-icons/AntDesign";
import CopyCard from "../../../components/CopyCard";
import { copyEphemeral } from "../../../utils/clipboard";
import { formatCurrency, formatDateLocal } from "../../../utils/helpers";
import CardsModuleService from "../../../services/card";
import { s } from "../../../constants/theme/scale";

const { width } = Dimensions.get("window");
const isPad = width > 600;

interface ConsumeTransaction {
  id?: string | null;
  txDate?: string | null;
  transactionId?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  type?: string | null;
  transactiontype?: string | null;
  from?: string | null;
  to?: string | null;
  state?: string | null;
  transactionHash?: string | null;
  explorer?: string | null;
  remarks?: string | null;
  preSettlementAmount?: any;
  preSettlementDate?: any;
  fee?: any;
  network?: string | null;
  authorizedCurrency?: string | null;
  authorizedAmount?: any;
  consumeFee?: any;
}

const ConsumeTransactionDetails = React.memo(
  ({ transId, closePop }: { transId: string; closePop: () => void }) => {
    const styles = useStyleSheet(themedStyles);
    const [errorMsg, setErrorMsg] = useState<any>("");
    const [statusOpen, setStatusOpen] = useState<boolean>(false);
    const [transactionDetails, setTransactionDetails] = useState<
      ConsumeTransaction | undefined
    >();

    useEffect(() => {
      getTransactionDetails();
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        closePop();
        return true;
      });
      return () => backHandler.remove();
    }, []);

    const copyToClipboard = (text: any) => copyEphemeral(text, "Address");

    const getTransactionDetails = async () => {
      try {
        const response: any = await CardsModuleService.getTransactionDetails(transId);
        if (response?.data) {
          setTransactionDetails(response.data);
        } else {
          setErrorMsg(response);
        }
      } catch (error) {
        setErrorMsg(error);
      }
    };

    const hyperLinkHash =
      transactionDetails?.explorer && transactionDetails?.transactionHash
        ? transactionDetails.explorer.concat(transactionDetails.transactionHash)
        : undefined;

    // const showFee = transactionDetails?.consumeFee || 0;

    const foreignAmountNumber = transactionDetails?.authorizedAmount || 0;
    const chargedAmountNumber = transactionDetails?.state?.toLowerCase() === "approved" ?
      transactionDetails?.preSettlementAmount : transactionDetails?.amount ?? 0


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
            style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack]}
            text="Transaction Details"
          />
          <AntDesign
            onPress={closePop}
            name="close"
            size={22}
            color={NEW_COLOR.TEXT_BLACK}
            style={{ marginTop: 3 }}
          />
        </View>

        <ScrollView>
          <View>
            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}>
              <ParagraphComponent
                text="Transaction ID"
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textLightGrey,
                  styles.labelStyle,
                ]}
              />
              <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1]}>
                <ParagraphComponent
                  text={transactionDetails?.transactionId || "--"}
                  style={[
                    commonStyles.fs14,
                    commonStyles.fw500,
                    commonStyles.textBlack,
                    commonStyles.flex1,
                    commonStyles.textRight,
                  ]}
                />
                {transactionDetails?.transactionId && (
                  <View style={{ marginTop: isPad ? 0 : 4 }}>
                    <CopyCard
                      onPress={() => copyToClipboard(transactionDetails?.transactionId)}
                      iconShow={true}
                      contentShow={false}
                    />
                  </View>
                )}
              </View>
            </View>

            <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}>
              <ParagraphComponent
                text="Date"
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textLightGrey,
                  styles.labelStyle,
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

            <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}>
              <ParagraphComponent
                text="Transaction Amount"
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textLightGrey,
                  styles.labelStyle,
                ]}
              />
              <ParagraphComponent
                text={`${formatCurrency(foreignAmountNumber || 0, 2)}  ${transactionDetails?.authorizedCurrency || " "}`}
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textBlack,
                  commonStyles.textRight,
                  commonStyles.flex1,
                ]}
              />
            </View>

            <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}>
              <ParagraphComponent
                text="Amount Charged"
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textLightGrey,
                  styles.labelStyle,
                ]}
              />
              <ParagraphComponent
                text={`${formatCurrency(chargedAmountNumber || 0, 2)}  ${transactionDetails?.currency || " "}`}
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textBlack,
                  commonStyles.textRight,
                  commonStyles.flex1,
                ]}
              />
            </View>

            {transactionDetails?.consumeFee !== undefined && (
              <View>
                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}>
                  <ParagraphComponent
                    text="Fee"
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textLightGrey,
                      styles.labelStyle,
                    ]}
                  />
                  <ParagraphComponent
                    text={`${formatCurrency(transactionDetails?.consumeFee || 0, 2)}  ${transactionDetails?.currency || " "}`}
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textBlack,
                      commonStyles.textRight,
                      commonStyles.flex1,
                    ]}
                  />
                </View>
              </View>
            )}

            <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

            {!!transactionDetails?.state && (
              <View>
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}>
                  <ParagraphComponent
                    text="Status"
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textLightGrey,
                      styles.labelStyle,
                    ]}
                  />
                  <ParagraphComponent
                    text={transactionDetails?.state || "--"}
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textBlack,
                      commonStyles.textRight,
                      commonStyles.flex1,
                    ]}
                  />
                </View>
                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
              </View>
            )}

            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}>
              <ParagraphComponent
                text="Merchant Name "
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textLightGrey,
                  styles.labelStyle,
                ]}
              />
              <ParagraphComponent
                text={transactionDetails?.transactiontype || "--"}
                style={[
                  commonStyles.fs14,
                  commonStyles.fw500,
                  commonStyles.textBlack,
                  commonStyles.textRight,
                  commonStyles.flex1,
                ]}
              />
            </View>

            <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

            {!!transactionDetails?.from && (
              <>
                <View>
                  <ParagraphComponent
                    text="From"
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textLightGrey,
                      styles.labelStyle,
                    ]}
                  />
                  <View style={[commonStyles.dflex, { alignItems: "flex-end" }, commonStyles.gap8]}>
                    <ParagraphComponent
                      text={transactionDetails?.from}
                      style={[
                        commonStyles.fs14,
                        commonStyles.fw500,
                        commonStyles.textBlack,
                        commonStyles.mt10,
                        commonStyles.flex1,
                      ]}
                    />
                    <View style={{ marginTop: isPad ? 6 : 4 }}>
                      <CopyCard onPress={() => copyToClipboard(transactionDetails?.from)} iconShow={true} contentShow={false} />
                    </View>
                  </View>
                </View>
                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
              </>
            )}

            {!!transactionDetails?.to && (
              <>
                <View>
                  <ParagraphComponent
                    text="To"
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textLightGrey,
                      styles.labelStyle,
                    ]}
                  />
                  <View style={[commonStyles.dflex, { alignItems: "flex-end" }, commonStyles.gap8]}>
                    <ParagraphComponent
                      text={transactionDetails?.to}
                      style={[
                        commonStyles.fs14,
                        commonStyles.fw500,
                        commonStyles.textBlack,
                        commonStyles.mt10,
                        commonStyles.flex1,
                      ]}
                    />
                    <View style={{ marginTop: isPad ? 6 : 4 }}>
                      <CopyCard onPress={() => copyToClipboard(transactionDetails?.to)} iconShow={true} contentShow={false} />
                    </View>
                  </View>
                </View>
                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
              </>
            )}

            {!!hyperLinkHash && (
              <>
                <View>
                  <ParagraphComponent
                    text="Transaction Hash"
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textLightGrey,
                      styles.labelStyle,
                    ]}
                  />
                  <View style={[commonStyles.dflex, { alignItems: "flex-end" }, commonStyles.gap8, commonStyles.flex1]}>
                    <TouchableOpacity style={[commonStyles.flex1]} onPress={() => Linking.openURL(hyperLinkHash)}>
                      <ParagraphComponent
                        text={hyperLinkHash?.split("/")?.pop()}
                        style={[
                          commonStyles.fs14,
                          commonStyles.fw500,
                          commonStyles.textOrange,
                          commonStyles.mt10,
                          commonStyles.flex1,
                        ]}
                      />
                    </TouchableOpacity>
                    <View style={{ marginTop: isPad ? 6 : 4 }}>
                      <CopyCard onPress={() => copyToClipboard(hyperLinkHash)} iconShow={true} contentShow={false} />
                    </View>
                  </View>
                </View>
                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
              </>
            )}

            <View style={[commonStyles.screenBg, commonStyles.p12, { borderRadius: s(8), backgroundColor: NEW_COLOR.MENU_CARD_BG }]}>
              <TouchableOpacity
                onPress={() => setStatusOpen(!statusOpen)}
                style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap12]}
              >
                <ParagraphComponent
                  text="Status History"
                  style={[
                    commonStyles.fs14,
                    commonStyles.fw500,
                    commonStyles.textLightGrey,
                    styles.labelStyle,
                  ]}
                />
                <AntDesign name={statusOpen ? "up" : "down"} size={16} color={NEW_COLOR.TEXT_BLACK} />
              </TouchableOpacity>

              {statusOpen && (
                <View>
                  <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
                  <View style={[commonStyles.mb16]}>
                    <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}>
                      <ParagraphComponent
                        text="Authorization Confirmed"
                        style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack]}
                      />
                      <ParagraphComponent
                        text={`${formatCurrency(Number(transactionDetails?.amount || 0), 2)}  ${transactionDetails?.currency || "--"}`}
                        style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack]}
                      />
                    </View>
                    <ParagraphComponent
                      text={formatDateLocal(transactionDetails?.txDate) || "--"}
                      style={[commonStyles.fs12, commonStyles.textLightGrey, commonStyles.mt10]}
                    />
                  </View>
                  {transactionDetails?.state?.toLowerCase() === "approved" &&
                    transactionDetails?.preSettlementAmount && (
                      <View style={[{ marginBottom: 16 }]}>
                        <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}>
                          <ParagraphComponent
                            text="Transaction Cleared"
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack]}
                          />
                          <ParagraphComponent
                            text={`${formatCurrency(Number(transactionDetails?.preSettlementAmount || 0), 2)}  ${transactionDetails?.currency || "--"}`}
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack]}
                          />
                        </View>
                        <ParagraphComponent
                          text={formatDateLocal(transactionDetails?.preSettlementDate) || "--"}
                          style={[commonStyles.fs12, commonStyles.textLightGrey, commonStyles.mt10]}
                        />
                      </View>
                    )}
                </View>
              )}
            </View>
          </View>

          <View>
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
  }
);

export default ConsumeTransactionDetails;

const themedStyles = StyleService.create({
  labelStyle: {
    width: (WINDOW_WIDTH * 30) / 100,
  },
  overlayContent: {
    paddingHorizontal: s(28),
    paddingVertical: s(24),
    borderRadius: 25,
    backgroundColor: NEW_COLOR.OVERLAY_BG,
  },
});
