import React from 'react';
import { CommonActions } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import CustomRBSheet from '../../../components/models/commonBottomSheet';
import CommonSuccess from '../successPage/commonSucces';
import ViewComponent from '../../../components/view/view';
import { s } from '../../../constants/styels/scale';

interface SuccessBottomSheetProps {
    sheetRef: any;
    navigation: any;
    onSuccess?: () => void;
}

const SuccessBottomSheet: React.FC<SuccessBottomSheetProps> = ({
    sheetRef,
    navigation,

}) => {
    const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
    const BanksPermission = menuItems?.find((item: any) => item?.featureName.toLowerCase() === 'banks')?.isEnabled;



    return (
        <CustomRBSheet
            refRBSheet={sheetRef}
            height={'Large'}
            onClose={() => {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: "Dashboard", params: { initialTab: BanksPermission ? "GLOBAL_CONSTANTS.BANK" : "GLOBAL_CONSTANTS.WALLETS", animation: 'slide_from_left' } }],
                    })
                );
            }}
            draggable={false}
            closeOnPressMask={false}
        >
            <ViewComponent>
                <CommonSuccess
                    successMessage="GLOBAL_CONSTANTS.ACCOUNT_CREATION_REQUEST_SUBMITTED_SUCCESSFULLY"
                    note="GLOBAL_CONSTANTS.NOTE_YOU_WILL_BE_NOTIFIED_ONCE_YOUR_REQUEST_IS_PROCESSED_THIS_MAY_TAKE_FEW_MUNITES"
                    buttonText="GLOBAL_CONSTANTS.OK"
                    buttonAction={() => sheetRef.current?.close()}
                    showDeductionMessage={false}
                    amountIsDisplay={false}
                />
            </ViewComponent>
        </CustomRBSheet>
    );
};

export default SuccessBottomSheet;