// WalletsService: API calls and response handling for wallets dashboard
import { homeServices } from "../apiServices/homeDashboard";
import WalletsService from "../apiServices/wallets";
import { isErrorDispaly } from "../utils/helpers";
import { showAppToast } from "../components/toasterMessages/ShowMessage";

export const getUserAccountsBalances = async (dispatch: any, setWalletsDashboard: any, setApiCallsCompleted?: any) => {
    try {
        const response: any = await homeServices.getTotalBalance();
        if (response?.ok) {
            dispatch(setWalletsDashboard({ balance: response?.data }));
        } else {
            showAppToast(isErrorDispaly(response), 'error');
        }
    } catch (error) {
        showAppToast(isErrorDispaly(error), 'error');
    } finally {
        setApiCallsCompleted && setApiCallsCompleted((prev: any) => ({ ...prev, balance: true }));
    }
};

export const getShownAssets = async (dispatch: any, setWalletsDashboard: any, setApiCallsCompleted?: any) => {
    try {
        const response: any = await WalletsService.getShowVaults();
        if (response?.ok) {
            const cryptoPayload = {
                assets: response?.data?.wallets[0]?.assets || [],
                defaultVault: response?.data?.wallets[0] || {}
            };
            dispatch(setWalletsDashboard({ cryptoAssets: cryptoPayload }));
        } else {
            showAppToast(isErrorDispaly(response), 'error');
        }
    } catch (error) {
        showAppToast(isErrorDispaly(error), 'error');
    } finally {
        setApiCallsCompleted && setApiCallsCompleted((prev: any) => ({ ...prev, cryptoList: true }));
    }
};

export const getFiatAssets = async (dispatch: any, setWalletsDashboard: any, setApiCallsCompleted?: any) => {
    try {
        const response: any = await ApiWalletsService.getFiatVaultsList();
        if (response?.ok) {
            dispatch(setWalletsDashboard({ fiatAssets: response?.data?.assets || [] }));
        } else {
            showAppToast(isErrorDispaly(response), 'error');
        }
    } catch (error) {
        showAppToast(isErrorDispaly(error), 'error');
    } finally {
        setApiCallsCompleted && setApiCallsCompleted((prev: any) => ({ ...prev, fiatList: true }));
    }
};

export const getGraphData = async (isDays: string, setGraphDetails: any, setGraphDetailsLoading: any, setGraphData7Days?: any, setGraphData30Days?: any, showAppToastFn?: any, NEW_COLOR?: any) => {
    setGraphDetailsLoading(true);
    try {
        const response: any = await WalletsService.getWalletsSpendingChartDashboard(isDays);
        if (response?.ok) {
            const chartData = response?.data?.transactionsModels;
            setGraphDetails(chartData);
            if (isDays === '7' && setGraphData7Days) {
                setGraphData7Days(chartData);
            } else if (isDays === '30' && setGraphData30Days) {
                setGraphData30Days(chartData);
            }
        } else {
            showAppToastFn && showAppToastFn(isErrorDispaly(response), 'error');
        }
    } catch (error) {
        showAppToastFn && showAppToastFn(isErrorDispaly(error), 'error');
    } finally {
        setGraphDetailsLoading(false);
    }
};
