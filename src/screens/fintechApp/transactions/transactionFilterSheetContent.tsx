import React from "react";
import ViewComponent from '../../../components/view/view';
import CustomPicker from '../../../components/pickerComponents/basic/customPickerNonFormik';
import ButtonComponent from '../../../components/buttons/button';
import ErrorComponent from '../../../components/errorDisplay/errorDisplay';
import { MemberShip, StatusItem } from '../../commonScreens/transactions/interface';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import DatePickerWithOutFormik from '../../../components/datePickers/basic/datePicker';

interface TransactionFilterSheetContentProps {
    popUpErrorMsg: string;
    onCloseError: () => void;
    statusOptions: StatusItem[] | undefined;
    selectedStatus: string;
    onSelectStatus: (data: any) => void;
    moduleOptions: MemberShip[] | undefined;
    selectedModule: MemberShip | undefined;
    onSelectModule: (data: MemberShip) => void;
    startDate: Date | null;
    onSelectStartDate: (date: Date) => void;
    endDate: Date | null;
    onSelectEndDate: (date: Date) => void;
    onApply: () => void;
    onClear: () => void;
}

const TransactionFilterSheetContent: React.FC<TransactionFilterSheetContentProps> = ({
    popUpErrorMsg,
    onCloseError,
    statusOptions,
    selectedStatus,
    onSelectStatus,
    moduleOptions,
    selectedModule,
    onSelectModule,
    startDate,
    onSelectStartDate,
    endDate,
    onSelectEndDate,
    onApply,
    onClear,
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    return (
        <ViewComponent>
            {popUpErrorMsg && <ErrorComponent message={popUpErrorMsg} onClose={onCloseError} />}
            <CustomPicker
                label="GLOBAL_CONSTANTS.SELECT_STATUS"
                data={statusOptions as any[] || []}
                value={selectedStatus || "All"}
                onChange={onSelectStatus}
                modalTitle="GLOBAL_CONSTANTS.SELECT_STATUS"
                placeholder="GLOBAL_CONSTANTS.SELECT_STATUS"
            />
            <ViewComponent style={[commonStyles.formItemSpace]} />
            <CustomPicker
                label="GLOBAL_CONSTANTS.SELECT_MODULE"
                data={moduleOptions as any[] || []}
                value={selectedModule?.name ?? "All"}
                onChange={onSelectModule as any}
                modalTitle="GLOBAL_CONSTANTS.SELECT_MODULE"
                placeholder="GLOBAL_CONSTANTS.SELECT_MODULE"
            />
            <ViewComponent style={[commonStyles.formItemSpace]} />
            <DatePickerWithOutFormik label={"GLOBAL_CONSTANTS.START_DATE"} value={startDate} onDateChange={onSelectStartDate} />
            <ViewComponent style={[commonStyles.formItemSpace]} />
            <DatePickerWithOutFormik label={"GLOBAL_CONSTANTS.END_DATE"} value={endDate} onDateChange={onSelectEndDate} />
            <ViewComponent style={[commonStyles.formItemSpace]} />
            <ButtonComponent multiLanguageAllows={true} title={"GLOBAL_CONSTANTS.APPLY_BUTTON"} onPress={onApply} />
            <ViewComponent style={[commonStyles.mb10]} />
            <ButtonComponent title={"GLOBAL_CONSTANTS.CLEAR_ALL"} onPress={onClear} solidBackground={true} />
        </ViewComponent>
    );
};

export default TransactionFilterSheetContent;