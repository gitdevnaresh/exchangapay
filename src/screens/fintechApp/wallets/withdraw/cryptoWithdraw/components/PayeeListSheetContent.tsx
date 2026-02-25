import React from 'react';
import ViewComponent from '../../../../../../components/view/view';
import Loadding from '../../../../../../components/skelton/skeltons';
import FlatListComponent from '../../../../../../components/flatList/flatList';
import NoDataComponent from '../../../../../../components/noData/noData';
import { Payee } from '../interface';
import PayeeListItem from './PayeeListItem';
import ButtonComponent from '../../../../../../components/buttons/button';
import { getTabsConfigation } from '../../../../../../../cofiguration';

interface PayeeListSheetContentProps {
  dataLoading: boolean;
  payeesList: Payee[];
  selectedBenificiary: Payee | null;
  handleActvePayee: (item: Payee) => void;
  transactionCardContent: any;
  commonStyles: any;
  NEW_COLOR: any;
  s: (val: number) => number;
  handleNavigatePayee: () => void;
};



const ItemSeparator = () => <ViewComponent style={[]} />;

const PayeeListSheetContent: React.FC<PayeeListSheetContentProps> = ({
  dataLoading,
  payeesList,
  selectedBenificiary,
  handleActvePayee,
  transactionCardContent,
  commonStyles,
  NEW_COLOR,
  handleNavigatePayee,
  s,

}) => {
  if (dataLoading && !payeesList.length) {
    return <Loadding contenthtml={transactionCardContent} />;
  }
  const quickLinksConfiguration = getTabsConfigation("WALLETS")

  if (payeesList.length === 0 && quickLinksConfiguration.QUCIKLINKS?.IS_ON_THE_GO) {
    return (
      <ViewComponent style={[commonStyles.flex1, { justifyContent: "space-between" }]}>
        <ViewComponent style={{ flex: 1 }}>
          <NoDataComponent />
        </ViewComponent>

        <ButtonComponent
          title={"GLOBAL_CONSTANTS.ADD_NEW_PAYEE"}
          onPress={handleNavigatePayee}
        />
        <ViewComponent style={[commonStyles.sectionGap]} />

      </ViewComponent>

    );
  };
  return (
    <ViewComponent style={[commonStyles.flex1]}>
      <ViewComponent style={[commonStyles.flex1]}>
        <FlatListComponent
          data={payeesList || []}
          scrollEnabled={false}
          keyExtractor={(item: Payee) => item.id.toString()}
          renderItem={({ item, index }: { item: Payee; index: number }) => (
            <PayeeListItem
              item={item}
              isActive={selectedBenificiary?.id === item.id}
              onPress={handleActvePayee}
              isLastItem={index === payeesList.length - 1}
              commonStyles={commonStyles}
              NEW_COLOR={NEW_COLOR}
            />
          )}
          ItemSeparatorComponent={() => <ItemSeparator />}
          contentContainerStyle={{ paddingBottom: s(20) }}
        />

      </ViewComponent>

      {quickLinksConfiguration.QUCIKLINKS?.IS_ON_THE_GO && <ViewComponent style={[commonStyles.sectionGap]}>
        <ButtonComponent
          title={"GLOBAL_CONSTANTS.ADD_NEW_PAYEE"}
          onPress={handleNavigatePayee}
        />
      </ViewComponent>}

    </ViewComponent>
  );
};

export default PayeeListSheetContent;