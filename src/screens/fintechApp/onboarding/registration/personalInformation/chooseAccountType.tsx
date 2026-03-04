import React, { useState, useEffect } from 'react';
import { ScrollView, SafeAreaView, TextInput, Keyboard, Text, ActivityIndicator } from 'react-native';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import Container from '../../../../../components/container/container';
import { s } from '../../../../../constants/styels/scale';
import { isErrorDispaly } from '../../../../../utils/helpers';
import CreateAccountService from '../../../../../apiServices/bank/createAccount';
import { useDispatch, useSelector } from 'react-redux';
import type { store } from '../../../../../redux/reducers/index';
import { useNavigation } from '@react-navigation/native';
import { setReferralCode } from '../../../../../redux/actions/actions';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import ViewComponent from '../../../../../components/view/view';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import ButtonComponent from '../../../../../components/buttons/button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import DashboardLoader from '../../../../../components/loader';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import * as Yup from "yup";
import { Formik } from 'formik';
import ConfirmLogout from '../../../../commonScreens/logout/comfirmLogout';
import useLogout from '../../../../../hooks/logout/useLogout';
import { AccountTypeItem, AccountTypesResponse, ReferralCodeResponse, ReferralData, RootStackParamList, RootState, ThemeColors, UserDetails } from '../../interface';
import { KYC_PROFILE_PRIVEW_CONSTANTS } from '../../constants';
import AuthService from '../../../../../apiServices/onBoarding/auth';

type CustomerRegisterScreenProp = NativeStackNavigationProp<RootStackParamList, "CustomerRigister">;
type AppDispatch = typeof store.dispatch;


