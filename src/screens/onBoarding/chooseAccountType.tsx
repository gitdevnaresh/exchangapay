import React, { useEffect, useState } from 'react';
import { View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Container } from '../../components';
import { s } from '../../constants/theme/scale';
import ErrorComponent from '../../components/Error';
import { commonStyles } from '../../components/CommonStyles';
import { SvgUri } from 'react-native-svg';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import AuthService from '../../services/auth';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { isErrorDispaly } from '../../utils/helpers';
import { AccountType, CustomerAccount, LoadersState } from './rigistrationInterfaces';
import { ACCOUNT_CONSTATNTS, EMAIL_CONSTANTS } from './constants';
import DefaultButton from '../../components/DefaultButton';
import { NEW_COLOR } from '../../constants/theme/variables';
import Loadding from '../../components/skeleton';
import { accountTypeSkelton } from '../Crypto/buySkeleton_views';
import NoDataComponent from '../../components/nodata';
import { isLogin, loginAction, setUserInfo } from '../../redux/Actions/UserActions';
import { fcmNotification } from '../../utils/FCMNotification';
import { useAuth0 } from 'react-native-auth0';
import DeviceInfo from 'react-native-device-info';
import { isSumsubKyc } from '../../../Environment';


const ChooseAccountType = React.memo((props: any) => {
    const [errormsg, setErrormsg] = useState<any>(null);
    const navigation = useNavigation<any>();
    const [selectedAccount, setSelectedAccount] = useState<AccountType>({ accountType: "", cardType: "", description: "", account: "" });
    const [loaders, setLoaders] = useState<LoadersState>({ isAccountSelected: false, isBtnLoading: false, isDataLoading: false });
    const [accountTypesLists, setAccountTypesList] = useState<AccountType[]>([]);
    const { clearSession } = useAuth0();
    const dispatch = useDispatch<any>();
    const accountSkeltons = accountTypeSkelton(2);
    useEffect(() => {
        handleGetAccountTypesList();
    }, [])
    const handleGetAccountTypesList = async () => {
        setLoaders((prev) => ({ ...prev, isDataLoading: true }))
        try {
            const response: any = await AuthService.getAccountTypes();
            if (response?.ok) {
                if (props?.route?.params?.accountType && response?.data?.length > 0) {
                    const activeItem = response?.data?.find((item: any) =>
                        props?.route?.params?.accountType === item?.account)
                    setSelectedAccount(activeItem);
                    setLoaders((prev) => ({ ...prev, isAccountSelected: true }))
                }
                setAccountTypesList(response?.data)
                setLoaders((prev) => ({ ...prev, isDataLoading: false }))
            } else {
                setLoaders((prev) => ({ ...prev, isDataLoading: false }))
                setErrormsg(isErrorDispaly(response))
            }
        } catch (error) {
            setLoaders((prev) => ({ ...prev, isDataLoading: false }))
            setErrormsg(isErrorDispaly(error))

        }
    }
    const handlenavigateRegistration = async () => {
        const obj: CustomerAccount = {
            "accountType": selectedAccount?.account
        }
        setLoaders((prev) => ({ ...prev, isBtnLoading: true }))
        try {
            const response = await AuthService.updateAccountType(obj);
            if (response?.ok) {
                try {
                    const response: any = await AuthService.getMemberInfo();
                    const userInfo = response?.data;

                    if (response?.ok) {
                        dispatch(setUserInfo(userInfo));
                        if (isSumsubKyc) {
                            if (userInfo?.customerType === ACCOUNT_CONSTATNTS.PERSONAL && !userInfo?.isKYC) {
                                setLoaders((prev) => ({ ...prev, isBtnLoading: false }));
                                navigation.navigate(ACCOUNT_CONSTATNTS.SUMSUB_COMPONENT)
                            } else if (userInfo?.customerType === ACCOUNT_CONSTATNTS.CORPORATE && userInfo?.isReferralMandatory) {
                                setLoaders((prev) => ({ ...prev, isBtnLoading: false }))
                                navigation.navigate(ACCOUNT_CONSTATNTS.REGISTRATION_REFERRAL)
                            }
                        } else {
                            if (userInfo?.customerType === ACCOUNT_CONSTATNTS.PERSONAL && !userInfo?.customerKYCInformation) {
                                setLoaders((prev) => ({ ...prev, isBtnLoading: false }));
                                navigation.navigate(ACCOUNT_CONSTATNTS.ADD_KYC_INFORMATION, {
                                    isKycUpdated: false,
                                    screenName: "chooseAccountType"
                                })
                            } else if (userInfo?.customerType === ACCOUNT_CONSTATNTS.CORPORATE && userInfo?.isReferralMandatory) {
                                setLoaders((prev) => ({ ...prev, isBtnLoading: false }))
                                navigation.navigate(ACCOUNT_CONSTATNTS.REGISTRATION_REFERRAL)
                            }
                            else {
                                setErrormsg(isErrorDispaly(response))
                            }
                        }

                    } else {
                        setErrormsg(isErrorDispaly(response))
                    }

                } catch (error) {
                    setErrormsg(isErrorDispaly(error))
                }
            } else {
                setLoaders((prev) => ({ ...prev, isBtnLoading: false }))
                setErrormsg(isErrorDispaly(response))
            }
        } catch (error) {
            setLoaders((prev) => ({ ...prev, isBtnLoading: false }))
            setErrormsg(isErrorDispaly(error))
        }
    };

    const handleCloseError = () => {
        setErrormsg("")
    };

    const handleSelectedAccount = (item: any) => {
        setLoaders((prev) => ({ ...prev, isAccountSelected: true }))
        setSelectedAccount(item);
    };


    const logOutLogData = async () => {
        const ip = await DeviceInfo.getIpAddress();
        const deviceName = await DeviceInfo.getDeviceName();
        const obj = {
            "id": "",
            "state": "",
            "countryName": "",
            "ipAddress": ip,
            "info": `{brand:${DeviceInfo.getBrand()},deviceName:${deviceName},model: ${DeviceInfo.getDeviceId()}}`
        }
        const actionRes = await AuthService.logOutLog(obj);

    };


    const handleLgout = async () => {
        await clearSession();
        dispatch(setUserInfo(""));
        dispatch(isLogin(false));
        dispatch(loginAction(""));
        logOutLogData()
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: EMAIL_CONSTANTS.SPLASH_SCREEN }],
            })
        );
        fcmNotification.unRegister();
    };


    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView keyboardShouldPersistTaps={ACCOUNT_CONSTATNTS.HANDLED}>
                <Container style={commonStyles.container}>
                    <View style={[commonStyles.mb24, commonStyles.mt8]}>
                        <View>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mxAuto]}>
                                <View >
                                    <SvgUri
                                        uri={ACCOUNT_CONSTATNTS.EXCHNAGAPAY_LOGO}
                                        width={s(61)}
                                        height={s(55)}
                                    />
                                </View>
                                <ParagraphComponent text={ACCOUNT_CONSTATNTS.EXCHNAGA_PAY} style={[commonStyles.fs32, commonStyles.fw800, commonStyles.textOrange, commonStyles.textCenter]} />
                            </View>
                        </View>
                    </View>
                    <View >
                    </View>
                    <View style={[commonStyles.mb32]} />
                    {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                    <View style={[commonStyles.mb8]} />
                    {(loaders?.isDataLoading && <Loadding contenthtml={accountSkeltons} />)}
                    {(!loaders?.isDataLoading && accountTypesLists?.length > 0) &&
                        accountTypesLists?.map((item: any) => {
                            let activeAccount = selectedAccount?.account === item?.account
                            return (
                                <View key={item?.id}>
                                    <TouchableOpacity onPress={() => { handleSelectedAccount(item) }} >
                                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.sectionStyle, activeAccount ? commonStyles.activeItemBg : null]}>
                                            <View style={[commonStyles.flex1]}>
                                                <View style={[commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyCenter,]}>
                                                    <ParagraphComponent text={item?.accountType} style={[commonStyles.fs20, commonStyles.fw500, commonStyles.textBlack,]} />
                                                    <ParagraphComponent text={`(${item?.cardType})`} style={[commonStyles.fs20, commonStyles.fw500, commonStyles.textBlack,]} />
                                                    <ParagraphComponent text={item?.description} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGrey, commonStyles.flex1]} />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={[commonStyles.mb20]} />
                                </View>
                            )
                        })
                    }
                    {(!loaders.isDataLoading && accountTypesLists?.length === 0) && (
                        <NoDataComponent />
                    )}
                    {loaders?.isAccountSelected && <View style={[commonStyles.p24]}>
                        <DefaultButton
                            title={ACCOUNT_CONSTATNTS.CONTINUE}
                            customTitleStyle={{ color: NEW_COLOR.TEXT_ALWAYS_WHITE }}
                            onPress={handlenavigateRegistration}
                            style
                            loading={loaders?.isBtnLoading}
                        />
                        <View style={[commonStyles.mb16]} />
                    </View>}
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <TouchableOpacity onPress={handleLgout} style={[commonStyles.px10, commonStyles.alignCenter]} >
                            <ParagraphComponent text={"Log Out"} style={[commonStyles.textOrange, commonStyles.fs16, commonStyles.fw600]} />
                        </TouchableOpacity>
                    </View>


                    <View style={[commonStyles.mb43]} />
                </Container>
            </ScrollView>
            <View style={[commonStyles.p24]}>
                <View style={[commonStyles.mb16]} />
            </View>
        </SafeAreaView >
    )

})

export default ChooseAccountType;

