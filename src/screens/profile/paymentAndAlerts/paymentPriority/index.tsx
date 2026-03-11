import React, { useState, useEffect, useCallback } from "react";
// CHANGED: Added 'View' for layout
import { TouchableOpacity, View } from "react-native";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ButtonComponent from "../../../../newComponents/buttons/button";
import ViewComponent from "../../../../newComponents/view/view";
import CustomSwitch from "../../../../newComponents/switch";
import { useNavigation } from "@react-navigation/native";
import ProfileService from "../../../../services/profile";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import { showAppToast } from "../../../../newComponents/ToasterMessages/ShowMessage";
import { isErrorDispaly } from "../../../../utils/helpers";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import DotGridIcon from "../../../../assets/mainmenuicons/dotGridIcon";
import KycVerifyPopup from "../../../commonScreens/kycVerify";
import { useSelector } from "react-redux";
import { MaterialIcons } from '@expo/vector-icons';
import { s } from "../../../../newComponents/theme/scale";
import ImageUri from "../../../../newComponents/imageComponents/image";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";

type Coin = {
  id: string;
  name: string;
  code: string;
  recorder: number;
  status: number;
  balance?: string;
  logo?: string;
};

type PaymentPriorityData = {
  setPreferredPayment: boolean;
  activeCoins: Coin[];
  inactiveCoins: Coin[];
  ModifiedBy: string;
};

type PaymentPriorityProps = {
  onSave?: (data: PaymentPriorityData) => void;
  onBack?: () => void;
};

