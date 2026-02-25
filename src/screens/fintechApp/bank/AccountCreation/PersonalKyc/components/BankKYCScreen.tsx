import React, { useEffect, useState, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { BackHandler } from 'react-native';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import { formatDateTimeForAPI, isErrorDispaly } from '../../../../../../utils/helpers';
import { BankAccountService } from '../../../../../../apiServices/bank';
import ViewComponent from '../../../../../../components/view/view';
import Container from '../../../../../../components/container/container';
import DashboardLoader from '../../../../../../components/loader';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import ButtonComponent from '../../../../../../components/buttons/button';
import { useBankSumsubSDK } from '../../../../../../hooks/sumsubHooks/useBankSumsubSDK';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import SuccessBottomSheet from '../../../../../commonScreens/successBottomSheet/successBottomSheet';
import ProfileService from '../../../../../../apiServices/profile';

interface BankKYCScreenProps {
    route: {
        params: {
            requirement?: string;
            selectedBank?: any;
            selectedCurrency?: any;
            productId?: string;
            onSuccess?: () => void;
            onError?: (error: string) => void;
        };
    };
}

const BankKYCScreen = ({ route }: BankKYCScreenProps) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [apiLoading, setApiLoading] = useState(false);
    const [showContinue, setShowContinue] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false); // Prevent multiple initializations
    const { launchBankSumsubSDK } = useBankSumsubSDK();
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { selectedAddresses, identityDocuments, personalDob } = useSelector((state: any) => state.userReducer);
    const successSheetRef = useRef<any>(null);

    const { requirement, selectedBank, selectedCurrency, productId, onSuccess, onError } = route.params || {};


    useEffect(() => {
        if (!isInitialized) {
            initializeKYC();
        }
    }, [isInitialized]);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (apiLoading) {
                    return true; // Prevent default behavior
                }
                return false; // Allow default behavior
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [apiLoading])
    );

    const initializeKYC = async () => {
        try {
            setLoading(true);
            setError('');
            setIsInitialized(true);

            if (requirement) {
                await launchBankSumsubSDK({
                    requirement,
                    onSuccess: () => {
                        handleSumsubSuccess();
                    },
                    onPending: () => {
                        setLoading(false);
                        navigation.goBack();
                    }
                });
                // If we reach here, Sumsub was dismissed/rejected
                setLoading(false);
                return;
            }

            if (productId) {
                const detailsRes = await ProfileService.kycInfoDetails(productId);

                if (detailsRes?.ok && detailsRes.data?.kyc?.provider?.toLowerCase() === "sumsub") {
                    const kycRequirement = detailsRes.data?.kyc?.requirement;

                    await launchBankSumsubSDK({
                        requirement: kycRequirement,
                        onSuccess: () => {
                            handleSumsubSuccess();
                        },
                        onPending: () => {
                            setLoading(false);
                            navigation.goBack();
                        }
                    });
                    // If we reach here, Sumsub was dismissed/rejected
                    setLoading(false);
                } else {
                    setError('KYC provider is not Sumsub or invalid response');
                    setLoading(false);
                }
            } else {
                setError('No product ID provided');
                setLoading(false);
            }
        } catch (err) {
            setError(isErrorDispaly(err));
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (!apiLoading) {
            navigation.goBack();
        }
    };


    const handleSumsubSuccess = async () => {
        try {
            setLoading(false);

            // Check if account creation fee is 0
            const hasAccountCreationFee = selectedBank?.accountCreationFee || selectedCurrency?.banks?.[0]?.accountCreationFee;

            if (!hasAccountCreationFee) {
                // Fee is 0, call API and show success
                try {
                    setApiLoading(true);

                    // Build payload similar to BankKycProfilePreview
                    const transformedPersonalDocuments = (identityDocuments || []).filter((doc: any) => {
                        if (doc.documentType?.toLowerCase() === "passport") {
                            const hasData = doc.frontImage || doc.backDocImage || doc.documentNumber || doc.handHoldingImage || doc.selfieImage || doc.singatureImage;
                            return hasData;
                        }
                        if (doc.documentType?.toLowerCase() === "national id") {
                            const hasData = doc.frontImage || doc.backDocImage || doc.documentNumber;
                            return hasData;
                        }
                        return false;
                    }).map((doc: any) => {
                        const transformed = {
                            documentType: doc.documentType,
                            frontImage: doc.frontImage || "",
                            backDocImage: null,
                            handHoldingImage: doc.handHoldingImage || "",
                            singatureImage: doc.singatureImage || "",
                            selfieImage: doc.selfieImage || "",
                            docId: doc.documentNumber || "",
                            docExpiryDate: doc.documentExpiryDate ? (() => {
                                if (doc.documentExpiryDate instanceof Date) {
                                    return formatDateTimeForAPI(doc.documentExpiryDate);
                                }
                                if (typeof doc.documentExpiryDate === 'string') {
                                    if (doc.documentExpiryDate.includes('AM') || doc.documentExpiryDate.includes('PM')) {
                                        const parts = doc.documentExpiryDate.split(' ');
                                        const datePart = parts[0];
                                        const timePart = parts[1];
                                        const ampm = parts[2];

                                        const [month, day, year] = datePart.split('/');
                                        const [hour, minute, second] = timePart.split(':');

                                        let hour24 = parseInt(hour);
                                        if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
                                        if (ampm === 'AM' && hour24 === 12) hour24 = 0;

                                        const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour24.toString().padStart(2, '0')}:${minute}:${second}`;
                                        const dateObj = new Date(isoString);

                                        if (!isNaN(dateObj.getTime())) {
                                            return formatDateTimeForAPI(dateObj);
                                        }
                                    } else {
                                        const dateObj = new Date(doc.documentExpiryDate);
                                        if (!isNaN(dateObj.getTime())) {
                                            return formatDateTimeForAPI(dateObj);
                                        }
                                    }
                                }
                                return "";
                            })() : ""
                        };
                        return transformed;
                    });

                    const payload = {
                        walletId: null,
                        amount: 0,
                        metadata: null,
                        documents: [],
                        address: [],
                        ubo: [],
                        director: [],
                        isReapply: false,
                        sector: null,
                        type: null,
                        dob: null
                    };

                    const response = await BankAccountService.summaryAccountCreation(
                        selectedBank?.productId || productId,
                        payload
                    );

                    if (response?.ok) {
                        setApiLoading(false);
                        if (onSuccess) {
                            // Go back to CreateAccountForm and show success
                            navigation.goBack();
                            onSuccess();
                        } else {
                            successSheetRef.current?.open();
                        }
                    } else {
                        setApiLoading(false);
                        const errorMsg = isErrorDispaly(response);
                        if (onError) {
                            // Go back to CreateAccountForm and show error
                            navigation.goBack();
                            onError(errorMsg);
                        } else {
                            setError(errorMsg);
                            setShowContinue(true);
                        }
                    }
                } catch (err) {
                    setApiLoading(false);
                    const errorMsg = isErrorDispaly(err);
                    if (onError) {
                        // Go back to CreateAccountForm and show error
                        navigation.goBack();
                        onError(errorMsg);
                    } else {
                        setError(errorMsg);
                        setShowContinue(true);
                    }
                }
            } else {
                // Has fee, navigate directly to payment screen
                navigation.navigate('payWithWalletTabs', {
                    selectedBank,
                    selectedCurrency,
                    productId: selectedBank?.productId || productId
                });
            }
        } catch (err) {
            setLoading(false);
            setApiLoading(false);
            const errorMsg = isErrorDispaly(err);
            if (onError) {
                navigation.goBack();
                onError(errorMsg);
            } else {
                setError(errorMsg);
                setShowContinue(true);
            }
        }
    };

    const handleContinue = () => {
        // Navigate to payment screen or next step
        navigation.navigate('payWithWalletTabs', {
            selectedBank,
            selectedCurrency,
            productId: selectedBank?.productId || productId
        });
    };

    if (loading) {
        return (
            <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
                <Container style={commonStyles.container}>
                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </ViewComponent>
                </Container>
            </ViewComponent>
        );
    }

    if (error) {
        return (
            <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
                <Container style={commonStyles.container}>
                    <ErrorComponent
                        message={error}
                        onClose={() => setError('')}
                    />
                </Container>
            </ViewComponent>
        );
    }

    if (showContinue) {
        return (
            <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
                <Container style={commonStyles.container}>
                    <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>
                        <ViewComponent style={[commonStyles.flex1]} />
                        <ViewComponent>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CONTINUE"
                                onPress={handleContinue}
                                loading={apiLoading}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </Container>
                <SuccessBottomSheet
                    sheetRef={successSheetRef}
                    navigation={navigation}
                />
            </ViewComponent>
        );
    }

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container style={commonStyles.container}>
                <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </ViewComponent>
            </Container>
            <SuccessBottomSheet
                sheetRef={successSheetRef}
                navigation={navigation}
            />
        </ViewComponent>
    );
};

export default BankKYCScreen;
