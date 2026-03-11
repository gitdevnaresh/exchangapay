import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import TransactionService from '../../services/transaction';
import DepositeService from '../../services/depositeService';
import { isErrorDispaly } from '../../utils/helpers';
import { COMMON_SVG_URLS } from '../../assets/blobUrls';

interface FilterState {
  selectedTransactionType: string;
  selectedCurrency: string;
  selectedDateRange: { start: Date | null; end: Date | null };
}

interface FilterOptions {
  transactionTypeOptions: any[];
  currencyOptions: any[];
  dateQuickSelectOptions: any[];
}

interface FilterLoading {
  currencyLoading: boolean;
  transactionTypeLoading: boolean;
}

export const useTransactionFilters = (initialTransactionType?: string, screenName?: string) => {
  // Capitalize the first letter of transaction type for consistency
  const normalizedTransactionType = initialTransactionType
    ? initialTransactionType.charAt(0).toUpperCase() + initialTransactionType.slice(1).toLowerCase()
    : undefined;

  const [filterState, setFilterState] = useState<FilterState>({
    // Set default transaction type based on screenName
    selectedTransactionType: screenName === 'MyCards' ? 'All' : normalizedTransactionType || 'All',
    selectedCurrency: 'All',
    selectedDateRange: { start: null, end: null }
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    transactionTypeOptions: [{ label: 'All', value: 'All' }],
    currencyOptions: [{ label: 'All currencies', value: 'All' }],
    dateQuickSelectOptions: [
      { label: '1 Day', days: 1 },
      { label: '7 Days', days: 7 },
      { label: '30 Days', days: 30 },
      { label: '180 Days', days: 180 },
    ]
  });

  const [filterLoading, setFilterLoading] = useState<FilterLoading>({
    currencyLoading: false,
    transactionTypeLoading: false
  });

  const [transactionTypes, setTransactionTypes] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Bottom sheet refs
  const transactionTypeSheetRef = useRef<any>(null);
  const currencySheetRef = useRef<any>(null);
  const dateSheetRef = useRef<any>(null);

  // Effect to handle conditional logic based on screenName
  useEffect(() => {
    if (screenName === 'MyCards') {
      // Ensure the default selection is "Expense"
      setFilterState(prev => ({
        ...prev,
        selectedTransactionType: 'All',
      }));
    } else {
      // For all other screens, fetch the transaction types from the API
      getTransactionTypes();
    }
  }, [screenName]);


  const getTransactionTypeOptions = (transactionTypesData: any[]) => {
    if (transactionTypesData && transactionTypesData.length > 0) {
      const uniqueTypes = transactionTypesData.reduce((acc: any[], current: any) => {
        const existingType = acc.find((item: any) => item.name === current.name);
        if (!existingType) {
          acc.push(current);
        }
        return acc;
      }, []);

      const dynamicTransactionTypeOptions = uniqueTypes.map((type: any) => ({
        label: type.name,
        value: type.name,
        logo: type.logo,
        code: type.code,
        recorder: type.recorder
      }));

      // Check if Deposit already exists in the API response
      const hasDeposit = dynamicTransactionTypeOptions.some((type: any) =>
        type.value.toLowerCase() === 'deposit'
      );

      // Add Deposit if it doesn't exist
      const finalTransactionTypeOptions = hasDeposit
        ? dynamicTransactionTypeOptions
        : [
          ...dynamicTransactionTypeOptions,
          ...(screenName !== 'MyCards'
            ? [{ label: 'Deposit', value: 'Deposit', logo: null, code: 'deposit', recorder: null }]
            : [])
        ];

      setFilterOptions(prev => ({
        ...prev,
        transactionTypeOptions: [...finalTransactionTypeOptions]
      }));
    }
  };


  const getCurrencyOptions = async () => {
    // Check if the current screen is 'MyCards'
    if (screenName === 'MyCards') {
      try {
        setFilterLoading(prev => ({ ...prev, currencyLoading: true }));

        // Fetch card information from the API
        const response: any = await TransactionService.getCardsInfo();

        if (response.status == 200) {
          // Format the card data from the API to be used in the filter options
          const dynamicCardOptions = response?.data?.map((card: any) => ({
            label: `${card.cardType} **** ${card?.cardNumber?.slice(-4)}`,
            value: card.id,
            logo: card.logo,
            id: card.id,
            name: card.name
          }));

          // Update the filter options state with the new card list
          const cardOptions =
            response.data?.length > 0
              ? [
                {
                  label: 'All cards',
                  value: 'All',
                  logo: 'https://stgexchangapaystorage.blob.core.windows.net/images/swokipay/Swokipaycard.png',
                },
                ...dynamicCardOptions,
              ]
              : [...dynamicCardOptions]; // or [] if you want to skip all when no data

          setFilterOptions(prev => ({
            ...prev,
            currencyOptions: cardOptions,
          }));
        }
        else {
          setErrorMessage(isErrorDispaly(response));
        }
      } catch (error) {
        setErrorMessage(isErrorDispaly(error));
      } finally {
        setFilterLoading(prev => ({ ...prev, currencyLoading: false }));
      }
    } else {
      // Original logic to fetch currencies for other screens
      try {
        setFilterLoading(prev => ({ ...prev, currencyLoading: true }));
        const response: any = await DepositeService.getDepositCurrecies();

        if (response.ok && response?.data?.length > 0) {
          const dynamicCurrencyOptions = response.data.map((currency: any) => ({
            label: currency.walletCode,
            value: currency.walletCode,
            logo: currency.logo,
            id: currency.id,
          }));

          setFilterOptions(prev => ({
            ...prev,
            currencyOptions: [
              { label: 'All currencies', value: 'All' },
              ...dynamicCurrencyOptions,
            ],
          }));
        }
      } catch (error) {
        setErrorMessage(isErrorDispaly(error));
      } finally {
        setFilterLoading(prev => ({ ...prev, currencyLoading: false }));
      }
    }
  };
  const getTransactionTypes = async () => {
    try {
      setFilterLoading(prev => ({ ...prev, transactionTypeLoading: true }));
      let response: any;
      if (screenName === 'MyCards') {
        response = await TransactionService.cardTransactionTypeLu();
      } else if (screenName === 'cryptoback') {
        response = await TransactionService.getCashBackLu();
      } else if (screenName === 'referral') {
        response = await TransactionService.getCashBackLu();
      } else {
        response = await TransactionService.getTransactionTypesIcons();
      }

      let transactionTypesData;
      if (screenName === 'MyCards') {
        transactionTypesData = response?.data?.CardTransaction;
      } else if (screenName === 'cryptoback') {
        transactionTypesData = response?.data?.CashBack;
      } else if (screenName === 'referral') {
        transactionTypesData = response?.data?.CashBack;
      } else {
        transactionTypesData = response?.data?.TransactionType || [];
      }
      if (response.status == 200) {
        // Check if "All" option already exists in the API response
        const hasAllOption = transactionTypesData.some((item: any) => item.name === "All");
        let updatedTransactionTypes = transactionTypesData;
        // Only add "All" option if it doesn't already exist
        if (!hasAllOption) {
          const formateTransaction = {
            accountNumber: null,
            code: "All",
            createdDate: "0001-01-01T00:00:00",
            defaultValue: null,
            email: null,
            id: "00000000-0000-0000-0000-000000000000",
            isBusiness: null,
            name: "All",
            recorder: null,
            referenceNo: null,
            userName: null
          };
          updatedTransactionTypes = [formateTransaction, ...transactionTypesData];
        }
        setTransactionTypes(updatedTransactionTypes);
        getTransactionTypeOptions(updatedTransactionTypes);
        // setFilterState(prev => ({
        //   ...prev,
        //   selectedTransactionType: 'All',
        // }));
      }
      else {
        setErrorMessage(isErrorDispaly(response));
        setTransactionTypes([])
      }
    } catch (error) {
      setErrorMessage(isErrorDispaly(error));
    } finally {
      setFilterLoading(prev => ({ ...prev, transactionTypeLoading: false }));
    }
  };

  const getSelectedQuickOption = () => {
    if (!filterState.selectedDateRange.start || !filterState.selectedDateRange.end) return null;
    for (let opt of filterOptions.dateQuickSelectOptions) {
      const end = moment().endOf('day');
      const start = moment().subtract(opt.days - 1, 'days').startOf('day');
      if (
        moment(filterState.selectedDateRange.start).isSame(start, 'day') &&
        moment(filterState.selectedDateRange.end).isSame(end, 'day')
      ) {
        return opt.days;
      }
    }
    return null;
  };

  const handleQuickSelectDate = (days: number) => {
    const end = moment().endOf('day').toDate();
    const start = moment().subtract(days - 1, 'days').startOf('day').toDate();
    setFilterState(prev => ({ ...prev, selectedDateRange: { start, end } }));
    dateSheetRef.current?.close();
  };

  const resetFilters = () => {
    setFilterState({
      // Adjust reset state to account for "MyCards" screen
      selectedTransactionType: screenName === 'MyCards' ? 'All' : normalizedTransactionType || 'All',
      selectedCurrency: 'All',
      selectedDateRange: { start: null, end: null }
    });
  };

  const getIconUrl = (action: string, currencyType?: string) => {
    let actionKey = action;
    if (action === "TopUp") {
      if (currencyType === "Fiat") actionKey = "TopupFiat";
      else if (currencyType === "Crypto") actionKey = "TopupCrypto";
    }
    if (transactionTypes && transactionTypes?.length > 0) {
      const icon = transactionTypes?.find((iconItem: any) => iconItem.name === actionKey);
      return icon ? icon.logo : COMMON_SVG_URLS.send_icon;
    }
  };

  return {
    filterState,
    setFilterState,
    filterOptions,
    filterLoading,
    transactionTypes,
    transactionTypeSheetRef,
    currencySheetRef,
    dateSheetRef,
    getTransactionTypes,
    getCurrencyOptions,
    getSelectedQuickOption,
    handleQuickSelectDate,
    resetFilters,
    getIconUrl,
    errorMessage,
    setErrorMessage
  };
};