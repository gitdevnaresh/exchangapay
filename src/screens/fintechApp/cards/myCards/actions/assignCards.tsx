import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import ViewComponent from '../../../../../components/view/view';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { s } from '../../../../../constants/styels/scale';
import SearchComponent from '../../../../../components/searchComponents/searchComponent';
import NoDataComponent from '../../../../../components/noData/noData';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { AssignCardListSkeltons } from '../../skeltons';

interface Employee {
  id: string;
  name: string;
  [key: string]: any;
}

interface CadsActionAssignCardsProps {
  onClose: () => void;
  loading: boolean;
  employees: Employee[];
  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee | null) => void; // Allow null to deselect if needed
  error?: string;
  handleConfirmAssignCard: (employee: Employee) => void;
  onErrorClose?: () => void;
  isSaveLoading?: boolean;
}

const CadsActionAssignCards: React.FC<CadsActionAssignCardsProps> = ({
  loading,
  employees,
  selectedEmployee,
  setSelectedEmployee,
  error,
  onErrorClose,
  isSaveLoading
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleSearchResult = (results: Employee[]) => {
    setFilteredEmployees(results);
  };





  const renderEmployeeItem = ({ item }: { item: Employee }) => {
    const isActive = selectedEmployee?.id === item.id;

    return (
      <TouchableOpacity onPress={() => setSelectedEmployee(item)}>
        <ViewComponent style={[
          commonStyles.dflex,
          commonStyles.alignCenter,
          commonStyles.gap16,
          isActive ? commonStyles.activeItemBg : commonStyles.inactiveItemBg,
          commonStyles.listitemGap
        ]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.gap16, commonStyles.alignCenter]}>
            <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
              <ParagraphComponent
                style={[commonStyles.twolettertext]}
                text={item?.name?.slice(0, 1)?.toUpperCase() || ''}
              />
            </ViewComponent>
            <ViewComponent style={[commonStyles.flex1, commonStyles.dflex]}>
              <ParagraphComponent
                style={[commonStyles.bottomsheetprimarytext]}
                text={item.name || ''}
                numberOfLines={1}
              />

            </ViewComponent>
          </ViewComponent>
          {isSaveLoading && isActive && (
            <ActivityIndicator size="small" color={NEW_COLOR.TEXT_PRIMARY} />
          )}
        </ViewComponent>
      </TouchableOpacity>
    );
  };

  const ListSeparator = () => <View style={commonStyles.listChildGap} />;

  return (
    <ViewComponent>
      {loading && <AssignCardListSkeltons />}
      {!loading && <ViewComponent>
        {error && (
          <ErrorComponent message={error} onClose={onErrorClose} />
        )}

        <SearchComponent
          data={employees}
          customBind="name"
          onSearchResult={handleSearchResult}
          placeholder="GLOBAL_CONSTANTS.SEARCH_EMPLOYEE"
        />


        <ViewComponent style={{ height: s(260) }}>
          <FlatList
            data={filteredEmployees}
            renderItem={renderEmployeeItem}
            keyExtractor={(item) => item?.id}
            ItemSeparatorComponent={ListSeparator}
            ListEmptyComponent={
              <ViewComponent style={[commonStyles.alignCenter, commonStyles.flex1, commonStyles.justifyCenter]}>
                <NoDataComponent />
              </ViewComponent>
            }
          />
        </ViewComponent>
      </ViewComponent>}
    </ViewComponent>
  );
};

export default CadsActionAssignCards;
