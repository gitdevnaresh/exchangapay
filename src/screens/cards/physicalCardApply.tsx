import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { commonStyles } from "../../components/CommonStyles"
import { NEW_COLOR } from "../../constants/theme/variables"
import LabelComponent from "../../components/Paragraph/label"
import { StyleSheet } from "react-native"
import { ms } from "../../constants/theme/scale"
import { Field } from "formik"
import { CREATE_KYC_ADDRESS_CONST, FeePhysicalCardApplyProps, FORM_DATA_LABEL, FORM_DATA_PLACEHOLDER } from "./constant"
import ParagraphComponent from "../../components/Paragraph/Paragraph"
import { useState } from "react"
import { launchImageLibrary } from "react-native-image-picker"
import ProfileService from "../../services/profile"
import { isErrorDispaly } from "../../utils/helpers"
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from 'react-native-vector-icons/Feather';
import InputDefault from '../../components/DefaultFiat'


const FeePhysicalCardApply: React.FC<FeePhysicalCardApplyProps> = ({ envelopeNoRequired, needPhotoForActiveCard, additionalDocforActiveCard, handleBlur, values, setFieldValue, handleChange, touched, errors, loading }) => {
    const [errormsg, setErrormsg] = useState<string>('');
    const [loadingState, setLoadingState] = useState<{ handHoldingIdPhoto: boolean }>({
        handHoldingIdPhoto: false,
    })
    const fileLoader = false;
    const hasAcceptedExtension = (fileName: string) => {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return acceptedExtensions.includes(extension);
    };
    const verifyFileSize = (fileSize: any) => {
        const maxSizeInBytes = 20 * 1024 * 1024;
        return fileSize <= maxSizeInBytes;
    };
    const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
    const verifyFileTypes = (fileList) => {
        const fileName = fileList;
        if (!hasAcceptedExtension(fileName)) {
            return false;
        }

        return true;
    };

    const selectImage = async (fieldName: any) => {
        try {
            setErrormsg("");
            setLoadingState((prevState) => ({
                ...prevState,
                [fieldName]: true,
            }));
            const result = await launchImageLibrary({ mediaType: 'photo' });

            if (!result.didCancel && result.assets && result.assets.length > 0) {
                const isValid = verifyFileTypes(result.assets[0].fileName);
                const isValidSize = verifyFileSize(result.assets[0].fileSize);

                if (isValid && isValidSize) {
                    let formData = new FormData();
                    formData.append('document', {
                        uri: result.assets[0].uri,
                        type: result.assets[0].type,
                        name: result.assets[0].fileName,
                    });

                    const uploadRes = await ProfileService.uploadFile(formData);

                    if (uploadRes.status === 200) {
                        const imageUrl = uploadRes?.data?.[0] || "";
                        setFieldValue(fieldName, imageUrl);
                        setErrormsg("");
                    } else {
                        setErrormsg(isErrorDispaly(uploadRes));
                    }
                } else {
                    if (!isValid) {
                        setErrormsg(CREATE_KYC_ADDRESS_CONST.ACCEPTS_ONLY_JPG_OR_PNG_FORMATE);
                    } else if (!isValidSize) {
                        setErrormsg(CREATE_KYC_ADDRESS_CONST.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB);
                    }
                }
            }
        } catch (err) {
            setErrormsg(isErrorDispaly(err));
        } finally {
            setLoadingState((prevState) => ({
                ...prevState,
                [fieldName]: false,
            }));
        }
    };
    return (

        <SafeAreaView>
            <ScrollView>
                <View>
                    <LabelComponent
                        text={"Link Card Number"}
                        Children={<LabelComponent text=" *" style={commonStyles.textError} />}
                        style={[commonStyles.fs12, commonStyles.fw500, NEW_COLOR.TEXT_LABEL]} />
                    <TextInput
                        style={[styles.inputStyle, commonStyles.flex1, { backgroundColor: loading ? NEW_COLOR.DISABLED_INPUTBG : NEW_COLOR.SCREENBG_WHITE }]}
                        placeholder={"Link Card Number"}
                        onChangeText={handleChange("cardNumber")}
                        onBlur={handleBlur("cardNumber")}
                        value={values.cardNumber}
                        keyboardType={"phone-pad"}
                        maxLength={16}
                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_STYLE}
                        multiline={false}
                    />
                    {(errors.cardNumber) && <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textError, { marginTop: 2 }]} text={(errors.cardNumber)} />}


                    {envelopeNoRequired && (<View style={[commonStyles.mt16]}>
                        <Field
                            touched={touched.envelopenumber}
                            name={"envelopenumber"}
                            label={"Envelope Number"}
                            error={errors.envelopenumber}
                            handleBlur={handleBlur}
                            customContainerStyle={{}}
                            placeholder={"Envelope Number"}
                            component={InputDefault}
                            maxLength={20}
                            Children={
                                <LabelComponent
                                    text=" *"
                                    style={commonStyles.textError}
                                />
                            }

                        />
                    </View>)}

                    <View style={[commonStyles.mb16]} />
                    {additionalDocforActiveCard !== null && (<View>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={() => selectImage('handHoldingIdPhoto')}
                        >
                            <View >
                                <LabelComponent
                                    text={`${additionalDocforActiveCard} (20 MB)`}
                                    Children={
                                        <LabelComponent
                                            text=" *"
                                            style={commonStyles.textError}
                                        />
                                    }
                                />
                                <View style={styles.SelectStyle}>
                                    <Ionicons
                                        name="cloud-upload-outline"
                                        size={22}
                                        color={NEW_COLOR.TEXT_BLACK}
                                    />
                                    <ParagraphComponent
                                        style={[
                                            commonStyles.fs16,
                                            commonStyles.textBlack,
                                            commonStyles.fw500,
                                        ]}
                                        text={FORM_DATA_LABEL.UPLOAD_YOUR_HAND_HOLD_ID_PHOTO}
                                        numberOfLines={1}
                                    />


                                </View>

                            </View>
                        </TouchableOpacity>
                        <View style={[commonStyles.mb16]} />

                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {fileLoader &&
                                <View
                                    style={[
                                        commonStyles.dflex,
                                        commonStyles.alignCenter,
                                        commonStyles.justifyCenter,
                                        { minHeight: 150 },
                                    ]}
                                >
                                    <ActivityIndicator
                                        size="large"
                                        color="#0000ff"
                                    />
                                </View>
                            }
                            {(values.handHoldingIdPhoto) && !loadingState?.handHoldingIdPhoto && (
                                <View style={[styles.passport,]}>
                                    <Image
                                        style={{ borderRadius: 16, flex: 1, }}
                                        overlayColor="#fff"
                                        resizeMode="contain"
                                        source={{ uri: values.handHoldingIdPhoto }}
                                    />
                                </View>
                            )}
                            {!(values.handHoldingIdPhoto) && !loadingState?.handHoldingIdPhoto && (

                                <View style={[styles.passport, { backgroundColor: "#F6FCFE" }]}>
                                    <Image
                                        style={[commonStyles.mxAuto, { borderRadius: 16, flex: 1, width: "100%" }]}
                                        overlayColor="transparent"
                                        resizeMode="contain"
                                        source={require("../../assets/images/cards/passportholding.png")}
                                    />
                                </View>
                            )}
                        </View>
                        {errors.handHoldingIdPhoto && (
                            <ParagraphComponent
                                style={[
                                    commonStyles.fs14,
                                    commonStyles.fw400,
                                    commonStyles.textError,
                                    { marginTop: 4 },
                                ]}
                                text={errors.handHoldingIdPhoto}
                            />
                        )}
                        <View style={[commonStyles.mb24]} />
                        <View style={[commonStyles.sectionStyle, styles.bgBlue]}>
                            <View
                                style={[
                                    commonStyles.dflex,
                                    commonStyles.gap8,
                                    commonStyles.mb8,
                                ]}
                            >
                                <Feather
                                    name="info"
                                    size={14}
                                    style={{ marginTop: 4 }}
                                    color={NEW_COLOR.TEXT_BLACK}
                                />
                                <View style={[commonStyles.flex1]}>
                                    <ParagraphComponent
                                        style={[
                                            commonStyles.fs12,
                                            commonStyles.textBlack,
                                            commonStyles.fw400,
                                            commonStyles.mb4
                                        ]}
                                        text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE1}
                                    />
                                    <ParagraphComponent
                                        style={[
                                            commonStyles.fs12,
                                            commonStyles.textBlack,
                                            commonStyles.fw400,
                                        ]}
                                        text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE2}
                                    />
                                </View>
                            </View>

                        </View>

                    </View>)}

                </View>

            </ScrollView>

        </SafeAreaView>

    )
}
export default FeePhysicalCardApply;
const styles = StyleSheet.create({
    bgBlue: {
        padding: 16,
        backgroundColor: NEW_COLOR.BG_BLUE,
        borderRadius: 16,
    },
    inputStyle: {
        borderColor: NEW_COLOR.SEARCH_BORDER,
        backgroundColor: NEW_COLOR.SCREENBG_WHITE,
        borderWidth: 1,
        borderRadius: 8,
        height: 46,
        fontSize: ms(14),
        fontWeight: "400",
        color: NEW_COLOR.TEXT_BLACK,
        paddingLeft: 14,
        paddingRight: 16,
        flex: 1,
        multiline: false,
        textAlignVertical: 'center',
    },
    SelectStyle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: NEW_COLOR.BORDER_GREY,
        marginBottom: 6,
        gap: 9, minHeight: 54, backgroundColor: NEW_COLOR.SECTION_BG,
    },
    passport: { width: '100%', borderRadius: 16, height: 250, borderWidth: 1, borderColor: NEW_COLOR.BORDER_LIGHT, overflow: "hidden" },


})