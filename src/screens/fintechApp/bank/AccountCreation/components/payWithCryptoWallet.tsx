import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PaywithCryptoLists, PayWithWalletFiatConfirm } from "./createAccConstant";
import Container from "../../../../../components/container/container";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import { CoinImages, getThemedCommonStyles } from "../../../../../components/CommonStyles";
import CreateAccountService from "../../../../../apiServices/bank/createAccount";
import { isErrorDispaly } from "../../../../../utils/helpers";
import ViewComponent from "../../../../../components/view/view";
import ScrollViewComponent from "../../../../../components/scrollView/scrollView";
import NoDataComponent from "../../../../../components/noData/noData";
import DashboardLoader from "../../../../../components/loader";
import AssetsSection from "../../../Dashboard/components/AssetsSection";
import SearchComponent from "../../../../../components/searchComponents/searchComponent";
import { getTabsConfigation } from "../../../../../../cofiguration";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";

const PayWithCryptoWallet = React.memo((props: any) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [errormsg, setErrormsg] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { selectedCurrency } = useSelector((state: any) => state.userReducer);
  const selectedBank = props.selectedBank || useSelector((state: any) => state.userReducer.selectedBank);
  const [lists, setlists] = useState<PaywithCryptoLists>({
    vaultsList: [],
    coinList: [],
    coinListPrev: [],
    networkList: [],
  });
  const [selectedCoin, setSelectedCoin] = useState<any>(null);

  useEffect(() => {
    getVults();
  }, [props?.isActiveTab]);

  const onRefresh = async () => {
    setRefresh(true);
    try {
      await getVults();
    } finally {
      setRefresh(false);
    }
  };

  const getVults = async () => {
    setIsLoading(true);
    setErrormsg("");
    try {
      const response: any = await CreateAccountService.getVaultList();
      if (response?.ok) {
        const vaultsList = response?.data || [];
        const defaultVault = vaultsList[0];
        const coins = defaultVault?.vaultDetails ? mapVaultDetailsToCoinList(defaultVault.vaultDetails) : [];
        setlists((prev) => ({ ...prev, vaultsList, coinList: vaultsList, coinListPrev: vaultsList, networkList: [] }));
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to map vault details to coin list
  const mapVaultDetailsToCoinList = (vaultDetails: any[]) => {
    return vaultDetails.map((data: any) => ({
      ...data,
      name: data.code,
      image: CoinImages[data.code?.toLowerCase()] || '',
      balance: data.amount || 0,
    }));
  };
  // Filtered coin list based on search
  const filteredCoinList = React.useMemo(() => {
    if (!searchText) return lists.coinList;
    return lists.coinList.filter((item: any) =>
      item.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [lists.coinList, searchText]);

  const handleSearchResult = (filteredData: any[]) => {
    setlists((prev) => ({ ...prev, coinList: filteredData }))
  };

  const handleContinue = async (selectedCoin: any) => {
    if (!selectedCoin?.amount || selectedCoin?.amount <= 0) {
      setErrormsg(`${t("GLOBAL_CONSTANTS.INSUFFICIENT_FUNDS")} for ${selectedCoin?.code || 'selected coin'}`);
      return;
    }
    if (!selectedCoin) return;
    const saveObj: PayWithWalletFiatConfirm = {
      walletId: selectedCoin?.id,
    };
    try {
      const response: any = await CreateAccountService.confirmPayWithWalleteCrypto(
        selectedBank?.productId,
        saveObj
      );
      if (response?.ok) {
        setSearchText('');
        props?.navigation?.navigate("payWithCryptoWalletSummery", {
          selectedAccount: selectedCurrency,
          selectedBank: selectedBank,
          selectedCoin: selectedCoin?.code,
          accountToCreate: response?.data?.accountToCreate,
          amount: response?.data?.amount,
          payingWalletCoin: response?.data?.payingWalletCoin,
          vaultName: response?.data?.vaultName,
          network: response?.data?.network,
          recieverWalletAddress: response?.data?.recieverWalletAddress || response?.data?.payingWalletAddress,
          payingWalletAddress: response?.data?.payingWalletAddress,
          payingWalletId: response?.data?.walletId,
          fromScreen: props.route.params.targetScreen
        });
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const handleSelectedCoin = (item: any) => {
    if (!item?.balance || item?.balance <= 0) {
      setSelectedCoin(item);
      setErrormsg(`${t("GLOBAL_CONSTANTS.INSUFFICIENT_FUNDS")} for ${item?.code || 'selected coin'}`);
      return;
    }
    setSelectedCoin(item);
    setErrormsg('');
  };

  const handleCloseError = useCallback(() => {
    setErrormsg("");
  }, []);


  return (
    <Container style={[commonStyles.screenBg]}>
      <ScrollViewComponent
        refreshing={refresh} onRefresh={onRefresh}
      >
        {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
        <ViewComponent style={[commonStyles.sectionGap]}>
          <SearchComponent
            key={props?.isFocused ? 'focused' : 'unfocused'}
            data={lists?.coinListPrev || []}
            onSearchResult={handleSearchResult}
          />
        </ViewComponent>
        {isLoading && (
          <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
            <DashboardLoader />
          </ViewComponent>
        )}
        {!isLoading && lists?.coinList && lists?.coinList.length > 0 && (
          <AssetsSection
            commonStyles={commonStyles}
            GraphConfiguration={getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION')}
            assets={lists?.coinList.map((item: any) => ({ ...item, amount: item.amount ?? item.balance ?? 0 }))}
            vaultsLists={lists}
            vaultCoinsLists={lists}
            handleChangeSearch={() => { }}
            handleNavigate={handleContinue}
            NEW_COLOR={NEW_COLOR}
            setCoinsList={(data: any) => setlists((prev) => ({ ...prev, coinList: data }))}
            showHeader={false}
          />
        )}
        {!isLoading && lists?.coinList?.length < 1 && (
          <ViewComponent>
            <NoDataComponent />
          </ViewComponent>
        )}
      </ScrollViewComponent>
    </Container>
  );
});

export default PayWithCryptoWallet;

