
import { View } from "react-native"
import { getThemedCommonStyles } from "../../../../../components/CommonStyles"
import { Formik } from "formik"
import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { isErrorDispaly } from "../../../../../utils/helpers"
import { MembershipSchema } from "../validationSchema" // Ensure this is updated
import { DataState, InitValues, PostObject, UpgradeMembershipProps, NetworkInfo } from "../feeinterfaces" // Ensure this is updated
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay"
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors"
import ButtonComponent from "../../../../../components/buttons/button"
import CurrencyNetworkSelector from "../../../../../components/currencyNetworkSelector/CurrencyNetworkSelector"
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText"
import { useIsFocused } from "@react-navigation/native"
import ViewComponent from "../../../../../components/view/view"
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph"
import { FeeUpgradeSkeleton } from "../../../cards/skeltons"
import { ProfileGeneralServices } from "../../../../../apiServices/profile/general"
const UpgradeMemberShip = (props: UpgradeMembershipProps) => {
  const [data, setData] = useState<DataState>({
    loading: false,
    defaultVaultDetails: null,
    errorMessage: '',
    selectedCoinCode: '',
    networks: [],
    availableBalance: 0,
    amount: '',
    selectedNetworkId: '',
    address: '',
    buttonLoader: false,
    loader: false,
  });
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const isFocused = useIsFocused();
  useEffect(() => {
    getDefaultVaultAndCoins();
  }, [isFocused]);

  const [initValues] = useState<InitValues>({
    currency: '',
    network: '',
  });

  const getDefaultVaultAndCoins = async () => {
    setData((prev) => ({ ...prev, errorMessage: '', loader: true }));
    try {
      const response: any = await ProfileGeneralServices.getVaultsData();
      if (response?.ok) {
        if (response.data && response.data.length > 0) {
          const defaultVault = response.data[0];
          let initialSelectedCoinCode = '';
          let initialNetworks: NetworkInfo[] = [];
          let initialAvailableBalance = 0;
          let initialSelectedNetworkId = '';
          let initialAddress = '';
          if (defaultVault.details && defaultVault.details.length > 0) {
            const firstCoinDetail = defaultVault.details[0];
            initialSelectedCoinCode = firstCoinDetail.code;
            initialNetworks = firstCoinDetail.networks || [];

            if (initialNetworks.length > 0) {
              const firstNetworkDetail = initialNetworks[0];
              initialAvailableBalance = firstNetworkDetail.balance;
              initialSelectedNetworkId = firstNetworkDetail.id;
              initialAddress = firstNetworkDetail.address || '';
            }
          }

          setData((prev) => ({
            ...prev,
            defaultVaultDetails: defaultVault,
            errorMessage: '',
            selectedCoinCode: initialSelectedCoinCode,
            networks: initialNetworks, // Set networks for the first coin
            availableBalance: initialAvailableBalance,
            selectedNetworkId: initialSelectedNetworkId,
            address: initialAddress,
            amount: '',
            loader: false
          }));
        } else {
          setData((prev) => ({ ...prev, errorMessage: "No vaults available.", loader: false }));
        }
      } else {
        setData((prev) => ({ ...prev, errorMessage: isErrorDispaly(response), loader: false }));
      }
    } catch (error) {
      setData((prev) => ({ ...prev, errorMessage: isErrorDispaly(error), loader: false }));
    }
  };

  useEffect(() => {
    if (data.selectedCoinCode && data.selectedNetworkId && data.amount === '') {
      getAmountData(data.selectedCoinCode);
    }
  }, [data.selectedCoinCode, data.selectedNetworkId, data.amount]); // Re-run if these change


  const backArrowButtonHandler = useCallback(() => {
    if (props.onSheetClose) {
      props.onSheetClose();
    }
  }, [props]);

  const onSubmit = async (values: any) => {
    setData((prev) => ({ ...prev, errorMessage: '', buttonLoader: true }));
    const postObject: PostObject = {
      cryptoWalletId: data?.selectedNetworkId,
      membershipId: props?.route?.params.membershipId,
    };

    try {
      const response = await ProfileGeneralServices.getMembershipConfirm(postObject);
      if (response.ok) {
        setData((prev) => ({
          ...prev,
          errorMessage: '',
          buttonLoader: false,
        }));
        if (props.onUpgradeSuccess) {
          props.onUpgradeSuccess(
            response.data,
            data.selectedNetworkId,
            props.route.params.membershipName,
            props.route.params.membershipPrice,
            props.route.params.membershipId
          );
        }
      } else {
        setData((prev) => ({ ...prev, errorMessage: isErrorDispaly(response), buttonLoader: false }));
      }
    } catch (error) {
      setData((prev) => ({ ...prev, errorMessage: isErrorDispaly(error), buttonLoader: false }));
    }
  };

  const getAmountData = async (coinCode?: string) => {
    setData((prev) => ({ ...prev, errorMessage: '' }));
    try {
      const response: any = await ProfileGeneralServices.getAmountData(userInfo?.currency, coinCode || data.selectedCoinCode, props?.route?.params?.membershipPrice);
      if (response?.ok) {
        setData((prev) => ({ ...prev, amount: parseFloat(response?.data).toFixed(8) })); // Using toFixed(8) for crypto precision
        setData((prev) => ({ ...prev, errorMessage: '' }));
      } else {
        setData((prev) => ({ ...prev, errorMessage: isErrorDispaly(response) }));
      }
    } catch (error) {
      setData((prev) => ({ ...prev, errorMessage: isErrorDispaly(error) }));
    }
  };
  const handleCloseError = useCallback(() => {
    setData((prev) => ({ ...prev, errorMessage: '' }));
  }, []);

  const transformedCurrencyData = data.defaultVaultDetails?.details?.map((currencyItem: any) => ({
    id: currencyItem.code,
    name: currencyItem.coin,
    code: currencyItem.code,
    logo: currencyItem.logo || '', // Assuming logo might be available, else provide placeholder
    networkDetails: currencyItem.networks.map((net: any) => ({
      network: net.name,
      name: net.name,
      balance: net.balance,
      id: net.id,
    })),
  })) ?? [];
  const transformedNetworkData = data.networks?.map((networkOnCoin: any) => ({
    id: networkOnCoin.id,
    name: networkOnCoin.name,
    network: networkOnCoin.name,
    code: networkOnCoin.name,
    balance: networkOnCoin.balance,
    address: networkOnCoin.address,
  })) ?? [];
  return (
    <View>
      {data.errorMessage && <ErrorComponent message={data.errorMessage} onClose={handleCloseError} />}
      <KeyboardAwareScrollView
        contentContainerStyle={[{ flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <Formik
          initialValues={initValues}
          onSubmit={onSubmit}
          validationSchema={MembershipSchema}
          enableReinitialize
          validateOnChange={true}
          validateOnBlur={true}
        >
          {(formik) => {
            const { handleSubmit, setFieldValue, values } = formik;
            return (<View>
              <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.mb10]} text="GLOBAL_CONSTANTS.COIN"  >
                <ParagraphComponent text=" *" style={[commonStyles.textRed]} />
              </ParagraphComponent>
              <CurrencyNetworkSelector
                currencyData={transformedCurrencyData}
                networkData={transformedNetworkData}
                selectedCurrency={values.currency}
                selectedNetwork={values.network}
                onSelect={(currency, network) => {
                  setData(prev => ({
                    ...prev,
                    loader: true,
                  }));
                  let newSelectedCoinCode = data.selectedCoinCode;
                  let newNetworks = data.networks;
                  let newAvailableBalance = data.availableBalance;
                  let newSelectedNetworkId = data.selectedNetworkId;
                  let newAddress = data.address;
                  let resetAmountForFetch = false;
                  setFieldValue("currency", currency);
                  if (network) {
                    setFieldValue("network", network);
                  } else {
                    if (values.currency !== currency) {
                      setFieldValue("network", "");
                    }
                  }
                  if (data.selectedCoinCode !== currency) {
                    const coinDetail = data.defaultVaultDetails?.details?.find((c: any) => c.code === currency);
                    if (coinDetail) {
                      newSelectedCoinCode = currency;
                      newNetworks = coinDetail.networks || [];
                      newAvailableBalance = 0;
                      newSelectedNetworkId = '';
                      newAddress = '';
                      resetAmountForFetch = true;
                    }
                  }
                  const networksToSearch = (data.selectedCoinCode !== currency) ? newNetworks : data.networks;

                  if (network) { // A network code is provided
                    const networkDetail = networksToSearch.find((net: NetworkInfo) => net.code === network || net.name === network);
                    if (networkDetail) {
                      if (data.selectedNetworkId !== networkDetail.id || data.selectedCoinCode !== currency) {
                        newAvailableBalance = networkDetail.balance;
                        newSelectedNetworkId = networkDetail.id;
                        newAddress = networkDetail.address || '';
                        resetAmountForFetch = true; // Signal to reset amount and re-fetch
                      }
                    } else { // Network code provided, but not found (e.g., invalid selection)
                      newAvailableBalance = 0;
                      newSelectedNetworkId = '';
                      newAddress = '';
                      resetAmountForFetch = true; // Reset amount as network context is now invalid/cleared
                    }
                  } else if (data.selectedCoinCode === currency && data.selectedNetworkId !== '') {
                    newAvailableBalance = 0;
                    newSelectedNetworkId = '';
                    newAddress = '';
                    resetAmountForFetch = true; // Reset amount
                  }

                  setData(prev => ({
                    ...prev,
                    selectedCoinCode: newSelectedCoinCode,
                    networks: newNetworks,
                    availableBalance: newAvailableBalance,
                    selectedNetworkId: newSelectedNetworkId,
                    address: newAddress,
                    amount: resetAmountForFetch ? '' : prev.amount, // Reset amount only if necessary
                    loader: false, // Set loader to false when selection processing is done
                  }));
                }}
              />
              {data?.loader && <FeeUpgradeSkeleton />}
              <View style={[commonStyles.sectionGap]} />
              {!data?.loader && <View>
                <View style={[commonStyles.dflex, commonStyles.justifyContent]}>
                  <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.MEMBER_SHIP_NAME"} />
                  <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} text={props?.route?.params?.membershipName || "---"} />
                </View>
                <ViewComponent style={[commonStyles.listGap]} />
                <View style={[commonStyles.dflex, commonStyles.justifyContent]}>
                  <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.MEMBER_SHIP_PRICE"} />
                  <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} text={`${props?.route?.params.membershipPrice || "0"} ${userInfo?.currency}`} />
                </View>
                <ViewComponent style={[commonStyles.listGap]} />

                <View style={[commonStyles.dflex, commonStyles.justifyContent]}>
                  <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey]} text={"Total Payable Amount"} />
                  <CurrencyText style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} value={Number(data?.amount) || 0} currency={data.selectedCoinCode} />
                </View>
                <ViewComponent style={[commonStyles.listGap]} />

                <View style={[commonStyles.dflex, commonStyles.justifyContent]}>
                  <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.AVAILABLE_BAL"} />
                  <CurrencyText style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} value={data?.availableBalance || 0} currency={data.selectedCoinCode} />
                </View>
              </View>}
              <View style={[commonStyles.sectionGap]} />
              <ViewComponent style={[commonStyles.mt32]} />
              <View style={[commonStyles.dflex, commonStyles.gap10]}>
                <View style={[commonStyles.flex1]}>
                  <ButtonComponent disable={data?.buttonLoader} solidBackground={true} title={"GLOBAL_CONSTANTS.CANCEL"} onPress={backArrowButtonHandler} />
                </View>
                <View style={[commonStyles.flex1]}>
                  <ButtonComponent loading={data?.buttonLoader} title={"GLOBAL_CONSTANTS.YES"} onPress={handleSubmit} />
                </View>
              </View>
              <View style={[commonStyles.mb36]} />
            </View>)
          }}
        </Formik></KeyboardAwareScrollView>
    </View>
  )
}

export default UpgradeMemberShip;
