import React, { useState } from 'react';
import { View, Image, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Container, Text } from "../../components";
import DefaultButton from '../../components/DefaultButton';
import { useNavigation } from '@react-navigation/native';
import useLogout from '../../hooks/useLogOut';
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { WINDOW_HEIGHT } from '../../constants/theme/variables';
import { EMAIL_CONSTANTS } from './constants';

const CompleteKyc: React.FC = () => {
    const navigation = useNavigation<any>();
    const { logout } = useLogout();
    const [isContinueLoad, setIsContinueLoad] = useState<boolean>(false)

    const handleContinue = () => {
        setIsContinueLoad(true)
        navigation.navigate('addKycInfomation', {
            screenName: "splash_Screen"
        });
        setIsContinueLoad(false)
    };

    const handleLogout = async () => {
        await logout();

    };

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <ScrollView >
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.flex1, { height: WINDOW_HEIGHT * 0.8 }]}>
                        <View style={{ width: "100%" }}>

                            <Image style={[commonStyles.mxAuto, commonStyles.mb16]} source={require("../../assets/images/kycimgage.png")} />
                            <ParagraphComponent text={"Click here to complete KYC"} style={[commonStyles.fs20, commonStyles.textBlack, commonStyles.fw600, commonStyles.mb24, commonStyles.textCenter]} />
                            <DefaultButton
                                title={"Continue"}
                                icon={undefined}
                                onPress={handleContinue}
                                style={undefined}
                                customContainerStyle={undefined}
                                backgroundColors={undefined}
                                disable={isContinueLoad}
                                loading={isContinueLoad}
                                colorful={undefined}
                                iconArrowRight={false}

                                transparent={undefined}
                            />
                            <View style={[commonStyles.mb24]} />
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                <TouchableOpacity onPress={handleLogout} style={[commonStyles.px10]} ><Text style={[commonStyles.textCenter, commonStyles.textOrange, commonStyles.fs16, commonStyles.fw600]}>{EMAIL_CONSTANTS.LOG_OUT}</Text></TouchableOpacity>
                            </View>

                        </View>
                    </View>

                </ScrollView>
            </Container>
        </SafeAreaView>
    );
};

export default CompleteKyc;
