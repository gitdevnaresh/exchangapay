import React, { useCallback } from "react";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import SafeAreaViewComponent from "../../../../../../components/safeArea/safeArea";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import { KeyboardAvoidingView, Platform } from "react-native";
import { s } from "../../../../../../components/theme/scale";
import Container from "../../../../../../components/container/container";
import { useHardwareBackHandler } from "../../../../../../hooks/backHandleHook";
import { ADD_RECIPIENT } from "../addRecipient/constant";
import AccountLocal from "./accountLocal";

const AccountDetails = React.memo((props: any) => {
    const handleBackArrow = useCallback(() => {
        if (props?.route?.params?.screenName === "payoutEditPayee") {
            props.navigation.navigate(ADD_RECIPIENT.ADDRESS_BOOK_FIAT_LIST)
        } else {
            props.navigation?.goBack();
        }
    }, [props.navigation, props?.route?.params?.screenName]);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useHardwareBackHandler(() => {
        props.navigation?.goBack();
    });

    return (
        <SafeAreaViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container style={[commonStyles.container]}>

                <PageHeader title={props?.route?.params?.id ? "GLOBAL_CONSTANTS.UPDATE_FIAT_ADDRESS" : "GLOBAL_CONSTANTS.ADD_FIAT_ADDRESS"} onBackPress={handleBackArrow} />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={s(64)}
                >
                    <AccountLocal
                        id={props?.route?.params?.id || props?.id}
                        appName={props?.route?.params?.appName || props?.appName}
                        accountType={props?.route?.params?.accountType || props?.accountType}
                        screenName={props?.route?.params?.screenName || props?.screenName}
                        isStableCoinPayout={props?.route?.params?.stableCoinPayout}
                    />

                </KeyboardAvoidingView>
            </Container>

        </SafeAreaViewComponent>
    );
});
export default AccountDetails;
