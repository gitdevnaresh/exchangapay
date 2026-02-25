import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { CommonActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { dateFormates, formatDateTimeDatePicker, isErrorDispaly } from '../../../../../utils/helpers';
import { getThemedCommonStyles, statusColor } from '../../../../../components/CommonStyles';
import { s } from '../../../../../constants/styels/scale';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import Container from '../../../../../components/container/container';
import ProfileService from '../../../../../apiServices/profile';
import { useSelector } from 'react-redux';
import NoDataComponent from '../../../../../components/noData/noData';
import FilePreview from '../../../../../components/fileUpload/filePreview';
import useMemberLogin from '../../../../../hooks/userInfoHook';
import ViewComponent from '../../../../../components/view/view';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ButtonComponent from '../../../../../components/buttons/button';
import UploadDeleteIcon from '../../../../../components/svgIcons/mainmenuicons/deleteicon';
import { EditImage } from '../../../../../assets/svg';
import DashboardLoader from '../../../../../components/loader';
import { SelectedRecordType } from '../interface';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import FlatListComponent from '../../../../../components/flatList/flatList';
import { FormattedDateText } from '../../../../../components/textComponets/dateTimeText/dateTimeText';
import { AntDesign } from '@expo/vector-icons';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';

const KybInfoPreview = (props: any) => {
    const isFocused = useIsFocused();
    const [errormsg, setErrormsg] = useState<any>(null);
    const [persionalDetails, setPersionalDetails] = useState<any>({});
    const [loadingData, setLoadingData] = useState(false);
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [modelVisible, setModelvisible] = useState<boolean>(false);
    const modalSheetRef = useRef<any>(null);
    const [selectedRecord, setSelectedRecord] = useState<SelectedRecordType>({});
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const ref = useRef<any>(null);
    const navigation = useNavigation<any>();
    const { getMemDetails } = useMemberLogin();
    const { decryptAES } = useEncryptDecrypt();
    const [documentTypesLookUp, setDocumentTypesLookUp] = useState<any[]>([]);
    // --- Accordion State Management ---
    const ACCORDION_KEYS = {
        UBO: 'UBO',
        DIRECTORS: 'DIRECTORS',
        SHAREHOLDERS: 'SHAREHOLDERS',
        REPRESENTATIVES: 'REPRESENTATIVES'
    };
    const [openAccordion, setOpenAccordion] = useState(ACCORDION_KEYS.UBO);
    const handleToggleAccordion = (key: any) => {
        // If the clicked section is already open, close it. Otherwise, open the clicked section.
        setOpenAccordion(prevKey => (prevKey === key ? null : key));
    };
    const uniqueKybDocs = useMemo(() => {
        const docs = persionalDetails?.businessCustomerDetails?.kybDocs || [];
        return docs.filter((doc: any, index: number, self: any[]): any =>
            index === self.findIndex((d: any) => (d.docType === doc.docType))
        );
    }, [persionalDetails]);
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

    useEffect(() => {
        getPersionalDetails();
        getListOfCountryDetails();
    }, [isFocused]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();

    }, [])

    const getListOfCountryDetails = async () => {
        try {
            const response: any = await ProfileService.getDocumentTypes();
            if (response?.status === 200) {
                setDocumentTypesLookUp(response?.data?.KybDocumentTypes);
                setErrormsg("");
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }

    };

    const handleRefresh = useCallback(() => {
        getPersionalDetails();
        getMemDetails(true)
    }, [])

    const getPersionalDetails = async () => {
        setErrormsg('')
        setLoadingData(true);
        try {
            const res: any = await ProfileService.kybInfoDetails();
            if (res?.ok) {
                setPersionalDetails(res?.data);
                setLoadingData(false);
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setLoadingData(false)
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setLoadingData(false)
        }
    };
    const handleDelete = () => {
        updateUbosList();
    }
    const updateUbosList = async () => {
        let data;
        if (selectedRecord?.fileName == 'directorsList') {
            data = persionalDetails.directors.find((item: any) => item.id == selectedRecord?.id);
        } else {
            data = persionalDetails.ubos.find((item: any) => item.id == selectedRecord?.id);
        }
        function isUSDateFormat(dateStr: any) {
            const usDateFormatRegex = /^\d{1,2}\/\d{1,2}\/\d{4}/;
            return usDateFormatRegex.test(dateStr);
        }
        let updatedUbo = [{
            id: selectedRecord?.id,
            uboPosition: data?.uboPosition,
            firstname: data?.firstname || data?.firstName,
            lastname: data?.lastname || data?.lastName,
            middleName: data?.middleName,
            dob: isUSDateFormat(data?.dob) ? formatDateTimeDatePicker(data?.dob) : data?.dob,
            phoneNumber: data?.phoneNumber,
            recordStatus: "Deleted",
            phoneCode: data?.phoneCode || null,
            positionWithCompany: data?.positionWithCompany || null,
            email: null,
            companyName: data?.companyName || null,
            registrationNumber: "",
            country: data?.country,
            dateOfRegistration: null,
            note: data?.note || null,
            shareHolderPercentage: data?.shareHolderPercentage || 0,
            docDetails: {
                id: "00000000-0000-0000-0000-000000000000",
                frontIdPhoto: null,
                backDocImage: null,
                docType: null,
                docNumber: null,
                docExpiryDate: null
            }
        }];
        try {
            let response;
            if (selectedRecord?.fileName == 'directorsList') {
                response = await ProfileService.updateKybDirectrs(updatedUbo);
            } else {
                response = await ProfileService.updateKybUbos(updatedUbo);
            }
            if (response?.ok) {
                setErrormsg('');
                setModelvisible(!modelVisible);
                modalSheetRef.current?.close();
                getPersionalDetails();
            } else {
                setErrormsg(isErrorDispaly(response));
                setModelvisible(!modelVisible);
                modalSheetRef.current?.close();
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setModelvisible(!modelVisible);
            modalSheetRef.current?.close();
        }
    }
    const handleBack = () => {
        if (props?.route?.params?.navigation == "NewProfile") {
            navigation.navigate("NewProfile", { animation: 'slide_from_left' })
        } else {
            navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.HOME" });
        }
    };
    const handleSubmit = async () => {
        if (persionalDetails?.directors?.length == 0) {
            setErrormsg('Please add atleast one Directors');
            return ref?.current?.scrollTo({ y: 0, animated: true });
        } else if (persionalDetails?.ubos?.length == 0) {
            setErrormsg('Please add atleast one Ubo');
            return ref?.current?.scrollTo({ y: 0, animated: true });
        }
        setBtnLoading(true);
        const Obj = {
            "customerId": userinfo?.id, "isKycComplete": true
        }
        try {
            const res = await ProfileService.updateKycStatus(Obj);
            if (res?.ok) {
                setErrormsg('');
                setBtnLoading(false);
                if (userinfo?.customerState != "Approved") {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 1,
                            routes: [{ name: "AccountProgress" }],
                        })
                    );
                    return
                } else if (userinfo?.isInitialSubscriptionRequired && !userinfo?.isSubscribed) {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 1,
                            routes: [{ name: "PackageBuy" }],
                        })
                    );
                    return
                } else {
                    getMemDetails(true)
                    props?.navigation.navigate('CompleteKyc');
                }
            } else {
                setBtnLoading(false);
                setErrormsg(isErrorDispaly(res))
            }
        } catch (error) {
            setBtnLoading(false);
            setErrormsg(isErrorDispaly(error))
        }
        props?.navigation.navigate('CompleteKyc');
    }
    const handleEditComanyData = (id: any) => {
        props?.navigation.navigate('KybCompanyData', { customerId: id })
    }
    const handleUbosEdit = (id: any) => {
        props?.navigation.navigate('KybAddUbosDetailsForm', { customerId: userinfo?.id, id: id })
    }
    const handleUbosDelete = useCallback((id: any) => {
        setSelectedRecord({ "id": id, fileName: "ubosList" });
        handleOpenModel();
    }, [modelVisible])
    const handleDirectorsEdit = (id: any) => {
        props?.navigation.navigate('KybAddDirectorsDetailsForm', { id: id })
    }
    const handleDirectorsDelete = useCallback((id: any) => {
        setSelectedRecord({ "id": id, "fileName": "directorsList" });
        handleOpenModel();
    }, [modelVisible])
    const noData = () => {
        if (!loadingData && persionalDetails?.ubos?.length === 0) {
            return <NoDataComponent />
        }
        return null;
    }
    const directorsNoData = () => {
        if (!loadingData && persionalDetails?.directors?.length === 0) {
            return <NoDataComponent />
        }
        return null;
    }
    const shareHolderNoData = () => {
        if (!loadingData && persionalDetails?.shareholder?.length === 0) {
            return <NoDataComponent />
        }
        return null;
    }
    const representativeNoData = () => {
        if (!loadingData && persionalDetails?.representative?.length === 0) {
            return <NoDataComponent />
        }
        return null;
    }
    const uploadNoData = () => {
        if (!loadingData && !persionalDetails?.businessCustomerDetails?.kybDocs) {
            return <NoDataComponent />
        }
        return null;
    }
    const handleOpenModel = () => {
        setModelvisible(true);
        setTimeout(() => {
            modalSheetRef.current?.open();
        }, 100); // Delay to ensure modal is ready
    };
    const handleCloseModel = () => { // Renamed from handleCloseModel to avoid conflict if any
        setModelvisible(false);
        modalSheetRef.current?.close();
    };
    const handleAddUbos = () => {
        props?.navigation.navigate('KybAddUbosDetailsForm', { ubosAdd: true })
    };
    const handleAddDirectors = () => {
        props?.navigation.navigate('KybAddDirectorsDetailsForm', { addDirector: true })
    };
    const handleAddShareHolderDetails = () => {
        props?.navigation.navigate('AddShareHolderDetailsForm', { animation: "slide_from_left", addShareHolderDetails: true })
    };
    const handleShareHolderDetailsEdit = (id: any) => {
        props?.navigation.navigate('AddShareHolderDetailsForm', { animation: "slide_from_left", id: id })
    }
    const handleAddRepresentiverDetails = () => {
        props?.navigation.navigate('RepresentiveDetailsForm', { animation: "slide_from_left", addRepresentiveDetails: true })
    };
    const handleRepresentiveDetailsEdit = (id: any) => {
        props?.navigation.navigate('RepresentiveDetailsForm', { animation: "slide_from_left", id: id })
    }

    const handleError = useCallback(() => {
        setErrormsg(null)
    }, []);
    // Helper component for accordion headers to keep JSX clean
    type AccordionHeaderProps = {
        sectionKey: string;
        title: string;
        onAdd: () => void;
    };
    const handleview = (item: any, pageHeaderTitleKey: string) => {
        navigation.navigate('KybView', { bindata: item, pageHeaderTitleKey: pageHeaderTitleKey }) // Default title
    }
    const AccordionHeader: React.FC<AccordionHeaderProps> = ({ sectionKey, title, onAdd }) => (
        <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.bgnote, openAccordion === sectionKey ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
            <TouchableOpacity onPress={() => handleToggleAccordion(sectionKey)} style={[commonStyles.flex1]}>
                <ParagraphComponent style={[commonStyles.secondsectiontitle]} text={title} />
            </TouchableOpacity>
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                {userinfo?.metadata?.kycType?.toLocaleLowerCase() !== "sumsub" && <TouchableOpacity activeOpacity={0.8} onPress={onAdd}>
                    <MaterialCommunityIcons name="plus-circle-outline" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                </TouchableOpacity>}
                <TouchableOpacity onPress={() => handleToggleAccordion(sectionKey)}>
                    <MaterialCommunityIcons name={openAccordion === sectionKey ? "chevron-up" : "chevron-down"} size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loadingData && <DashboardLoader />}
            {!loadingData && <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.KYB_INFORMATION"} onBackPress={handleBack} isrefresh={true} onRefresh={handleRefresh} />
                <ScrollView showsVerticalScrollIndicator={false} ref={ref}>
                    <>
                        <ViewComponent style={[commonStyles.rounded50, commonStyles.dflex, commonStyles.justifyend, commonStyles.alignCenter]}>
                            <ParagraphComponent text={userinfo?.kycStatus} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.p8, commonStyles.rounded50, { color: statusColor[userinfo?.kycStatus?.toLowerCase()] }]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.mb16]} />
                        {errormsg && <><ErrorComponent message={errormsg} onClose={handleError} />
                            <View style={commonStyles.mb24} />
                        </>}
                        {(persionalDetails && !loadingData) && <View>
                            {/* --- COMPANY DATA (Remains unchanged) --- */}
                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                                <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.COMPANY_DATA"} />
                                {userinfo?.metadata?.kycType?.toLocaleLowerCase() !== "sumsub" && <TouchableOpacity activeOpacity={0.8} onPress={() => handleEditComanyData(persionalDetails?.businessCustomerDetails?.id)}>
                                    <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter]}>
                                        <EditImage width={s(22)} height={s(22)} />
                                    </View>
                                </TouchableOpacity>}
                            </View>
                            <View>
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COMAPANY_NAME"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.companyName || "--"} />
                                </View>
                                <ViewComponent style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COUNTRY"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.country || "--"} />
                                </View>
                                <ViewComponent style={[commonStyles.listitemGap]} />

                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.REGISTRATION_NUMBER"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={decryptAES(persionalDetails?.businessCustomerDetails?.registrationNumber) || "--"} />
                                </View>
                                <ViewComponent style={[commonStyles.listitemGap]} />



                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DATE_OF_REGISTRATION"} />
                                    {
                                        persionalDetails?.businessCustomerDetails?.dateOfRegistration
                                            ? (
                                                <FormattedDateText
                                                    value={persionalDetails.businessCustomerDetails.dateOfRegistration}
                                                    conversionType="UTC-to-local"
                                                    dateFormat={dateFormates.date}
                                                    style={[commonStyles.listprimarytext]}
                                                />
                                            )
                                            : <ParagraphComponent text="--" style={[commonStyles.listprimarytext]} />
                                    }                               </View>
                            </View>

                            {persionalDetails?.businessCustomerDetails?.street && (<><ViewComponent style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.STREET"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.street || "--"} />
                                </View></>)}

                            {persionalDetails?.businessCustomerDetails?.state && (<><ViewComponent style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.STATE"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.state || "--"} />
                                </View></>)}

                            {persionalDetails?.businessCustomerDetails?.postCode && (<><ViewComponent style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.POSTAL_CODE"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.postCode || "--"} />
                                </View></>)}

                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            {!persionalDetails?.businessCustomerDetails && <NoDataComponent />}

                            {/* --- UPLOAD DOCUMENT (Remains unchanged) --- */}
                            <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.UPLOAD_DOCUMENT"} />
                            <FlatListComponent
                                data={uniqueKybDocs || []}
                                scrollEnabled={false}   // ?? disables FlatList scroll
                                nestedScrollEnabled={true}
                                renderItem={({ item, index }: any) => {
                                    const lookupItem = documentTypesLookUp?.find(lookup => lookup.code === item.docType || lookup.name === item.docType);
                                    const displayName = lookupItem ? lookupItem.name : item.docType;
                                    return (
                                        <View key={index}>
                                            {item?.url && (
                                                <View style={[commonStyles.formItemSpace]}>
                                                    <FilePreview label={displayName} uploadedImageUri={item?.url} />
                                                </View>
                                            )}
                                        </View>
                                    );
                                }}
                                keyExtractor={(item: any, index: number) => `${item.id}-${index}`}
                                ListEmptyComponent={uploadNoData}
                            />

                            {/* --- UBO DETAILS ACCORDION --- */}
                            <View style={[commonStyles.titleSectionGap, openAccordion === ACCORDION_KEYS.UBO ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                <AccordionHeader sectionKey={ACCORDION_KEYS.UBO} title={"GLOBAL_CONSTANTS.UBO_DETAILS_TITLE"} onAdd={handleAddUbos} />
                                {openAccordion === ACCORDION_KEYS.UBO && (
                                    <View style={[commonStyles.sectionGap]}>
                                        <FlatListComponent
                                            scrollEnabled={false}
                                            nestedScrollEnabled={true}
                                            data={persionalDetails?.ubos || []}
                                            renderItem={({ item, index }: any) => (
                                                <View style={[commonStyles.px14]}>
                                                    <TouchableOpacity onPress={() => handleview(item, "GLOBAL_CONSTANTS.UBO_DETAILS_TITLE")} activeOpacity={0.8}>
                                                        <View style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent]}>
                                                            <View style={[commonStyles.flex1, commonStyles.mt16]}>
                                                                <ParagraphComponent text={item?.uboPosition} style={[commonStyles.listprimarytext, commonStyles.mb2,]} />
                                                                <ParagraphComponent text={item?.firstname || item?.firstName} style={[commonStyles.listsecondarytext]} />
                                                            </View>
                                                            <View style={[commonStyles.flex1, commonStyles.mt16]}>
                                                                {item?.dob && <FormattedDateText value={item?.dob} conversionType='UTC-to-local' dateFormat={dateFormates.date} style={[commonStyles.secondarytext]} />}
                                                                <ParagraphComponent text={`${decryptAES(item?.phoneCode || '')} ${decryptAES(item?.phoneNumber)}`} style={[commonStyles.listprimarytext]} />
                                                            </View>
                                                            {userinfo?.metadata?.kycType?.toLocaleLowerCase() !== "sumsub" && <View style={[commonStyles.dflex, commonStyles.gap14, { width: s(60) }]}>
                                                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleUbosEdit(item?.id)}><EditImage width={s(16)} height={s(20)} /></TouchableOpacity>
                                                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleUbosDelete(item?.id)}><UploadDeleteIcon width={s(16)} height={s(16)} /></TouchableOpacity>
                                                            </View>}
                                                            {userinfo?.metadata?.kycType?.toLocaleLowerCase() == "sumsub" && <View style={[commonStyles.dflex, commonStyles.mt16]}><AntDesign name="eyeo" size={s(24)} color={NEW_COLOR.TEXT_PRIMARY} /></View>}
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            keyExtractor={(item: any) => item?.id?.toString()}
                                            ListEmptyComponent={noData}
                                        />
                                        {/* {(persionalDetails?.ubos?.length == 0 || !persionalDetails?.ubos) && <View><NoDataComponent /></View>} */}
                                    </View>
                                )}
                            </View>

                            {/* --- DIRECTORS DETAILS ACCORDION --- */}
                            <View style={[commonStyles.titleSectionGap, openAccordion === ACCORDION_KEYS.DIRECTORS ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                <AccordionHeader sectionKey={ACCORDION_KEYS.DIRECTORS} title={"GLOBAL_CONSTANTS.DIRECTORS_DETAILS"} onAdd={handleAddDirectors} />
                                {openAccordion === ACCORDION_KEYS.DIRECTORS && (
                                    <View style={[commonStyles.sectionGap]}>
                                        <FlatListComponent
                                            data={persionalDetails?.directors || []}
                                            renderItem={({ item, index }: any) => (
                                                <View style={[commonStyles.px14]}>
                                                    <TouchableOpacity onPress={() => handleview(item, "GLOBAL_CONSTANTS.DIRECTORS_DETAILS")} activeOpacity={0.8}>
                                                        <View style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap12]}>
                                                            <View style={[commonStyles.flex1, commonStyles.mt16]}><ParagraphComponent text={item?.uboPosition} style={[commonStyles.listprimarytext, commonStyles.mb2,]} /><ParagraphComponent text={item?.firstname || item?.firstName} style={[commonStyles.listsecondarytext]} /></View>
                                                            <View style={[commonStyles.flex1, commonStyles.mt16]}>{item?.dob && <FormattedDateText value={item?.dob} conversionType='UTC-to-local' dateFormat={dateFormates.date} style={[commonStyles.listsecondarytext, commonStyles.mb2]} />}<ParagraphComponent text={`${decryptAES(item?.phoneCode || '')} ${decryptAES(item?.phoneNumber)}`} style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} /></View>
                                                            {userinfo?.metadata?.kycType?.toLocaleLowerCase() !== "sumsub" && <View style={[commonStyles.dflex, commonStyles.gap14, { width: s(60) }]}><TouchableOpacity activeOpacity={0.8} onPress={() => handleDirectorsEdit(item?.id)}><EditImage width={s(16)} height={s(20)} /></TouchableOpacity><TouchableOpacity activeOpacity={0.8} onPress={() => handleDirectorsDelete(item?.id)}><UploadDeleteIcon width={s(16)} height={s(16)} /></TouchableOpacity></View>}
                                                            {userinfo?.metadata?.kycType?.toLocaleLowerCase() == "sumsub" && <View style={[commonStyles.dflex, commonStyles.mt16]}><AntDesign name="eyeo" size={s(24)} color={NEW_COLOR.TEXT_PRIMARY} /></View>}
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            keyExtractor={(item: any) => item?.id?.toString()}
                                            ListEmptyComponent={directorsNoData}
                                            scrollEnabled={false}
                                            nestedScrollEnabled={true}
                                        />
                                    </View>
                                )}
                            </View>

                            {/* --- SHAREHOLDER DETAILS ACCORDION --- */}
                            {(persionalDetails?.shareholder && persionalDetails?.shareholder?.length > 0) && (
                                <View style={[commonStyles.titleSectionGap, openAccordion === ACCORDION_KEYS.SHAREHOLDERS ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                    <AccordionHeader sectionKey={ACCORDION_KEYS.SHAREHOLDERS} title={"GLOBAL_CONSTANTS.SHAREHOLDER_DETAILS"} onAdd={handleAddShareHolderDetails} />
                                    {openAccordion === ACCORDION_KEYS.SHAREHOLDERS && (
                                        <View style={[commonStyles.sectionGap]}>
                                            <FlatListComponent
                                                data={persionalDetails?.shareholder || []}
                                                renderItem={({ item, index }: any) => (
                                                    <View style={[commonStyles.px14]}>
                                                        <TouchableOpacity onPress={() => handleview(item, "GLOBAL_CONSTANTS.SHAREHOLDER_DETAILS")} activeOpacity={0.8}>
                                                            <View style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap12]}>
                                                                <View style={[commonStyles.flex1, commonStyles.mt16]}><ParagraphComponent text={item?.uboPosition} style={[commonStyles.listprimarytext, commonStyles.mb2,]} /><ParagraphComponent text={item?.firstname || item?.firstName} style={[commonStyles.listsecondarytext]} /></View>
                                                                <View style={[commonStyles.flex1, commonStyles.mt16]}>{item?.dob && <FormattedDateText value={item?.dob} conversionType='UTC-to-local' dateFormat={dateFormates.date} style={[commonStyles.listsecondarytext, commonStyles.mb2]} />}<ParagraphComponent text={`${decryptAES(item?.phoneCode || '')} ${decryptAES(item?.phoneNumber)}`} style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} /></View>
                                                                {userinfo?.metadata?.kycType?.toLocaleLowerCase() !== "sumsub" && <View style={[commonStyles.dflex, commonStyles.gap14, { width: s(60) }]}><TouchableOpacity activeOpacity={0.8} onPress={() => handleShareHolderDetailsEdit(item?.id)}><EditImage width={s(16)} height={s(20)} /></TouchableOpacity><TouchableOpacity activeOpacity={0.8} onPress={() => handleDirectorsDelete(item?.id)}><UploadDeleteIcon width={s(16)} height={s(16)} /></TouchableOpacity></View>}
                                                                {userinfo?.metadata?.kycType?.toLocaleLowerCase() == "sumsub" && <View style={[commonStyles.dflex, commonStyles.mt16]}><AntDesign name="eyeo" size={s(24)} color={NEW_COLOR.TEXT_PRIMARY} /></View>}
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                keyExtractor={(item: any) => item?.id?.toString()}
                                                ListEmptyComponent={shareHolderNoData}
                                                scrollEnabled={false}
                                                nestedScrollEnabled={true}
                                            />
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* --- REPRESENTATIVE DETAILS ACCORDION --- */}
                            {(persionalDetails?.representative && persionalDetails?.representative?.length > 0) && (
                                <View style={[commonStyles.titleSectionGap, openAccordion === ACCORDION_KEYS.REPRESENTATIVES ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                    <AccordionHeader sectionKey={ACCORDION_KEYS.REPRESENTATIVES} title={"GLOBAL_CONSTANTS.REPRESENTIVE_DETAILS"} onAdd={handleAddRepresentiverDetails} />
                                    {openAccordion === ACCORDION_KEYS.REPRESENTATIVES && (
                                        <View style={[commonStyles.sectionGap]}>
                                            <FlatListComponent
                                                data={persionalDetails?.representative || []}
                                                renderItem={({ item, index }: any) => (
                                                    <View style={[commonStyles.px14]}>
                                                        <TouchableOpacity onPress={() => handleview(item, "GLOBAL_CONSTANTS.REPRESENTIVE_DETAILS")} activeOpacity={0.8}>
                                                            <View style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap12]}>
                                                                <View style={[commonStyles.flex1, commonStyles.mt16]}><ParagraphComponent text={item?.uboPosition} style={[commonStyles.listprimarytext, commonStyles.mb2,]} /><ParagraphComponent text={item?.firstname || item?.firstName} style={[commonStyles.listsecondarytext]} /></View>
                                                                <View style={[commonStyles.flex1, commonStyles.mt16]}>{item?.dob && <FormattedDateText value={item?.dob} conversionType='UTC-to-local' dateFormat={dateFormates.date} style={[commonStyles.listsecondarytext, commonStyles.mb2]} />}<ParagraphComponent text={`${decryptAES(item?.phoneCode || '')} ${decryptAES(item?.phoneNumber)}`} style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} /></View>
                                                                {userinfo?.metadata?.kycType?.toLocaleLowerCase() !== "sumsub" && <View style={[commonStyles.dflex, commonStyles.gap14, { width: s(60) }]}><TouchableOpacity activeOpacity={0.8} onPress={() => handleRepresentiveDetailsEdit(item?.id)}><EditImage width={s(16)} height={s(20)} /></TouchableOpacity><TouchableOpacity activeOpacity={0.8} onPress={() => handleDirectorsDelete(item?.id)}><UploadDeleteIcon width={s(16)} height={s(16)} /></TouchableOpacity></View>}
                                                                {userinfo?.metadata?.kycType?.toLocaleLowerCase() == "sumsub" && <View style={[commonStyles.dflex, commonStyles.mt16]}><AntDesign name="eyeo" size={s(24)} color={NEW_COLOR.TEXT_PRIMARY} /></View>}
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                keyExtractor={(item: any) => item?.id?.toString()}
                                                ListEmptyComponent={representativeNoData}
                                                scrollEnabled={false}
                                                nestedScrollEnabled={true}
                                            />
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>}

                        <View style={[commonStyles.mt50]} />
                        {(userinfo?.kycStatus !== "Submitted" && userinfo?.kycStatus !== "Approved") && <ButtonComponent
                            title={"GLOBAL_CONSTANTS.SUMBITED"}
                            onPress={handleSubmit}
                        />}
                        <View style={commonStyles?.mb32} />
                    </>
                </ScrollView>
                {/* --- RBSheet remains unchanged --- */}
                <CustomRBSheet
                    refRBSheet={modalSheetRef}
                    height={"Small"}
                    onClose={() => { }}
                    title={"GLOBAL_CONSTANTS.CONFIRM"}
                >
                    <View style={[commonStyles.mb16]}><ParagraphComponent style={commonStyles.sectionTitle} text={"GLOBAL_CONSTANTS.DO_YOU_WANT_TO_DELETE"} /></View>
                    <View style={[commonStyles.dflex, commonStyles.gap10, commonStyles.mt24]}>
                        <View style={[commonStyles.flex1]}><ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleCloseModel} solidBackground={true} /></View>
                        <View style={[commonStyles.flex1]}><ButtonComponent title={"GLOBAL_CONSTANTS.CONFIRM"} onPress={handleDelete} loading={btnLoading} /></View>
                    </View>
                </CustomRBSheet>
            </Container>}
        </ViewComponent>
    );
};

export default KybInfoPreview;
