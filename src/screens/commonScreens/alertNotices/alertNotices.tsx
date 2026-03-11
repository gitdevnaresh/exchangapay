import React, { useEffect, useState } from 'react';
import {ScrollView, useWindowDimensions, Dimensions } from 'react-native';
import OnboardingService from '../../../services/onboarding'; // Assuming correct path
import ButtonComponent from '../../../newComponents/buttons/button';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import RenderHTML from 'react-native-render-html';
import CustomOverlay from '../../../newComponents/models/commonOverlay';
import NoDataComponent from '../../../newComponents/noData/noData';
import { useIsFocused } from '@react-navigation/native';
import ViewComponent from '../../../newComponents/view/view';
import { s } from '../../../newComponents/theme/scale';
import { useSelector } from 'react-redux';

interface Notify {
    id: string | null;
    tittle: string | null;
    content: string | null;
}

const NotifyAlerts = React.memo(() => {
    const { width } = useWindowDimensions();
    const safeWidth = width || Dimensions.get('window').width;
    const [notifyList, setNotifyList] = useState<Notify[]>([]);
    const [currentNotifyIndex, setCurrentNotifyIndex] = useState(0);
    const NEW_COLOR = useThemeColors(true); // Using reversed colors for the modal content
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isVisible, setIsVisible] = useState(false);
    const [overlayKey, setOverlayKey] = useState(0);
    const isFocused = useIsFocused();
    const userInfo=useSelector((state:any)=>state.userReducer?.userDetails);
    useEffect(() => {
        if (isFocused) {
            getNotifies();
        }
    }, [isFocused,userInfo?.isKYC]);
    const handleClose = () => {
        setIsVisible(false);
    };

    const getNotifies = async () => {
        try {
            const response: any = await OnboardingService.notifyAlert();
            if (response?.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
                setNotifyList(response.data);
                setCurrentNotifyIndex(0);
                // Force re-render and add delay for proper positioning
                setOverlayKey(prev => prev + 1);
                setTimeout(() => {
                    setIsVisible(true);
                }, 100);
               
            } else {
                // Don't show popup if no data or API failed
                setNotifyList([]);
            }
        } catch{
            setNotifyList([]);
        }
    };

    const verifiedNotify = async (notifyId: string) => {
        try {
            const notifyObj = { "NoteIds": [notifyId] };
            await OnboardingService.noticeViewed(notifyObj);
        } catch (err: any) {
            handleClose();
            throw err;
        }
    };

    const handleNextNotify = async (notifyId: string) => {
        try {
            await verifiedNotify(notifyId);
            if (currentNotifyIndex < notifyList.length - 1) {
                setCurrentNotifyIndex(currentNotifyIndex + 1);
            } else {
                handleClose();
            }
        } catch (error) {
            handleClose();
        }
    };

    const currentNotify = notifyList.length > 0 ? notifyList[currentNotifyIndex] : null;
    return (
        <CustomOverlay
            key={overlayKey}
            isVisible={isVisible}
            crossIcon={false}
            overlayStyle={{
                width: safeWidth - 50,
                maxHeight: Dimensions.get('window').height - 100
            }}
        >
            {currentNotify && (

                <ViewComponent style={[commonStyles.p24]}>
                    <ScrollView >
                        {currentNotify.content ? (
                            <RenderHTML
                                contentWidth={safeWidth - 60}
                                source={{ html: currentNotify.content }}
                                tagsStyles={{ body: { color: NEW_COLOR.TEXT_WHITE } }}
                            />
                        ) : (
                            <NoDataComponent />
                        )}
                    </ScrollView>

                    <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt16,commonStyles.mb16]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.OKEY"}
                              capitalizeTitle={false}
                            onPress={() => handleNextNotify(currentNotify.id!)}
                            customContainerStyle={[commonStyles.bg_yellow, commonStyles.rounded100, { height: s(60), width: s(250) }]}
                        />
                    </ViewComponent>
                 </ViewComponent>
            )}
        </CustomOverlay>
    );
});

export default NotifyAlerts;