import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { isErrorDispaly } from '../../../../utils/helpers';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';
import FlatListComponent from '../../../../newComponents/flatList/flatList';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { MainStackParamList } from '../../profileTypes';
import ViewComponent from '../../../../newComponents/view/view';
import { s } from '../../../../constants/theme/scale';
import Container from '../../../../newComponents/container/container';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import OnboardingService from '../../../../services/onboarding';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import Feather from "@expo/vector-icons/Feather";
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS, PROFILE_URLS } from '../../../../assets/blobUrls';
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { FormattedDateText } from '../../../../newComponents/textComponets/dateTimeText/dateTimeText';

interface Device {
    createdDate: string;
    current: boolean;
    id: string;
    impersonated: boolean | string;
    ipAddress: string;
    userAgent: string;
}

const DeviceItemSeparator = React.memo(() => {
    return <ViewComponent style={{ marginBottom: s(12) }} />;
});

const DevicesList = React.memo(() => {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const isFocused = useIsFocused();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const { t } = useLngTranslation();
    const [error, setError] = useState<string>("");

    useHardwareBackHandler(() => {
        handleGoBack();
        return true;
    });

    useEffect(() => {
        if (isFocused) {
            setError("");
            fetchDevices();
        }
    }, [isFocused]);

    const handleRefresh = () => fetchDevices();

    const handleGoBack = () => navigation.goBack();

    const fetchDevices = async () => {
        setError("");
        setLoading(true);
        try {

            const res: any = await OnboardingService.getAllConnectedDevices();
            if (res.status == 200) {
                setDevices(res.data ?? []);
            } else {
                setError(isErrorDispaly(res));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDevice = async (item: Device) => {
        setBtnLoading(true);
        try {
            const response = await OnboardingService.removeDevice(item.id);
            if (response?.ok) {
                showAppToast(t("GLOBAL_CONSTANTS.DEVICE_REMOVED_SUCCESSFULLY"), "success");
                await fetchDevices();
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
        setBtnLoading(false);
    };

    const renderDeviceItem = ({ item }: { item: Device }) => {
        return (
            <ViewComponent style={[commonStyles.devicesbg]}>
                <ViewComponent style={[commonStyles.dflex,commonStyles.alignStart]}>
                    <ViewComponent style={[commonStyles.dflex,commonStyles.gap16,commonStyles.alignStart]}>
                        <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                            <ImageUri uri={PROFILE_URLS.devices} height={s(18)} width={s(18)} />
                        </ViewComponent>
                        <ViewComponent>
                            <ParagraphComponent
                                text={item.userAgent}
                                style={[commonStyles.devicesprimarytext, commonStyles.mb2,{width:s(270)}]}
                            />
                            <ViewComponent>
                                <ParagraphComponent
                                    text={'current'}
                                    style={[commonStyles.fs12, commonStyles.textGreen, commonStyles.fw400, commonStyles.mb2]}
                                    numberOfLines={1}
                                />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                                <ParagraphComponent
                                    text={"Time:"}
                                    style={[commonStyles.devicessecondarytext]}
                                    numberOfLines={1}
                                />
                                <FormattedDateText
                                    value={item.createdDate}
                                    style={[commonStyles.devicessecondarytext]}
                                    // numberOfLines={1}
                                />
                                {/* <ParagraphComponent
                                    text={"18:27:09"}
                                    style={[commonStyles.devicessecondarytext]}
                                    numberOfLines={1}
                                /> */}

                            </ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                                <ParagraphComponent
                                    text={"Location:"}
                                    style={[commonStyles.devicessecondarytext]}
                                    numberOfLines={1}
                                />
                                {/* <ParagraphComponent
                                    text={}
                                    style={[commonStyles.devicessecondarytext]}
                                    numberOfLines={1}
                                /> */}

                            </ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                                <ParagraphComponent
                                    text={"IP Address:"}
                                    style={[commonStyles.devicessecondarytext]}
                                    numberOfLines={1}
                                />
                                <ParagraphComponent
                                    text={item.ipAddress}
                                    style={[commonStyles.devicessecondarytext]}
                                    numberOfLines={1}
                                />

                            </ViewComponent>
                        </ViewComponent>



                    </ViewComponent>

                    <ViewComponent>
                        <TouchableOpacity onPress={() => handleRemoveDevice(item)}>
                            {!btnLoading ? (
                                <Feather name="trash-2" size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                            ) : (
                                <ActivityIndicator size="small" color={NEW_COLOR.TEXT_WHITE} />
                            )}
                        </TouchableOpacity>
                    </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
        );
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader
                    title={'GLOBAL_CONSTANTS.CONNECTED_DEVICES'}
                    onBackPress={handleGoBack}
                    onRefresh={handleRefresh}
                    isrefresh={true}
                />
 {loading && (
                    <SwokipayDashboardLoader />
                )}
                {!loading  &&(<ViewComponent>
                {error && <ErrorComponent message={error} screen={true} />}

                <ViewComponent style={[commonStyles.dflex, commonStyles.titleSectionGap, commonStyles.gap10]}>
                    <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.IF_YOU_DETECT_ANYUNSUAL_ACTIVITY"} style={[commonStyles.notetext, commonStyles.flex1]} />
                </ViewComponent>
               
                
                    <FlatListComponent
                        data={devices}
                        renderItem={renderDeviceItem}
                        keyExtractor={(item: Device) => item.id}
                        ItemSeparatorComponent={DeviceItemSeparator}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
               
                </ViewComponent> )}
            </Container>
        </ViewComponent>
    );
});

export default DevicesList;
