import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Formik } from "formik";
import CreateAccountService from '../../../../apiServices/bank/createAccount';
import { formatDateTimeAPI, isErrorDispaly } from '../../../../utils/helpers';
import ErrorComponent from '../../../../components/errorDisplay/errorDisplay';
import { useSelector } from 'react-redux';
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import Container from '../../../../components/container/container';
import AuthService from '../../../../apiServices/onBoarding/auth';
import { useLngTranslation } from '../../../../hooks/languagesHook/useLngTranslation';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CountryListItem, LocalRootStackParamList, PhoneCodeListItem, RegFormValues, RootState, CustomerProfileData } from './constants';
import SafeAreaViewComponent from '../../../../components/safeArea/safeArea';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { EditPersonalInfoSchema } from './schema';
import DashboardLoader from '../../../../components/loader';
import EditInfoForm from './editPersonalInformation';
import ViewComponent from '../../../../components/view/view';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PageHeader from '../../../../components/pageHeader/pageHeader';

interface ApiResponse<T> {
    ok: boolean;
    data?: T;
    error?: unknown;
}
interface CountryDetailsResponseData {
    Country: CountryListItem[];
    PhoneCodes: PhoneCodeListItem[];
    Gender: { name: string;[key: string]: any }[];
}

type EditPersonalInfoScreenProps = NativeStackScreenProps<LocalRootStackParamList, 'CustomerRigister'>;

const EditPersonalInfo: React.FC<EditPersonalInfoScreenProps> = () => {
    const [countries, setCountries] = useState<CountryListItem[]>([]);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [isAddressRequired, setIsAddressRequired] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [genderOptions, setGenderOptions] = useState<any[]>([]);
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const [initialValues, setInitialValues] = useState<RegFormValues>({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        country: '',
        businessName: '',
        phoneCode: "",
        gender: '',
        state: "",
        city: "",
        addressLine1: "",
        postalCode: "",
        incorporationDate: null,
    });

    const userinfo = useSelector((state: RootState) => state.userReducer?.userDetails);
    const navigation = useNavigation<NativeStackScreenProps<LocalRootStackParamList>['navigation']>();
    const [countryCodelist, setCountryCodelist] = useState<PhoneCodeListItem[]>([]);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isCheckedError, setIsCheckedError] = useState<string | null>(null);
    const isFocused = useIsFocused();
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const validationSchema = useMemo(() => {
        return EditPersonalInfoSchema(isAddressRequired, userinfo?.accountType);
    }, [isAddressRequired, userinfo?.accountType]);

    const getListOfCountryDetails = useCallback(async () => {
        try {
            const response = await CreateAccountService.getListOfCountries() as ApiResponse<CountryDetailsResponseData>;
            if (response?.ok) {
                setCountries(response.data?.Country ?? []);
                setCountryCodelist(response.data?.PhoneCodes ?? []);
                if (response.data?.Gender) {
                    const mappedGenders = response.data.Gender.map((gender: any) => {
                        let key = gender.name.toUpperCase();
                        if (key === 'OTHERS') {
                            key = 'OTHER';
                        }
                        return { label: `GLOBAL_CONSTANTS.${key}`, name: gender.name };
                    });
                    setGenderOptions(mappedGenders);
                }
                setErrormsg(null);
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    }, []);

    const getCustomerProfileInfo = useCallback(async () => {
        setLoading(true);
        setErrormsg(null);
        try {
            const response = await AuthService.getCustomerProfile(userinfo?.accountType) as ApiResponse<CustomerProfileData>;
            if (!response?.ok) {
                setErrormsg(isErrorDispaly(response));
                setLoading(false);
                return;
            }
            const profileData = response.data;
            setIsAddressRequired(profileData?.isAddressRequiredWhileSignup || false);
            setInitialValues({
                firstName: profileData?.firstName ?? '',
                lastName: profileData?.lastName ?? '',
                phoneNumber: profileData?.phoneNumber ? decryptAES(profileData.phoneNumber) : '',
                country: profileData?.country ?? '',
                phoneCode: profileData?.phoneCode ? decryptAES(profileData.phoneCode) : '',
                businessName: profileData?.businessName ?? '',
                gender: profileData?.gender ?? '',
                state: profileData?.state ?? '',
                city: profileData?.city ?? '',
                addressLine1: profileData?.addressLine1 ?? '',
                postalCode: profileData?.postalCode ?? '',
                incorporationDate: profileData?.incorporationDate ? new Date(profileData.incorporationDate) : null,
            });
            setIsChecked(true);
            setErrormsg(null);
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    }, [userinfo?.accountType, decryptAES]);

    useEffect(() => {
        if (isFocused) {
            getListOfCountryDetails();
            getCustomerProfileInfo();
        }
    }, [isFocused, getListOfCountryDetails, getCustomerProfileInfo]);

    const handleSubmit = useCallback(async (values: RegFormValues) => {
        if (!isChecked) {
            setIsCheckedError(t('GLOBAL_CONSTANTS.ERROR_ACCEPT_TERMS'));
            return;
        }
        setIsCheckedError(null);
        setSaveLoading(true);

        const payload: Partial<CustomerProfileData> & { isAccepted?: boolean } = {
            phoneNo: encryptAES(values.phoneNumber),
            phoneCode: encryptAES(values.phoneCode),
            country: values.country,
            isAccepted: isChecked,
        };

        if (userinfo?.accountType !== 'Business') {
            payload.firstName = values.firstName;
            payload.lastName = values.lastName;
            payload.gender = values.gender;
        } else {
            payload.businessName = values.businessName;
            payload.incorporationDate = values.incorporationDate ? formatDateTimeAPI(values.incorporationDate) : undefined;
        }

        if (isAddressRequired) {
            payload.state = values.state;
            payload.city = values.city;
            payload.addressLine1 = values.addressLine1;
            payload.postalCode = values.postalCode;
        }
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            navigation.goBack();
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setSaveLoading(false);
        }
    }, [encryptAES, isAddressRequired, isChecked, navigation, t, userinfo?.accountType]);

    const handleBackArrow = useCallback(() => {
        navigation.navigate("NewProfile", { animation: "slide_from_left" });
    }, [navigation]);

    const handleCheck = useCallback((isActive: boolean) => {
        setIsChecked(isActive);
        if (isActive) setIsCheckedError(null);
    }, []);

    if (loading) {
        return (
            <SafeAreaViewComponent transparentBg={true} style={[commonStyles.screenBg, commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                <DashboardLoader />
            </SafeAreaViewComponent>
        );
    }
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <Container style={[commonStyles.container]}>
                    <PageHeader showLogo={false} onBackPress={handleBackArrow} title={t("GLOBAL_CONSTANTS.EDIT_PERSIONAL_INFORMATION_TITLE")} />
                    {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {(formikProps) => (
                            <EditInfoForm
                                {...formikProps}
                                userinfo={userinfo}
                                isAddressRequired={isAddressRequired}
                                countries={countries}
                                countryCodelist={countryCodelist}
                                commonStyles={commonStyles}
                                NEW_COLOR={NEW_COLOR}
                                isChecked={isChecked}
                                handleCheck={handleCheck}
                                isCheckedError={isCheckedError}
                                genderOptions={genderOptions}
                                saveLoading={saveLoading} // Pass saveLoading
                                handleBackArrow={handleBackArrow} // Pass handleBackArrow
                            />
                        )}
                    </Formik>
                </Container>
            </KeyboardAwareScrollView>
        </ViewComponent >
    );
};

export default EditPersonalInfo;


