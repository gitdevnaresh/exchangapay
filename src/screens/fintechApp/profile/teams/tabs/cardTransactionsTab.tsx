import React, { useCallback } from 'react';
import RecentTransactions from '../../../../commonScreens/transactions/recentTransactions';
import ViewComponent from '../../../../../components/view/view';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import { CardTransactionsTabProps } from '../utils';
import { ACCOUNT_TYPES_EXTENDED } from '../constants';



const CardTransactionsTab = ({ cardId, currency, onError }: CardTransactionsTabProps) => {
  const handleRecentTransactionReload = useCallback((reload: boolean, error?: string | null) => {
    if (error) {
      onError?.(error);
    }
  }, [onError]);

  return (
    <ViewComponent>
      <ScrollViewComponent>
        <RecentTransactions
          accountType={ACCOUNT_TYPES_EXTENDED.TEAM_CARD_DETAIL}
          currency={currency}
          cardId={cardId}
          handleRecentTranscationReloadDetails={handleRecentTransactionReload}
        />
      </ScrollViewComponent>
    </ViewComponent>
  );
};

export default CardTransactionsTab;