import { View, Alert } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigation, RouteProp } from "@react-navigation/core";
import { dateFormates, formatDates, isErrorDispaly } from "../../../../utils/helpers";
import { getStatusColor, getThemedCommonStyles } from "../../../../components/CommonStyles";
import Container from "../../../../components/container/container";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import ProfileUpload from "../../../../components/fileUpload/imageUpload";
import CopyCard from "../../../../components/copyIcon/CopyCard";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import Clipboard from "@react-native-clipboard/clipboard";
import { useSelector } from "react-redux";
import ViewComponent from "../../../../components/view/view";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import { MainStackParamList, RootState } from "../profileInfo/interfaces";
import FileUpload from "../../../../components/fileUpload/fileUpload";
import * as ImagePicker from 'expo-image-picker';
import ProfileService from "../../../../apiServices/profile";
import { getFileExtension } from "../../onboarding/constants";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import AuthService from "../../../../apiServices/onBoarding/auth";
import { showAppToast } from "../../../../components/toasterMessages/ShowMessage";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";

type PersonalInfoScreenRouteProp = RouteProp<MainStackParamList, 'PersonalInfo'>;

interface PersonalInfoProps {
    route: PersonalInfoScreenRouteProp;
}

const PersonalInfo: React.FC<PersonalInfoProps> = (props) => {
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [uploadedDocument, setUploadedDocument] = useState<any>(null);
    const [documentFileName, setDocumentFileName] = useState<string>("");
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const { userDetails } = props.route.params;
    const { decryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();

    const handleErrorMsg = useCallback(() => {
        setErrormsg(null);
    }, []);

    // Helper function to safely decrypt optional strings
    const getSafeDecryptedText = useCallback((value: string | undefined | null): string => {
        if (typeof value === 'string' && value.length > 0) { // Ensure value is a non-empty string
            return decryptAES(value) ?? "";
        }
        return "";
    }, [decryptAES]);

    const handleGobackNavigation = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
    const statusColor = getStatusColor(NEW_COLOR);

    useEffect(() => {
        setUploadedDocument(userDetails?.referralLogo)
    }, [userDetails?.referralLogo]);

    useHardwareBackHandler(() => {
        handleGobackNavigation();
    })

    const handleCopyRef = useCallback(() => {
        const reference = userDetails?.reference;
        let stringToCopy = ""; // Default to empty string

        if (typeof reference === 'string') {
            const decryptedValue = getSafeDecryptedText(reference); // Use helper
            stringToCopy = decryptedValue ?? "";
        }
        Clipboard.setString(stringToCopy);
    }, [getSafeDecryptedText, userDetails?.reference]);

    const handleUploadError = useCallback((message: string) => {
        setErrormsg(message);
    }, []);

    const acceptedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];

    const verifyFileTypes = (fileList: any) => {
        const fileName = fileList;
        if (!hasAcceptedExtension(fileName)) {
            return false;
        }
        return true;
    };

    const hasAcceptedExtension = (fileName: string) => {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return acceptedExtensions.includes(extension);
    };

    const verifyFileSize = (fileSize: any) => {
        const maxSizeInBytes = 15 * 1024 * 1024; // 15MB
        return fileSize <= maxSizeInBytes;
    };

    const updateBusinessLogo = useCallback(async (logo: any) => {
        try {
            const response: any = await AuthService.updateBusinessLogo({ logo: logo })
            if (response.ok) {
                showAppToast(response?.data, 'success');
                setUploadedDocument(logo);
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        }
    }, []);

    const handleDocumentUpload = useCallback(async (pickerOption?: 'camera' | 'library') => {
        setUploadedDocument(null);
        setDocumentFileName("");
        setErrormsg(null);
        setIsUploading(true);

        try {
            const permissionResult =
                pickerOption === 'camera'
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
                return;
            }

            const result =
                pickerOption === 'camera'
                    ? await ImagePicker.launchCameraAsync({
                        allowsEditing: false,
                        aspect: [1, 1],
                        quality: 0.5,
                        cameraType: ImagePicker.CameraType.front,
                    })
                    : await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.All,
                        allowsEditing: false,
                        aspect: [1, 1],
                        quality: 0.5
                    });

            if (!result.canceled) {
                const selectedFile = result.assets[0];
                const { uri, type, fileSize } = selectedFile;

                const isValidSize = verifyFileSize(fileSize);
                if (!isValidSize) {
                    setErrormsg("File size should be less than 15MB");
                    return;
                }

                const fileName = selectedFile.fileName ?? uri.split('/').pop() ?? `document_${Date.now()}.jpg`;
                const fileExtension = getFileExtension(selectedFile.uri);
                const isValidFileType = verifyFileTypes(fileName);

                if (!isValidFileType) {
                    setErrormsg("Accepts only jpg, png, jpeg and pdf format");
                    return;
                }

                setDocumentFileName(fileName);

                if (uri) {
                    const formData = new FormData();
                    formData.append("document", {
                        uri: uri,
                        type: `${type}/${fileExtension}`,
                        name: fileName
                    } as any);

                    const uploadRes = await ProfileService.uploadFile(formData);
                    if (uploadRes.status === 200) {
                        const uploadedFile: any = Array.isArray(uploadRes.data) && uploadRes.data.length > 0
                            ? uploadRes.data[0]
                            : "";
                        updateBusinessLogo(uploadedFile);
                        setErrormsg("");
                    } else {
                        setErrormsg(isErrorDispaly(uploadRes));
                    }
                }
            }
        } catch (err) {
            setErrormsg(isErrorDispaly(err));
        } finally {
            setIsUploading(false);
        }
    }, [updateBusinessLogo]);

    const deleteUploadedDocument = useCallback(() => {
        setUploadedDocument(null);
        setDocumentFileName("");
        setErrormsg(null);
    }, []);
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>

            <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.PROFILE_INFO"} onBackPress={handleGobackNavigation} />
                {errormsg && <ErrorComponent message={errormsg} onClose={handleErrorMsg} />}
                <ScrollViewComponent>
                    <View style={[]} />

                    <View style={[commonStyles.alignCenter,]}>
                        <ProfileUpload onError={handleUploadError} />
                        <View style={[commonStyles.flex1]}>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.flexWrap]}>
                                {(userDetails?.accountType !== "Business") && (userDetails?.firstName != null && userDetails?.lastName != null) && <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.mb5]} numberOfLines={1} text={userDetails?.fullName ?? userDetails?.userName ?? userDetails?.firstName + " " + userDetails?.lastName} />}
                                {(userDetails?.accountType === "Business") && <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.mb5]} numberOfLines={1} text={`${userDetails?.businessName}`} />}
                            </View>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.flexWrap]}>
                                {(userDetails?.accountType === "Business") && <ParagraphComponent style={[commonStyles.sectionTitle]} numberOfLines={1} text={`(${userDetails?.accountType ?? ""})`} />}
                            </ViewComponent>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mxAuto, commonStyles.justifyCenter]}>
                                <ParagraphComponent
                                    text={userInfo?.customerState ?? ""}
                                    style={[commonStyles.colorstatus, commonStyles.textCenter, { color: userInfo?.customerState ? (statusColor[userInfo.customerState.toLowerCase()] ?? NEW_COLOR.TEXT_GREEN) : NEW_COLOR.TEXT_GREEN }]}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={[commonStyles.sectionGap]} />
                    <View style={[]}>
                        {userDetails?.isBusiness && <>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.p14]}>
                                <ParagraphComponent text={'Business'} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} />
                                <ParagraphComponent text={`${userDetails?.businessName}` || ""} style={[commonStyles.listprimarytext]} />
                            </View>
                            <View style={[commonStyles.listitemGap]} /></>
                        }
                        {userDetails?.accountType == "Business" &&
                            <View style={[commonStyles.sectionGap]}>
                                <View>
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} />
                                        <ParagraphComponent text={` ${getSafeDecryptedText(userDetails?.phoneCode)} ${getSafeDecryptedText(userDetails?.phoneNumber)} `} style={[commonStyles.listprimarytext]} />
                                    </View>
                                    <View style={[commonStyles.listitemGap]} />
                                </View>
                                <View>
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.EMAIL"} />
                                        <ParagraphComponent text={getSafeDecryptedText(userDetails?.email)} style={[commonStyles.listprimarytext]} />
                                    </View>
                                    <View style={[commonStyles.listitemGap]} />
                                </View>
                                <View>
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.INCORPORATION_COUNTRY"} />
                                        <ParagraphComponent text={userDetails?.idIssuranceCountry ?? userDetails?.country ?? ""} style={[commonStyles.listprimarytext]} />
                                    </View>
                                </View>
                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.INCORPORATION_DATE"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={formatDates(userDetails?.incorporationDate, dateFormates?.date) ?? ""} />
                                </View>

                                {/* File Upload Field for Business Account */}
                                <View style={[commonStyles.sectionGap]} />
                                <FileUpload
                                    fileLoader={isUploading}
                                    onSelectImage={(source) => handleDocumentUpload(source)}
                                    uploadedImageUri={uploadedDocument}
                                    fileName={documentFileName || t("GLOBAL_CONSTANTS.BUSINESS_LOGO")}
                                    errorMessage=""
                                    deleteImage={deleteUploadedDocument}
                                    label="GLOBAL_CONSTANTS.BUSINESS_LOGO"
                                    isRequired={false}
                                    showImageSourceSelector={true}
                                />
                            </View>}
                        {userDetails?.accountType != "Business" &&
                            <View>
                                <View>
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.EMAIL"} />
                                        <ParagraphComponent text={getSafeDecryptedText(userDetails?.email)} style={[commonStyles.listprimarytext]} />
                                    </View>
                                    <View style={[commonStyles.listitemGap]} />
                                </View>
                                <View>
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} />
                                        <ParagraphComponent text={` ${getSafeDecryptedText(userDetails?.phoneCode)} ${getSafeDecryptedText(userDetails?.phoneNumber)} `} style={[commonStyles.listprimarytext]} />
                                    </View>
                                    <View style={[commonStyles.listitemGap]} />
                                </View>
                                <View>
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.REF_ID_WITHOUT_COLON"} />
                                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.textCenter, commonStyles.gap4]}>
                                            <ParagraphComponent text={getSafeDecryptedText(userDetails?.reference)} style={[commonStyles.listprimarytext]} />
                                            <CopyCard onPress={handleCopyRef} copyIconColor={NEW_COLOR.TEXT_PRIMARY} />
                                        </View>
                                    </View>

                                    <View style={[commonStyles.listitemGap]} />
                                </View>
                                <View>
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FIRST_NAME"} />
                                        <ParagraphComponent text={userDetails?.firstName ?? ""} style={[commonStyles.listprimarytext]} />
                                    </View>
                                    <View style={[commonStyles.listitemGap]} />
                                </View>
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.LAST_NAME"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={userDetails?.lastName ?? ""} />
                                </View>
                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COUNTRY"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={userDetails?.country ?? userDetails?.countryOfResidence ?? ""} />
                                </View>
                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ACCOUNT_TYPE"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={userDetails?.accountType ?? ""} />
                                </View>
                            </View>}
                    </View>
                </ScrollViewComponent>
            </Container>
        </ViewComponent>
    );
};

export default PersonalInfo;
