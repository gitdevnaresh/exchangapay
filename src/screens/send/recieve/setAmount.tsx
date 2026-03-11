import { useThemeColors } from "../../../hooks/useThemeColors";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../newComponents/view/view";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import { useNavigation } from "@react-navigation/native";
import { s } from "../../../constants/theme/scale";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import CurrencyDropdown, { CurrencyDropdownRef, Currency } from "../../commonScreens/CurrencyDropDown/CurrencyDropdown";
import AmountInput from "../../../newComponents/numericInputs/amountInput";
import ButtonComponent from "../../../newComponents/buttons/button";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { Keyboard } from "react-native";
import { Formik } from "formik";
import FormikTextInput from "../../../newComponents/textInputComponents/formik/textInput";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";
import { useLngTranslation } from "../../../hooks/useLngTranslation";

const SetAmount = (props: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const currencySheetRef = useRef<CurrencyDropdownRef>(null);
  const [error,setError]=useState<string>(""); 
  const [loading, setLoading] = useState(false);
  const { t } = useLngTranslation();
  const [amount, setAmount] = useState<string>(
    props?.route?.params?.initialAmount !== undefined
      ? String(props.route.params.initialAmount)
      : ""
  );
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    props?.route?.params?.initialCurrency || null
  );

  useHardwareBackHandler(() => {
    handleBackpress();
    return true;
  });

  // Helper to remove commas and parse amount
  const parseAmountValue = (amountStr: string): number => {
    return parseFloat(amountStr.replace(/,/g, "")) || 0;
  };

  const handleSummary = (note: string) => {
    setError("");
    Keyboard.dismiss();
    setLoading(true);
    if (!selectedCurrency) {
      setError(t("GLOBAL_CONSTANTS.PLEASE_SELECT_CURRENCY"));
      setLoading(false);
      return;
    }
    const numericAmount = parseAmountValue(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError(t("GLOBAL_CONSTANTS.PLEASE_ENTER_A_VALID_AMOUNT"));
      setLoading(false);
      return;
    }

    // ✅ Pass note along with amount + currency
    props.route.params?.onAmountChange?.(
      numericAmount,
      selectedCurrency,
      "setAmountScreen",
      note
    );

    setLoading(false);
    navigation.goBack();
  };

  const handleBackpress = () => {
    navigation.goBack();
  };

  const handleOpenCurrencySheet = () => {
    setError("");
    Keyboard.dismiss();
    currencySheetRef.current?.open();
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[{ flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <Container>
          <PageHeader title={"GLOBAL_CONSTANTS.SET_AMOUNT"} onBackPress={handleBackpress} />
           { error&&<ErrorComponent message={error} screen={true}/>}
          {/* Currency Selection */}
          <ViewComponent
            style={[
              commonStyles.mxAuto,
              commonStyles.networkDropdown,
              commonStyles.mt16,
            ]}
          >
            <CommonTouchableOpacity
              style={[
                commonStyles.dflex,
                commonStyles.gap8,
                commonStyles.py8,
                commonStyles.alignCenter,
              ]}
              activeOpacity={0.8}
              onPress={handleOpenCurrencySheet}
            >
              <ParagraphComponent
                style={[
                  commonStyles.fs12,
                  commonStyles.fw400,
                  commonStyles.list_text,
                ]}
                text={selectedCurrency?.walletCode || "Select Currency"}
              />
              <MaterialIcons
                name="keyboard-arrow-down"
                size={s(20)}
                color={NEW_COLOR.LIST_TEXT}
              />
            </CommonTouchableOpacity>
          </ViewComponent>

          {/* Amount Input */}
          <ViewComponent
            style={{ alignItems: "center", marginBottom: s(32) }}
          >
            <AmountInput
              value={amount}
              onChangeText={setAmount}
              inputStyle={[commonStyles.fw700, { fontSize: s(60) }]}
            />
          </ViewComponent>

          <ViewComponent style={[commonStyles.sectionGap]} />

          {/* Add a Note with Formik */}
          <Formik
            initialValues={{ note: props?.route?.params?.note ?? "" }}
            onSubmit={(values) => {
              handleSummary(values.note); // ✅ note comes from Formik
            }}
          >
            {({ handleSubmit }) => (
              <ViewComponent style={{ flex: 1 }}>
                <FormikTextInput
                  name="note"
                  label="GLOBAL_CONSTANTS.RECEIVE_ADD_A_NOTE"
                  placeholder="GLOBAL_CONSTANTS.ENTER_A_NOTE"
                  numberOfLines={3}
                  maxLength={150}
                />

                <ViewComponent style={[commonStyles.sectionGap]} />
                <ViewComponent style={[commonStyles.flex1]} />

                {/* Continue Button */}
                <ButtonComponent
                  title="GLOBAL_CONSTANTS.CONTINUE"
                  onPress={handleSubmit} // ✅ use Formik's handleSubmit
                  loading={loading}
                  disable={loading}
                />
              </ViewComponent>
            )}
          </Formik>

          <ViewComponent style={[commonStyles.sectionGap]} />
        </Container>

        {/* Currency Dropdown */}
        <CurrencyDropdown
          ref={currencySheetRef}
          title="GLOBAL_CONSTANTS.SELECT_CURRENCY"
          currencies={props?.route?.params?.currencyList}
          onCurrencySelect={(currency) => {
            setSelectedCurrency(currency);
            setAmount("");
          }}
          selectedCurrency={selectedCurrency || undefined}
        />
      </KeyboardAwareScrollView>
    </ViewComponent>
  );
};

export default SetAmount;
