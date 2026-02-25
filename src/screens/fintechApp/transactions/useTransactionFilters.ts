import { useState, useCallback } from "react";
import { MemberShip } from "../../commonScreens/transactions/interface";

interface UseTransactionFiltersProps {
    initialModuleFromRoute?: string;
    rbSheetRef: React.RefObject<any>; // For closing the sheet
}

export const useTransactionFilters = ({ initialModuleFromRoute, rbSheetRef }: UseTransactionFiltersProps) => {
    // Applied filter states
    const [appliedStartDate, setAppliedStartDate] = useState<Date | null>(null);
    const [appliedEndDate, setAppliedEndDate] = useState<Date | null>(null);
    const [appliedSelectedState, setAppliedSelectedState] = useState<string>("");
    const [appliedAccountMemberName, setAppliedAccountMemberName] = useState<string | undefined>(
        initialModuleFromRoute || "All"
    );

    // Picker states (before applying)
    const [selectedStartDateInPicker, setSelectedStartDateInPicker] = useState<Date | null>(null);
    const [selectedEndDateInPicker, setSelectedEndDateInPicker] = useState<Date | null>(null);
    const [selectedStatusInPicker, setSelectedStatusInPicker] = useState<string>("");
    const [selectedAccountMemberInPicker, setSelectedAccountMemberInPicker] = useState<MemberShip | undefined>(
        initialModuleFromRoute
            ? { id: initialModuleFromRoute, name: initialModuleFromRoute, state: 'All' }
            : undefined
    );

    const [popUpErrorMsg, setPopUpErrorMsg] = useState<string>("");

    const handleApplyFilter = useCallback(() => {
        if (selectedEndDateInPicker && !selectedStartDateInPicker) {
            setPopUpErrorMsg("GLOBAL_CONSTANTS.PLEASE_SELECT_A_START_DATE_AND_END_DATE");
            return;
        }
        if (selectedStartDateInPicker && selectedEndDateInPicker && selectedStartDateInPicker > selectedEndDateInPicker) {
            setPopUpErrorMsg("GLOBAL_CONSTANTS.START_DATE_MUST_BE_LESS_THAN_OR_EQUAL_TO_END_DATE");
            return;
        }
        setPopUpErrorMsg("");

        setAppliedSelectedState(selectedStatusInPicker || "All");
        setAppliedAccountMemberName(selectedAccountMemberInPicker?.name || "All");
        setAppliedStartDate(selectedStartDateInPicker);
        setAppliedEndDate(selectedEndDateInPicker);

        rbSheetRef.current?.close();
    }, [selectedStartDateInPicker, selectedEndDateInPicker, selectedStatusInPicker, selectedAccountMemberInPicker, rbSheetRef]);

    const handleClearFilter = useCallback(() => {
        const defaultModule = initialModuleFromRoute || "All";

        setSelectedStatusInPicker("");
        setAppliedSelectedState("");
        setSelectedStartDateInPicker(null);
        setAppliedStartDate(null);
        setSelectedEndDateInPicker(null);
        setAppliedEndDate(null);
        setPopUpErrorMsg('');

        setSelectedAccountMemberInPicker({ id: defaultModule, name: defaultModule, state: 'All' });
        setAppliedAccountMemberName(defaultModule);

        rbSheetRef.current?.close();
    }, [initialModuleFromRoute, rbSheetRef]);

    const handleErrorClose = useCallback(() => {
        setPopUpErrorMsg("");
    }, []);

    return {
        appliedFilters: {
            startDate: appliedStartDate,
            endDate: appliedEndDate,
            status: appliedSelectedState,
            moduleName: appliedAccountMemberName,
        },
        pickerStates: {
            selectedStartDateInPicker, setSelectedStartDateInPicker,
            selectedEndDateInPicker, setSelectedEndDateInPicker,
            selectedStatusInPicker, setSelectedStatusInPicker,
            selectedAccountMemberInPicker, setSelectedAccountMemberInPicker,
        },
        popUpErrorMsg, setPopUpErrorMsg,
        handleApplyFilter, handleClearFilter, handleErrorClose,
        setAppliedAccountMemberName, // Expose setter if needed for direct updates from route params
    };
};