const PaymentPriority: React.FC<PaymentPriorityProps> = ({ onSave, onBack }) => {
  const [preferredEnabled, setPreferredEnabled] = useState(true);
  const [activeCoins, setActiveCoins] = useState<any>([]);
  const [inactiveCoins, setInactiveCoins] = useState<Coin[]>([]);
  const [paymentPriorityLoader, setPaymentPriorityLoader] = useState(true);
  const [btnLoader, setBtnLoader] = useState(false);
  const [initialPreferredEnabled, setInitialPreferredEnabled] = useState<boolean | null>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation();
  const { t } = useLngTranslation();
  const [kycModelVisible, setKycModelVisible] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [error, setError] = useState<string>("");
  useHardwareBackHandler(() => {
    handleBackPress();
    return true;
  });

  useEffect(() => {
    getPaymentPriority();
  }, []);

  const getPaymentPriority = async () => {
    setError("");
    try {
      setPaymentPriorityLoader(true);
      const response: any = await ProfileService.getPaymentProirity();
      if (response?.data) {
        const sortedActiveCoins = response?.data?.activeCoins.sort((a: Coin, b: Coin) => a.recorder - b.recorder);
        setPreferredEnabled(response?.data?.setPreferredPayment);
        if (initialPreferredEnabled === null) {
          setInitialPreferredEnabled(response?.data?.setPreferredPayment);
        }
        setActiveCoins(sortedActiveCoins || []);
        setInactiveCoins(response?.data.inactiveCoins || []);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setPaymentPriorityLoader(false);
    }
  };

  const moveToTop = useCallback((index: number) => {
    if (index === 0) return;
    setActiveCoins(currentCoins => {
      const newActiveCoins = [...currentCoins];
      const [item] = newActiveCoins.splice(index, 1);
      newActiveCoins.unshift(item);
      return newActiveCoins.map((coin, idx) => ({ ...coin, recorder: idx + 1 }));
    });
  }, []);

  const disableCurrency = (index: number) => {
    setActiveCoins((currentActiveCoins: any) => {
      const newActiveCoins = [...currentActiveCoins];
      const [disabledCoin] = newActiveCoins.splice(index, 1);
      disabledCoin.status = 0;
      disabledCoin.recorder = 0;
      setInactiveCoins(currentInactive => [...currentInactive, disabledCoin]);
      return newActiveCoins.map((coin, idx) => ({ ...coin, recorder: idx + 1 }));
    });
  };

  const enableCurrency = useCallback((index: number) => {
    setInactiveCoins(currentInactive => {
      const newInactiveCoins = [...currentInactive];
      const [enabledCoin] = newInactiveCoins.splice(index, 1);
      enabledCoin.status = 1;
      setActiveCoins((currentActive: any) => {
        enabledCoin.recorder = currentActive.length + 1;
        return [...currentActive, enabledCoin];
      });
      return newInactiveCoins;
    });
  }, []);
  const handleSave = async () => {
    setError("");
    try {
      setBtnLoader(true);
      const obj: PaymentPriorityData = {
        setPreferredPayment: preferredEnabled,
        activeCoins,
        inactiveCoins,
        ModifiedBy: userInfo?.userName
      };
      const response: any = await ProfileService.savePaymentProirity(obj);
      if (response?.status === 200) {
        showAppToast(t("GLOBAL_CONSTANTS.PAYMENT_PRIORITY_UPDATED_SUCESSFULLY"), "success");
        getPaymentPriority();
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setBtnLoader(false);
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Coin>) => {
    const isDragDisabled = activeCoins?.length <= 1;
    const itemIndex = activeCoins.findIndex(coin => coin.id === item.id);
    const isFirstItem = itemIndex === 0;
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onPressIn={isDragDisabled ? undefined : drag}
          disabled={isActive}
          // onPressIn={()=>{}}
          // activeOpacity={0.9}
          style={[
            commonStyles.mb10, commonStyles.p12, commonStyles.flexRow,
            commonStyles.alignCenter, commonStyles.list, commonStyles.rounded12,
            isActive && {
              backgroundColor: NEW_COLOR.DRAG_COLOR,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              transform: [{ scale: 1.02 }],
              opacity: 0.5
            }
          ]}
        >
          <Ionicons name="remove-circle" size={s(24)} color={isDragDisabled ? NEW_COLOR.TEXT_GREY : NEW_COLOR.BG_YELLOW} style={[commonStyles.p8, commonStyles.rounded8]} onPress={() => (!isActive && disableCurrency(itemIndex))} disabled={isDragDisabled} />
          {item?.logo && <ImageUri uri={item?.logo} width={s(30)} height={s(30)} style={{ borderRadius: s(26) }} />}

          <ViewComponent style={[commonStyles.flex1, commonStyles.ml8]}>
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]}>{item.code}</ParagraphComponent>
            <ParagraphComponent style={[commonStyles.textGrey, commonStyles.mt4, commonStyles.fs12, commonStyles.fw400]}>
              {item.balance || item.name}
            </ParagraphComponent>
          </ViewComponent>
          <MaterialIcons name="vertical-align-top" size={s(20)} color={NEW_COLOR.TEXT_GREY} style={[commonStyles.p8, commonStyles.rounded8]} onPress={() => !isActive && moveToTop(itemIndex)} disabled={isDragDisabled || isFirstItem || isActive} />
          <View style={[commonStyles.p8, commonStyles.rounded8]}>
            <DotGridIcon color={NEW_COLOR.TEXT_GREY} />
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const renderInactiveItem = useCallback(({ item }: { item: Coin }) => {
    const itemIndex = inactiveCoins.findIndex(coin => coin.id === item.id);
    return (
      <ViewComponent key={item.id} style={[commonStyles.p12, commonStyles.mb10, commonStyles.flexRow, commonStyles.alignCenter, commonStyles.list, commonStyles.rounded12]}>
        <TouchableOpacity onPress={() => enableCurrency(itemIndex)}>
          <Ionicons name="add-circle" size={24} color={NEW_COLOR.BG_YELLOW} />
        </TouchableOpacity>
        {item?.logo && <ImageUri uri={item?.logo} width={s(30)} height={s(30)} style={[commonStyles.ml8, { borderRadius: s(26) }]} />}
        <ViewComponent style={[commonStyles.flex1, commonStyles.ml16]}>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]}>{item.code}</ParagraphComponent>
          <ParagraphComponent style={[commonStyles.textGrey, commonStyles.mt4, commonStyles.fs12, commonStyles.fw400]}>{item.name}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>
    );
  }, [inactiveCoins, enableCurrency, NEW_COLOR, commonStyles, s]);

  const handleBackPress = useCallback(() => { navigation.goBack(); }, [navigation]);
  const closekycModel = useCallback(() => { setKycModelVisible(false); }, []);
  const handlePreferredSwitch = useCallback((value: boolean) => {
    if (!userInfo.isKYC) {
      setKycModelVisible(true);
      return;
    }
    setPreferredEnabled(value);
    setInitialPreferredEnabled(true);
  }, [userInfo.isKYC, initialPreferredEnabled]);

  const listFooterComponent = () => (
    (preferredEnabled && inactiveCoins.length > 0) && (
      <View style={{ marginTop: 10 }}>
        <ParagraphComponent style={[commonStyles.mb12, commonStyles.mt20, commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, { fontWeight: 'bold' }]}>
          {t("GLOBAL_CONSTANTS.DISABLED_CURRENCIES")}
        </ParagraphComponent>
        {inactiveCoins.map((item) => renderInactiveItem({ item }))}
      </View>
    )
  );
  const listEmptyComponent = () => (
    preferredEnabled && (
      <ViewComponent style={[commonStyles.p16, commonStyles.alignCenter]}>
        <ParagraphComponent style={[commonStyles.textGrey, commonStyles.fs14]}>
          {t("GLOBAL_CONSTANTS.NO_ACTIVE_CURRENCIES")}
        </ParagraphComponent>
      </ViewComponent>
    )
  );
  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {paymentPriorityLoader ? (
        <SwokipayDashboardLoader />
      ) : (
        <>
          {/* CRITICAL: The Container must NOT be a ScrollView. It acts as a padded View. */}
          <Container style={{ flex: 1 }}>
            {/* === ALL STATIC CONTENT IS MOVED OUTSIDE THE LIST === */}
            <PageHeader containerStyle={[commonStyles.pl5]} title={t("GLOBAL_CONSTANTS.PAYMENT_PRIORITY")} onBackPress={handleBackPress} />
            {error && <ErrorComponent message={error} screen={true} />}
            <ViewComponent style={[commonStyles.mb24, commonStyles.rounded12, commonStyles.p14, commonStyles.p16, commonStyles.preferredPayment]}>
              <ViewComponent style={[commonStyles.flexRow, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb8]}>
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, { fontWeight: 'bold' }]}>
                  {t("GLOBAL_CONSTANTS.SET_PRREFERRRED_PAYMENT")}
                </ParagraphComponent>
                <CustomSwitch value={preferredEnabled} onValueChange={handlePreferredSwitch} />
              </ViewComponent>
              <ParagraphComponent text={t("GLOBAL_CONSTANTS.WHEN_ENABLED_YOU_CAN_THE_PRIMARY_CURRENCY_OF_YOUR_CURRENCIES")} style={[{ color: NEW_COLOR.TEXT_GREY }, commonStyles.fs12, commonStyles.fw400, commonStyles.mb8, { lineHeight: 18 }]} />
            </ViewComponent>

            {preferredEnabled && activeCoins.length > 0 && (
              <ViewComponent style={[commonStyles.flexRow, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb12]}>
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, { fontWeight: 'bold' }]}>
                  {t("GLOBAL_CONSTANTS.PAYMENT_PRIORITY")}
                </ParagraphComponent>
                <ParagraphComponent style={[commonStyles.textGrey, commonStyles.fs12, { textAlign: "right" }]}>
                  {t("GLOBAL_CONSTANTS.HOLD_TO_DRAG")}
                </ParagraphComponent>
              </ViewComponent>
            )}
            <DraggableFlatList
              data={preferredEnabled ? activeCoins : []}
              onDragEnd={({ data }) => {
                // setActiveCoins(data);
                const updatedData = data.map((coin, index) => ({ ...coin, recorder: index + 1 }));
                setActiveCoins(updatedData);
              }}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListFooterComponent={listFooterComponent}
              ListEmptyComponent={listEmptyComponent}

            />
          </Container>
          <ViewComponent style={[commonStyles.sectionGap]} />
          <ViewComponent style={[commonStyles.sectionGap]} />

          {/* === SAVE BUTTON REMAINS AT THE BOTTOM === */}
          {initialPreferredEnabled && (
            <ViewComponent style={[{ margin: 28 }]}>
              <ButtonComponent
                title="GLOBAL_CONSTANTS.SAVE"
                onPress={handleSave}
                customContainerStyle={[commonStyles.bg_yellow]}
                loading={btnLoader}
                disable={btnLoader}
              />
            </ViewComponent>
          )}
          <ViewComponent style={[commonStyles.sectionGap]} />
        </>
      )}
      {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
    </ViewComponent>
  );
};

export default PaymentPriority;

