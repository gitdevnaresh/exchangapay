import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import Container from "../../../../../components/container/container";
import { isErrorDispaly } from '../../../../../utils/helpers';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useIsFocused } from '@react-navigation/native';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import WalletsService from '../../../../../apiServices/wallets';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import DashboardLoader from "../../../../../components/loader";
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import AssetListComponent from '../vaults/AssetListComponent';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { FiatAsset, FiatData, FiatLoaders } from '../vaults/interface';

interface AssetSelectorProps {
  route: {
    params: {
      screenType: 'deposit' | 'Withdraw';
      title?: string;
    };
  };
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  handleItemPress?: (item: FiatAsset) => void;
  backNavigation?: () => void;
}

const AssetSelector = (props: AssetSelectorProps) => {
  const [errormsg, setErrormsg] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const isFocused = useIsFocused();
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const { screenType, title } = props.route.params;

  const [loaders, setLoaders] = useState<FiatLoaders>({
    fiatDataLoading: false,
  });

  const [fiatData, setFiatData] = useState<FiatData>({
    totalBalanceInUSD: 0,
    assets: [],
    assetsPrev: []
  });

  const [selectedItem, setSelectedItem] = useState<FiatAsset | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    getFiatAssets();
  }, [isFocused]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        props.backNavigation();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);
  const getFiatAssets = async (): Promise<void> => {
    setErrormsg("");
    setLoaders((prev: FiatLoaders) => ({ ...prev, fiatDataLoading: true }));
    try {
      let response
      if (screenType?.toLocaleLowerCase() === 'withdraw') {
        response = await WalletsService.getFiatCoinListsList(screenType);
      } else {
        response = await WalletsService.getFiatVaultsList();
      }
      if (response?.ok) {
        setErrormsg("");
        const responseData = response?.data as { totalBalanceInUSD?: number; assets?: FiatAsset[] };
        setFiatData({
          totalBalanceInUSD: responseData?.totalBalanceInUSD || 0,
          assets: responseData?.assets || [],
          assetsPrev: responseData?.assets || []
        });
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setLoaders((prev: FiatLoaders) => ({ ...prev, fiatDataLoading: false }));
    }
  };

  const onRefresh = async () => {
    setRefresh(true);
    try {
      await getFiatAssets();
    } finally {
      setRefresh(false);
    }
  };

  const handleChangeSearch = useCallback((val: string): void => {
    const value = val.trim();
    setSearchText(value);
    if (value) {
      const filterData = fiatData?.assetsPrev?.filter((item: FiatAsset) =>
        item.code?.toLowerCase().includes(value.toLowerCase())
      ) || [];
      setFiatData((prev: FiatData) => ({ ...prev, assets: filterData }));
    } else {
      setFiatData((prev: FiatData) => ({ ...prev, assets: fiatData?.assetsPrev }));
    }
  }, [fiatData?.assetsPrev]);

  const handleSelectedItem = (item: FiatAsset): void => {
    setSelectedItem(item);
  };

  const handleCloseError = useCallback(() => {
    setErrormsg("");
  }, []);
  const handleBack = () => {
    if (props.backNavigation) {
      props.backNavigation();
    } else {
      props.navigation.goBack();
    }
  };
  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container style={[commonStyles.container, commonStyles.flex1]}>
        <PageHeader
          title={title || `${t('GLOBAL_CONSTANTS.SELECT_ASSET_FOR')} ${t(screenType)}`}
          onBackPress={handleBack}
        />

        {loaders?.fiatDataLoading && (
          <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
            <DashboardLoader />
          </SafeAreaViewComponent>
        )}

        {!loaders?.fiatDataLoading && (
          <ScrollViewComponent
            showsVerticalScrollIndicator={false}
            refreshing={refresh}
            onRefresh={onRefresh}
          >
            {errormsg !== "" && (
              <ErrorComponent
                message={errormsg}
                onClose={handleCloseError}
              />
            )}

            <AssetListComponent
              assets={fiatData?.assets}
              selectedItem={selectedItem}
              searchText={searchText}
              onSearchChange={handleChangeSearch}
              onItemSelect={handleSelectedItem}
              onItemPress={props.handleItemPress ? props.handleItemPress : handleSelectedItem}
            />
          </ScrollViewComponent>
        )}

      </Container>
    </ViewComponent>
  );
};

export default AssetSelector;
