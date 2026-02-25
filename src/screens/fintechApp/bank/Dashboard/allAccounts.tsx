
import Container from "../../../../components/container/container"
import { CoinImages, getThemedCommonStyles } from "../../../../components/CommonStyles"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import CreateAccountService from "../../../../apiServices/bank/createAccount"
import { isErrorDispaly } from "../../../../utils/helpers"
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay"
import NoDataComponent from "../../../../components/noData/noData"
import { s } from "../../../../constants/styels/scale"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { BANK_CONST } from "../constants"
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors"
import ViewComponent from "../../../../components/view/view"
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity"

import SafeAreaViewComponent from "../../../../components/safeArea/safeArea"
import DashboardLoader from "../../../../components/loader"
import { BackHandler } from "react-native"
import PageHeader from "../../../../components/pageHeader/pageHeader"
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText"
import FlatListComponent from "../../../../components/flatList/flatList"
import SvgFromUrl from "../../../../components/svgIcon"
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph"
import { getTabsConfigation } from '../../../../../configuration'

const AllAccounts = React.memo((props: any) => {
    const [createAccListLoading, setCreateAccListLoading] = useState(false);
    const [createAccDetails, setCreateAccDetails] = useState<any>([]);
    const [errormsg, setErrormsg] = useState("");
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const navigation = useNavigation();
    const currencySymbole = getTabsConfigation("CURRENCY");
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

    useEffect(() => {
        getCreateAccountDetails();
    }, [])

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                backArrowButtonHandler();
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription?.remove();
        }, [])
    );

    const getCreateAccountDetails = async () => {
        setCreateAccListLoading(true);

        try {
            const response: any = await CreateAccountService.getAccountDetailsOfMobileBank();
            if (response.ok) {
                setCreateAccDetails(response?.data?.accounts);
                setCreateAccListLoading(false);
                setErrormsg("");
            } else {
                setErrormsg(isErrorDispaly(response));
                setCreateAccListLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setCreateAccListLoading(false);
        }
    };
    const backArrowButtonHandler = useCallback(() => {
        (navigation as any).navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.BANK", animation: 'slide_from_left' });
    }, [navigation]);
    const gridRefresh = useCallback(() => {
        getCreateAccountDetails();
    }, []);
    const handleChage = useCallback((item: any) => {
        if ((props?.route?.params?.type === BANK_CONST.DEPOSITE)) {
            props.navigation.navigate(BANK_CONST.BANK, {
                customerId: userInfo?.id,
                currency: item?.currency,
                logo: item?.logo,
                avialableBal: item?.availableBalance,
                type: props?.route?.params?.type,

            })
        }
        else {
            props.navigation.navigate(BANK_CONST.SEND_AMOUNTS, {
                avialableBal: item?.availableBalance,
                accountId: props?.route?.params?.accountId,
                walletCode: props?.route?.params?.walletCode || item?.currency,
                id: props?.route?.params?.id,
                type: props?.route?.params?.type,


            })
        }
    }, [props?.route?.params?.type, props?.navigation, userInfo?.id, props?.route?.params?.accountId, props?.route?.params?.walletCode, props?.route?.params?.id]);
    return (

        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.SELECT_ACCOUNT"} onBackPress={backArrowButtonHandler} isrefresh={true} onRefresh={gridRefresh} />
                {(createAccListLoading) && (
                    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </SafeAreaViewComponent>
                )}
                {!createAccListLoading && (
                    <ViewComponent style={commonStyles.flex1}>
                        {errormsg !== "" && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}

                        <FlatListComponent
                            data={createAccDetails}
                            keyExtractor={(item: any) => item.id.toString()}
                            ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.transactionsListGap]} />}
                            renderItem={({ item }: { item: any }) => (
                                <ViewComponent style={[commonStyles.bannerbg, commonStyles.rounded11, commonStyles.p12]}>
                                    <CommonTouchableOpacity onPress={() => handleChage(item)}>
                                        <ViewComponent>

                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.BankListGap]} >
                                                <ViewComponent style={{ minHeight: s(34), minWidth: s(34) }}>
                                                    <SvgFromUrl uri={item?.currency?.toLowerCase() === 'usd' ? CoinImages['bankusd'] : CoinImages[item?.currency?.toLowerCase() || '']}
                                                        width={s(32)}
                                                        height={s(32)}
                                                    />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flex1]}>
                                                    <ViewComponent>
                                                        <ParagraphComponent style={[commonStyles.secondarytext]} text={item?.currency} />
                                                        <ParagraphComponent style={[commonStyles.secondarytext]} text={'United States Dollar'} />
                                                    </ViewComponent>
                                                    <CurrencyText value={item?.amount} prifix={currencySymbole[item?.currency]} style={[commonStyles.primarytext]} />

                                                </ViewComponent>

                                            </ViewComponent>

                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.BankListGap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={'Bank Name'} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={'SBI'} />

                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={'Bank No'} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={'12345678901234567890123456'} />

                                            </ViewComponent>

                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                    <ViewComponent style={[]} />
                                </ViewComponent>
                            )}
                            ListEmptyComponent={() => <NoDataComponent />}
                        />
                    </ViewComponent>
                )}
            </Container>
        </ViewComponent>
    )
});
export default AllAccounts;

