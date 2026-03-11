import { useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { useThemeColors } from "../../../hooks/useThemeColors";
import ViewComponent from "../../../newComponents/view/view";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ButtonComponent from "../../../newComponents/buttons/button";
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import PayeeListComponent from "../../commonScreens/payeesListComponent/payeesListComponent";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { ScrollView } from 'react-native';
import KycVerifyPopup from "../../commonScreens/kycVerify";
import { useSelector } from "react-redux";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";


const WhiteListAddresses = () => {
    const navigation = useNavigation<any>();

    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const [kycModelVisible, setKycModelVisible] = useState(false);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [error,setError]=useState<string>("");
    useHardwareBackHandler(() => {
        handleBackPress();
    });

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const onRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);
    const handleAddPayee = () => {
        const actionData: ActionLogParams = {
            screename: 'payeeList',
            actionName: 'create payee',
            actionType: 'Button',
            nextScreenName: 'addNewAddress',
            actionObj: {

            }
        };
        logEvent('screen_view', actionData);

        if (userInfo?.isKYC !== true) {
            setKycModelVisible(!kycModelVisible);
            return;
        }
        else {
            navigation.navigate("CurrencySelection");
        }

    };
    const handleBackPress = () => {
        navigation.navigate("NewProfile", { animation: 'slide_from_left' });
    }
    const closekycModel = () => {
        setKycModelVisible(false);
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.flex1]}>
                <PageHeader
                    title="GLOBAL_CONSTANTS.WHITELIST_ADDRESS"
                    onBackPress={handleBackPress}
                    isrefresh={true}
                    onRefresh={onRefresh}
                />
                 {error&&<ErrorComponent message={error} screen={true}/>}
                <ScrollView
                    style={[commonStyles.flex1]}
                    contentContainerStyle={[{ flexGrow: 1 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <PayeeListComponent
                        refreshTrigger={refreshTrigger}
                        selectable={false}
                        onPayeePress={(payee) => navigation.navigate('WhiteListView', { payee })}
                        ErrorMessage={setError}
                    />
                </ScrollView>
                 <ButtonComponent
                    title="GLOBAL_CONSTANTS.ADD_NEW_ADDRESS"
                    onPress={handleAddPayee}
                    solidBackground={true}
                />
            </Container>
            {kycModelVisible && (
                <KycVerifyPopup
                    closeModel={closekycModel}
                    addModelVisible={kycModelVisible}
                />
            )}
        </ViewComponent>
    );
};

export default WhiteListAddresses;