const ChooseAccountType = React.memo(() => {
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [referralCode, setReferralCodes] = useState<string>('')
    const [refferalCodeError, setRefferalCodeError] = useState<string | null>(null);
    const [isCustomerReferral, setIsCustomerReferral] = useState(false);
    const [referralData, setReferralData] = useState<ReferralData | null>(null)
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const navigation = useNavigation<CustomerRegisterScreenProp>();
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const dispatch = useDispatch<AppDispatch>();
    const userinfo = useSelector((state: RootState) => state.userReducer?.userDetails as UserDetails | null);
    const [loading, setLoading] = useState(true); // Set to true initially for data fetching
    const { t } = useLngTranslation();
    const [accountTypesList, setAccountTypesList] = useState<AccountTypeItem[]>([]);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isVerifying, setIsVerifying] = useState(false);
    const refCode = useSelector((state: RootState) => state.userReducer.referralCode);
    const [isVisible, setIsVisible] = useState(false)
    const isAccountChecked = accountTypesList?.some(item => item?.isChecked);
    const { logout } = useLogout();
    useEffect(() => {
        if (userinfo?.customerReferralCode) {
            setReferralCodes(userinfo?.customerReferralCode);
            getRefferalCodeVierication(userinfo?.customerReferralCode);
            setIsCustomerReferral(true);
        } else if (refCode && !referralCode) {
            setReferralCodes(refCode);
            setTimeout(() => {
                getRefferalCodeVierication(refCode);
            }, 500);
        }
    }, [refCode, userinfo?.customerReferralCode]);

    const validationSchema = Yup.object().shape({
        referralCode: Yup.string()
            .nullable()
            .when([], {
                is: () => userinfo?.metadata?.IsReferralMandatory && !referralCode,
                then: (schema) => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED"),
                otherwise: (schema) => schema.notRequired(),
            }),
    });

    useEffect(() => {
        if (accountTypesList.length === 0) return;

        const accountType = userinfo?.metadata?.chooseAccount?.mobile?.chooseAccount?.toLowerCase();

        if (!accountType || accountType === "both") {
            // Show all, none selected
            setAccountTypesList(prev =>
                prev.map(item => ({ ...item, isChecked: false }))
            );
        } else {
            // Auto-select based on user's account type
            const selectedType = accountType === "personal" ? "Personal" : "Business";
            setAccountTypesList(prev =>
                prev.map(item => ({
                    ...item,
                    isChecked: item.accountType === selectedType,
                }))
            );
        }
    }, [accountTypesList.length, userinfo?.metadata?.chooseAccount]);

    useEffect(() => {
        const fetchAccountTypes = async () => {
            setLoading(true);
            try {
                const response = await CreateAccountService.getListOfCountries() as AccountTypesResponse;
                if (response?.ok && response.data?.AccountTypes) {
                    let fetchedTypes: AccountTypeItem[] = response.data.AccountTypes.map((type) => ({
                        id: type.code, // Using code as ID for uniqueness
                        accountType: type.code,
                        name: t(`GLOBAL_CONSTANTS.${type.code.toUpperCase()}`), // Assuming translation keys match
                        message: type?.remarks, // Assuming translation keys match
                        isChecked: false,
                        disable: false,
                    }));

                    if (userinfo?.isEmployee) {
                        fetchedTypes = fetchedTypes?.map(item => {
                            if (item?.accountType === "Corporate") {
                                return { ...item, isChecked: true, disable: false };
                            } else {
                                return { ...item, isChecked: false, disable: true };
                            }
                        });
                    } else {
                        fetchedTypes = fetchedTypes.filter(item => item.accountType !== "Corporate");
                        fetchedTypes = fetchedTypes.map(item => ({ ...item, disable: false }));
                    }
                    setAccountTypesList(fetchedTypes);
                    setErrormsg(null);
                } else {
                    setErrormsg(isErrorDispaly(response));
                    setAccountTypesList([]); // Clear list on error
                }
            } catch (error) {
                setErrormsg(isErrorDispaly(error));
                setAccountTypesList([]); // Clear list on error
            }
            setLoading(false);
        };

        fetchAccountTypes();
    }, [t, userinfo?.isEmployee]);

    const handlenavigateRegistration = (val: AccountTypeItem) => {
        if (val.disable) {
            return; // Do nothing if the item is disabled
        }
        Keyboard.dismiss();
        const updatedList = accountTypesList.map((item) =>
            item.id === val.id
                ? { ...item, isChecked: true }
                : { ...item, isChecked: false }
        );
        setAccountTypesList(updatedList);
        setErrormsg(null);
    };
    const handleRefferalcodeChange = (e: string, setFieldError?: (field: string, message: string | null | undefined) => void) => {
        if (userinfo?.metadata?.IsReferralMandatory) {
            if (e?.length > 0) {
                setFieldError?.(KYC_PROFILE_PRIVEW_CONSTANTS.REFERRAL_CODE, null);
            } else {
                setFieldError?.(KYC_PROFILE_PRIVEW_CONSTANTS.REFERRAL_CODE, "GLOBAL_CONSTANTS.IS_REQUIRED");
            }
        }

        const upperCaseValue = e?.toUpperCase();
        const regex = /^[a-zA-Z0-9]*$/;
        if (!upperCaseValue) {
            setRefferalCodeError(null);
            setReferralCodes('');
            setErrormsg(null);
        }
        else if (regex?.test(upperCaseValue)) {
            setReferralCodes(upperCaseValue);
            setIsVerified(false);
        }
    }
    const getRefferalCodeVierication = async (codeToVerify?: string) => {
        console.log("getRefferalCodeVierication",codeToVerify,referralCode)
        const codeToUse = codeToVerify || referralCode;
        if (!codeToUse) {
            setRefferalCodeError("Is required");
            return;
        }
        try {
            setIsVerifying(true);
            setRefferalCodeError(null);
            setErrormsg(null);
            const Obj = {
                code: encryptAES(codeToUse)
            }
            const response = await AuthService.getReferralCode(Obj) as ReferralCodeResponse;
            if (response?.ok) {
                setReferralData(response?.data ?? null);
                setIsVerified(true);
                setRefferalCodeError(null);
                setErrormsg(null);
                dispatch(setReferralCode(""));
                // Update account types based on referral data
                if (accountTypesList.length > 0) {
                    if (response?.data?.isBusiness) {
                        // If referral is business, force select Corporate and disable others
                        const updatedList = accountTypesList.map((item) =>
                            item.accountType === "Corporate"
                                ? { ...item, isChecked: true, disable: false }
                                : { ...item, isChecked: false, disable: true }
                        );
                        setAccountTypesList(updatedList);

                    } else {
                        const updatedList = accountTypesList.map(item => {
                            if (item.accountType === "Corporate") return { ...item, isChecked: false, disable: true };
                            return { ...item, disable: false }; // Enable others if they were disabled by a previous business referral check
                        });
                        setAccountTypesList(updatedList);
                    }
                }
            } else {
                setRefferalCodeError(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
        finally {
            setIsVerifying(false); // stop loader
        }

    };
    const handleRefferalCode = () => {
        console.log("business User Is Their Smashpay?”",)
        if (!referralCode) {
            setRefferalCodeError("Is Required");
        } else {
            Keyboard.dismiss();
            setRefferalCodeError(null)
            getRefferalCodeVierication()
            setErrormsg(null)
        }
    }
    const handleSubmit = () => {
        Keyboard.dismiss();
        if (referralCode.length > 0 && !isVerified) {
            return setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_VERIFY_REFERRAL_CODE_BEFORE_CONTINUE"));
        }
        if (refferalCodeError && !isVerified) {
            return setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_ENTER_VALID_REFERRAL_CODE"));
        }
        const isCheckedVal = accountTypesList.filter((item) => item?.isChecked === true);
        if (isCheckedVal?.length === 0) {
            return setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_SELECT_ACCOUNT_TYPE"));
        };
        if (isCheckedVal[0].disable) {
            return setErrormsg(t("GLOBAL_CONSTANTS.SELECTED_ACCOUNT_TYPE_IS_DISABLED")); // Should not happen if UI is correct, but good for safety
        }
        if (!userinfo?.isEmployee) {
            navigation.navigate("CustomerRigister", {
                accountType: isCheckedVal[0]?.accountType,
                referralId: referralData?.id
            } as any);
        } else {
            if (isCheckedVal[0]?.accountType == "Corporate") {
                navigation.navigate("CustomerRigister", {
                    accountType: isCheckedVal[0]?.accountType as "Corporate" | "Personal" | "Business",
                    referralCode: referralCode ?? userinfo?.businessReferralCode
                });
            }
        }
    }
    const handleClose = () => {
        setIsVisible(false)
    }
    const handleConfirm = async () => {
        setIsVisible(false)
        handleLogout();
    }
    const handleLogoutBtn = () => {
        setIsVisible(true)
    }

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);
    }
    const getBorderColor = () => {
        if (referralCode && !refferalCodeError) {
            return NEW_COLOR.TEXT_PRIMARY;
        }
        if (refferalCodeError) {
            return NEW_COLOR.TEXT_RED;
        }
        return NEW_COLOR.INPUT_BORDER;
    };
    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                {loading && (
                    <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </ViewComponent>
                )}
                {!loading && <Container style={[commonStyles.container]}>
                    <Formik
                        initialValues={{
                            referralCode: "",
                        }}
                        validationSchema={userinfo?.metadata?.IsReferralRequiredOrNot ? validationSchema : undefined}
                        onSubmit={handleSubmit}
                        validateOnBlur={false} // Keep this as true
                        validateOnChange={true}
                    >
                        {({ errors, touched, handleSubmit, setFieldError }) => {
                            return (
                                <>
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ScrollView keyboardShouldPersistTaps="handled">
                                            {/* <ViewComponent style={[commonStyles.titleSectionGap]} />
                            <AlertsCarousel commonStyles={commonStyles} screenName='Onbaording'/> */}
                                            <ViewComponent style={[commonStyles.sectionGap]} />
                                            <ViewComponent>
                                                <ParagraphComponent text="GLOBAL_CONSTANTS.WHAT_TYPE_ACCOUNT" style={[commonStyles.sectionTitle, commonStyles.sectionGap]} />
                                            </ViewComponent>

                                            {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
                                            {userinfo?.metadata?.IsReferralRequiredOrNot && (<LabelComponent style={[commonStyles.inputLabel]} text={"GLOBAL_CONSTANTS.REFERRAL_CODE"}>
                                                {userinfo?.metadata?.IsReferralMandatory && (
                                                    <ParagraphComponent
                                                        style={[commonStyles.textRed]}
                                                        text=" *"
                                                    />
                                                )}
                                            </LabelComponent>)}
                                            {userinfo?.metadata?.IsReferralRequiredOrNot && (<>
                                                <ViewComponent style={[commonStyles.referralcodebg, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.relative, { borderColor: getBorderColor() }]}>
                                                    <TextInput
                                                        style={[
                                                            commonStyles.flex1,
                                                            commonStyles.px16,
                                                            commonStyles.phonecodeplaceholder,
                                                            commonStyles.textWhite,
                                                            isCustomerReferral && commonStyles.disabledTextStyle,
                                                            {
                                                                borderColor: errors?.referralCode ? NEW_COLOR.TEXT_RED : commonStyles.hoverborder
                                                            },
                                                        ]} placeholder={t("GLOBAL_CONSTANTS.REFERRAL_CODE_PLACEHOLDER")}
                                                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                        onChangeText={(e) => handleRefferalcodeChange(e, setFieldError)}
                                                        value={referralCode} // Use local state for input
                                                        numberOfLines={1}
                                                        maxLength={30}
                                                        autoCapitalize="characters"
                                                        autoCorrect={true}
                                                        editable={!isCustomerReferral}

                                                    />

                                                    <ViewComponent >
                                                        <CommonTouchableOpacity
                                                            disabled={!referralCode || isVerified || userinfo?.isEmployee || isCustomerReferral} // Only enable if there's a referralCode in the input field
                                                            onPress={() => handleRefferalCode()}
                                                            style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.pr20, commonStyles.justifyCenter]}>
                                                            <ViewComponent>
                                                                {isVerifying ? (
                                                                    <ActivityIndicator
                                                                        size="small"
                                                                        color={NEW_COLOR.TEXT_PRIMARY}
                                                                    />) : (
                                                                    <ParagraphComponent
                                                                        style={[
                                                                            commonStyles.verifiedtext,
                                                                            (isVerified || userinfo?.isEmployee) && { color: NEW_COLOR.TEXT_GREEN },  // Green color for verified status
                                                                        ]}
                                                                        text={isVerified || userinfo?.isEmployee || isCustomerReferral ? t("GLOBAL_CONSTANTS.VERIFIED") : t("GLOBAL_CONSTANTS.VERIFY")}
                                                                    />
                                                                )}
                                                            </ViewComponent>
                                                        </CommonTouchableOpacity>
                                                    </ViewComponent>
                                                </ViewComponent>



                                                {(isVerified || userinfo?.isEmployee || isCustomerReferral) && (
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend, commonStyles.gap8, commonStyles.mt5, commonStyles.mr8]}>
                                                        <MaterialIcons name="check-circle-outline" size={s(16)} color={NEW_COLOR.TEXT_GREEN} />
                                                        <Text style={[commonStyles.referalcodeverify]}>
                                                            {decryptAES(referralData?.name ?? userinfo?.referralFullName ?? '') || ""}
                                                        </Text>
                                                    </ViewComponent>
                                                )}


                                                {refferalCodeError && <ParagraphComponent style={[commonStyles.textRed]} text={refferalCodeError} />}
                                                {!touched?.referralCode && errors?.referralCode && (
                                                    <ParagraphComponent
                                                        style={[commonStyles.inputrequirederrormessage]}
                                                        text={errors?.referralCode}
                                                    />
                                                )}
                                                <ViewComponent style={[commonStyles.sectionGap]} />
                                            </>)}

                                            {accountTypesList
                                                ?.filter((item: AccountTypeItem) => {
                                                    const accountType = userinfo?.metadata?.chooseAccount?.mobile?.chooseAccount?.toLowerCase();

                                                    if (accountType === 'both' || accountType === '' || accountType === undefined || accountType === null) return true; // Show both
                                                    if (accountType === 'personal') return item.accountType === 'Personal';
                                                    if (accountType === 'business') return item.accountType === 'Business';
                                                    return true; // default case (show all if undefined)
                                                })
                                                ?.map((item: AccountTypeItem) => (
                                                    <ViewComponent key={item?.id}>
                                                        <CommonTouchableOpacity
                                                            activeOpacity={0.8}
                                                            onPress={() => handlenavigateRegistration(item)}
                                                            disabled={item.disable}
                                                        >
                                                            <ViewComponent
                                                                style={[
                                                                    commonStyles.flex1,
                                                                    commonStyles.gap16,
                                                                    commonStyles.accountTypeStyle,
                                                                    commonStyles.dflex,
                                                                    commonStyles.justifyContent,
                                                                    commonStyles.alignCenter,
                                                                ]}
                                                            >
                                                                <ViewComponent style={[commonStyles.flex1]}>
                                                                    <ParagraphComponent
                                                                        text={item?.name}
                                                                        style={[commonStyles.chooseaccounttype]}
                                                                    />
                                                                    {item?.message ? (
                                                                        <ParagraphComponent
                                                                            text={item?.message}
                                                                            style={[commonStyles.chooseaccounttypepara]}
                                                                        />
                                                                    ) : (
                                                                        <>
                                                                            {item?.accountType === 'Personal' && (
                                                                                <ParagraphComponent
                                                                                    text={t('GLOBAL_CONSTANTS.PERSONAL_DESCRIPTION')}
                                                                                    style={[
                                                                                        commonStyles.chooseaccounttypepara,
                                                                                    ]}
                                                                                />
                                                                            )}
                                                                            {item?.accountType === 'Business' && (
                                                                                <ParagraphComponent
                                                                                    text={t('GLOBAL_CONSTANTS.BUSINESS_DESCRIPTION')}
                                                                                    style={[
                                                                                        commonStyles.chooseaccounttypepara,
                                                                                        item?.isChecked
                                                                                            ? commonStyles.textWhite
                                                                                            : commonStyles.textlinkgrey,
                                                                                    ]}
                                                                                />
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </ViewComponent>

                                                                <ViewComponent>
                                                                    {item?.isChecked ? (
                                                                        <AntDesign
                                                                            name="checkcircle"
                                                                            size={s(18)}
                                                                            color={NEW_COLOR.TEXT_GREEN}
                                                                        />
                                                                    ) : (
                                                                        <Entypo
                                                                            name="circle"
                                                                            size={s(18)}
                                                                            color={NEW_COLOR.RADIO_INACTIVEBORDER}
                                                                        />
                                                                    )}
                                                                </ViewComponent>
                                                            </ViewComponent>
                                                        </CommonTouchableOpacity>
                                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    </ViewComponent>
                                                ))}


                                        </ScrollView>
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.CONTINUE"}
                                            onPress={handleSubmit}
                                            disable={isAccountChecked ? false : true}
                                        />

                                        <ViewComponent style={[commonStyles.buttongap]} />
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.LOGOUT"}
                                            onPress={handleLogoutBtn}
                                            solidBackground={true}
                                        />
                                        <ViewComponent style={[commonStyles.sectionGap]} />
                                        <ViewComponent style={[commonStyles.mb10]} />
                                    </ViewComponent>

                                    <ConfirmLogout
                                        isVisible={isVisible}
                                        onClose={handleClose}
                                        onConfirm={handleConfirm} />

                                </>)
                        }
                        }
                    </Formik>
                </Container>}
            </KeyboardAwareScrollView>
        </SafeAreaView >
    )
})

export default ChooseAccountType;

