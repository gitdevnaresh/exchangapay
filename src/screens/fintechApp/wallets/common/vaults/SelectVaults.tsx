import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, BackHandler } from 'react-native';
import Container from "../../../../../components/container/container";
import { isErrorDispaly } from '../../../../../utils/helpers';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import SelectVault from '../../../../commonScreens/vaults/selectVaults';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import DashboardLoader from "../../../../../components/loader";
import AssetsSection from '../../../Dashboard/components/AssetsSection';
import { getTabsConfigation } from '../../../../../../cofiguration';

import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import WalletsService from '../../../../../apiServices/wallets';

const SelectVaults = React.memo((props: any) => {
  const [errormsg, setErrormsg] = useState("");
  const isFocused = useIsFocused();

  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const [loaders, setLoaders] = useState<any>({
    coinDtaLoading: false,
    totalBalLoading: false,
    isLoadingAssts: false,
    addModelVisible: false,
    kycModelVisible: false,
  });

  const [lists, setLists] = useState<any>({
    vaultsList: [],
    vaultsPrevList: [],
    coinsList: [],
    coinsPrevList: [],
    cryptoData: []
  });
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    getCryptoCoins();
  }, [isFocused]);

  const handleRefresh = () => {
    getCryptoCoins();
  };

  const onRefresh = async () => {
    setRefresh(true);
    try {
      await getCryptoCoins();
    } finally {
      setRefresh(false);
    }
  };

  const backArrowButtonHandler = useCallback(() => {
    props.navigation.goBack();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        backArrowButtonHandler();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [backArrowButtonHandler])
  );


  const getCryptoCoins = async () => {
    setErrormsg("");
    setLoaders((prev: any) => ({ ...prev, coinDtaLoading: true }));
    try {
      const response: any = await WalletsService.getShowAssets();
      if (response?.ok) {
        setErrormsg("");
        setLists((prev: any) => ({
          ...prev,
          vaultsList: response?.data?.wallets,
          vaultsPrevList: response?.data?.wallets,
          coinsList: response?.data?.wallets[0]?.assets || [],
          coinsPrevList: response?.data?.wallets[0]?.assets || []
        }));
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setLoaders((prev: any) => ({ ...prev, coinDtaLoading: false }));
    }
  };
  const handleCryptoCoinDetails = (val: any, selectedVault: any) => {
    if (props.route?.params?.screenName == "Deposit") {
      props.navigation.push("CryptoDeposit", {
        propsData: {
          cryptoCoin: val?.code,
          coinBalance: val?.amount,
          coinValue: val?.coinValueinNativeCurrency,
          coinNa: val?.walletCode,
          oneCoinVal: val?.amountInUSD,
          percentages: val?.percent_change_1h,
          logo: val?.logo,
          coinName: val?.code,
          marchentId: selectedVault?.id,
          merchantName: selectedVault?.merchantName || selectedVault?.name,
          coinId: val?.id
        }
      });
    } else {
      const screenName = props.route?.params?.screenName || "Wallets";
      const originalSource = props.route?.params?.originalSource || "Wallets";
      props.navigation.push("CrptoWithdraw", {
        propsData: {
          cryptoCoin: val?.code,
          coinBalance: val?.amount,
          coinValue: val?.coinValueinNativeCurrency,
          coinNa: val?.walletCode,
          oneCoinVal: val?.amountInUSD,
          percentages: val?.percent_change_1h,
          logo: val?.logo,
          coinName: val?.code,
          marchentId: selectedVault?.id,
          merchantName: selectedVault?.merchantName || selectedVault?.name,
          coinId: val?.id
        },
        screenName: screenName,
        originalSource: originalSource
      });
    }

  };

  const handleChangeSearch = useCallback((val: string) => {
    const value = val.trim();
    if (value) {
      const filterData = lists?.coinsPrevList?.filter((item: any) =>
        item.code?.toLowerCase().includes(value.toLowerCase()) ||
        item.name?.toLowerCase().includes(value.toLowerCase())
      );
      setLists((prev: any) => ({ ...prev, coinsList: filterData }));
    } else {
      setLists((prev: any) => ({ ...prev, coinsList: lists?.coinsPrevList }));
    }
  }, [lists?.coinsPrevList]);

  const handleCloseErrror = useCallback(() => {
    setErrormsg("");
  }, []);

  const setCoinsList = (data: any) => {
    setLists((prev: any) => ({
      ...prev,
      coinsList: data || [],
      coinsPrevList: data || []
    }));
  };


  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>

      {loaders?.coinDtaLoading && (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaView>
      )}
      {!loaders?.coinDtaLoading && (
        <Container style={commonStyles.container}>
          <PageHeader
            title={"GLOBAL_CONSTANTS.WALLETS"}
            onBackPress={backArrowButtonHandler}
            isrefresh={true}
            onRefresh={handleRefresh}
          />


          <ScrollViewComponent
            refreshing={refresh}
            onRefresh={onRefresh}
          >
            {errormsg != "" && (
              <ErrorComponent
                message={errormsg}
                onClose={handleCloseErrror}
              />
            )}


            {/* Vault Select */}
            <ViewComponent>
              {lists?.vaultsList?.length > 1 ? (
                <SelectVault
                  setCoinsList={setCoinsList}
                  vaultsList={lists?.vaultsList}
                  coinsList={lists?.coinsList}
                  valutsPrevList={lists?.vaultsPrevList}
                  isLoading={loaders?.coinDtaLoading}
                  disable={true}
                  handleNavigate={handleCryptoCoinDetails}
                  handleChangeSearch={handleChangeSearch}
                  key={'selectVaultComponent'}
                />
              ) : (
                <AssetsSection
                  commonStyles={commonStyles}
                  GraphConfiguration={getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION')}
                  assets={lists?.coinsList}
                  vaultsLists={lists}
                  vaultCoinsLists={lists}
                  handleChangeSearch={handleChangeSearch}
                  handleNavigate={handleCryptoCoinDetails}
                  NEW_COLOR={NEW_COLOR}
                  setCoinsList={setCoinsList}
                  showHeader={false}
                />
              )}
            </ViewComponent>
            <ViewComponent style={[commonStyles?.mb20]} />
            <ViewComponent style={[commonStyles?.mb20]} />
          </ScrollViewComponent>
        </Container>)}
    </ViewComponent>
  );
});

export default SelectVaults;
