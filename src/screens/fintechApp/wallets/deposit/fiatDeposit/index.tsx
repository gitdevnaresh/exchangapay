import React, { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useIsFocused } from '@react-navigation/native';
import Container from '../../../../../components/container/container';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { isErrorDispaly } from '../../../../../utils/helpers';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import DashboardLoader from '../../../../../components/loader';
import WalletsService from '../../../../../apiServices/wallets';
import CopyCard from '../../../../../components/copyIcon/CopyCard';
import FlatListComponent from '../../../../../components/flatList/flatList';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import NoDataComponent from '../../../../../components/noData/noData';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';

interface FiatDepositProps {
  route: {
    params: {
      currency: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const FiatDeposit = React.memo((props: FiatDepositProps) => {
  const isFocused = useIsFocused();
  const [depositDetails, setDepositDetails] = useState<any[]>([]);
  const [errormsg, setErrormsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [coinsList, setCoinsList] = useState<any>([]);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { decryptAES } = useEncryptDecrypt();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const currency = props.route.params.currency;

  useEffect(() => {
    getFiatVaultsList();
  }, [isFocused]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        backArrowButtonHandler();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (currency && coinsList.length > 0) {
      const defaultCoin = coinsList.find((coin: any) => coin.code === currency.toUpperCase());
      if (defaultCoin) {
        setSelectedCoin(defaultCoin);
        getDepositDetails(defaultCoin.code);
      }
    }
  }, [coinsList, currency]);

  const getFiatVaultsList = async () => {
    try {
      const response: any = await WalletsService.getFiatVaultsList();
      if (response?.ok) {
        setCoinsList(response.data?.assets || []);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const getDepositDetails = async (selectedCurrency?: string) => {
    const currencyToUse = selectedCurrency || currency;
    setLoading(true);
    setErrormsg("");
    try {
      const response: any = await WalletsService.getSelectedFiatDeposteDetails(currencyToUse.toUpperCase());
      if (response?.ok) {
        setDepositDetails(response?.data || []);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error: any) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      Clipboard.setString(text);
    } catch (error: any) {
      Alert.alert('Failed to copy text to clipboard', error);
    }
  };

  const handleError = useCallback(() => {
    setErrormsg("");
  }, []);

  const backArrowButtonHandler = (): void => {
    props.navigation.goBack();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getFiatVaultsList();
      if (selectedCoin) {
        await getDepositDetails(selectedCoin.code);
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {loading ? (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaViewComponent>
      ) : (
        <Container style={commonStyles.container}>
          <PageHeader title={`Deposit ${selectedCoin?.code || currency}`} onBackPress={backArrowButtonHandler} />
          <ScrollViewComponent
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          >
            {errormsg != "" && <ErrorComponent message={errormsg} onClose={handleError} />}

            {depositDetails.length === 0 && selectedCoin && (
              <ViewComponent style={[commonStyles.sectionGap]}>
                <NoDataComponent />
              </ViewComponent>
            )}

            {depositDetails.length > 0 && (
              <ViewComponent>
                {depositDetails[0]?.reference && (
                  <ViewComponent style={[commonStyles.sectionGap]}>
                    <ViewComponent style={[]}>
                      <TextMultiLanguage
                        text="GLOBAL_CONSTANTS.CUSTOMER_ID"
                        style={[commonStyles.listsecondarytext]}
                      />
                      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt8]}>
                        <ParagraphComponent
                          text={decryptAES(depositDetails[0].reference)}
                          style={[commonStyles.listprimarytext, commonStyles.flex1]}
                        />
                        <CopyCard onPress={() => copyToClipboard(decryptAES(depositDetails[0].reference))} />
                      </ViewComponent>
                    </ViewComponent>
                  </ViewComponent>
                )}

                <FlatListComponent
                  data={depositDetails}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item: bank, index }) => (
                    <ViewComponent style={[commonStyles.sectionGap]}>
                      <ParagraphComponent
                        text={bank.name}
                        style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
                      />
                      <ViewComponent style={[]}>
                        <TextMultiLanguage
                          text="GLOBAL_CONSTANTS.BENEFICIAR_NAME"
                          style={[commonStyles.listsecondarytext]}
                        />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt8,]}>
                          <ParagraphComponent
                            text={bank?.beneficiaryName || '--'}
                            style={[commonStyles.listprimarytext, commonStyles.flex1, commonStyles.flex1]}
                          />
                        </ViewComponent>
                      </ViewComponent>
                      <ViewComponent style={[commonStyles.listGap]} />
                      <ViewComponent style={[]}>
                        <TextMultiLanguage
                          text="GLOBAL_CONSTANTS.BANK_ACCOUNT_NUMBER_IBAN"
                          style={[commonStyles.listsecondarytext,]}
                        />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.mt8]}>
                          <ParagraphComponent
                            text={decryptAES(bank.accountOrIbanNumber)}
                            style={[commonStyles.listprimarytext, commonStyles.flex1]}
                          />
                          <CopyCard onPress={() => copyToClipboard(decryptAES(bank.accountOrIbanNumber))} />
                        </ViewComponent>
                      </ViewComponent>
                      <ViewComponent style={[commonStyles.listGap]} />
                      <ViewComponent style={[]}>
                        <TextMultiLanguage
                          text="GLOBAL_CONSTANTS.BANK_ADDRESS"
                          style={[commonStyles.listsecondarytext]}
                        />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt8,]}>
                          <ParagraphComponent
                            text={bank.address}
                            style={[commonStyles.listprimarytext, commonStyles.flex1, commonStyles.flex1]}
                          />
                        </ViewComponent>
                      </ViewComponent>
                      <ViewComponent style={[commonStyles.listGap]} />

                      <ViewComponent style={[]}>
                        <ViewComponent>
                          <ParagraphComponent
                            text="GLOBAL_CONSTANTS.FOR_DOMESTIC_WIRES"
                            multiLanguageAllows
                            style={[commonStyles.listsecondarytext]}
                          />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt8]}>
                          <ParagraphComponent
                            text={bank.routingNumber}
                            style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite]}
                          />
                          <CopyCard onPress={() => copyToClipboard(bank.routingNumber)} />
                        </ViewComponent>
                      </ViewComponent>
                      <ViewComponent style={[commonStyles.listGap]} />

                      <ViewComponent style={[]}>
                        <ViewComponent>
                          <ParagraphComponent
                            text="GLOBAL_CONSTANTS.FOR_INTERNATIONAL_WIRES"
                            multiLanguageAllows={true}
                            style={[commonStyles.listsecondarytext]}
                          />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt8]}>
                          <ParagraphComponent
                            text={bank.swiftOrBicCode}
                            style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite]}
                          />
                          <CopyCard onPress={() => copyToClipboard(bank.swiftOrBicCode)} />
                        </ViewComponent>
                      </ViewComponent>

                      {index < depositDetails.length - 1 && <ViewComponent style={[]} />}
                    </ViewComponent>
                  )}
                />

                <ViewComponent style={[]}>
                  <TextMultiLanguage
                    text="GLOBAL_CONSTANTS.DEPOSIT_INSTRUCTIONS"
                    style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.titleSectionGap]}
                  />

                  <ViewComponent style={[commonStyles.dflex, commonStyles.gap16,]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                      <TextMultiLanguage
                        text="GLOBAL_CONSTANTS.IMPORTANT"
                        style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite, commonStyles.mb6]}
                      />
                      <TextMultiLanguage
                        text="GLOBAL_CONSTANTS.REFERENCE_CODE_INSTRUCTION"
                        style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.sectionGap]}
                      />
                    </ViewComponent>
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>
            )}
          </ScrollViewComponent>
        </Container>
      )}
    </ViewComponent>
  );
});

export default FiatDeposit;
