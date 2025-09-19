import React from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import { commonStyles } from '../../components/CommonStyles';
import { Container } from '../../components';
import DefaultButton from '../../components/DefaultButton';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { NEW_COLOR, WINDOW_HEIGHT } from '../../constants/theme/variables';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FeedbackSuccess = (props: any) => {

    const handleBackToHome = () => {
        props.navigation.navigate("Dashboard", {
        })

    };

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView>
                <Container style={[commonStyles.container, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.flex1, { height: WINDOW_HEIGHT / 1.2 }]}>
                    <View>
                        <Ionicons name="checkmark-circle" style={[commonStyles.mxAuto]} size={100} color={NEW_COLOR.TEXT_GREEN} />
                        <View style={[commonStyles.mb10,]} />
                        <ParagraphComponent text={`Feedback Submitted!`} style={[commonStyles.fs20, commonStyles.fw600, commonStyles.textCenter, commonStyles.textBlack]} />
                        <ParagraphComponent text={`Thank you for your feedback! We appreciate your input and will use it to improve our services.`} style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw500, commonStyles.textCenter]} />
                        <View style={[commonStyles.mb43,]} />
                        <View style={[commonStyles.mb43,]} />
                        <DefaultButton
                            title='Back TO Home'
                            style={undefined}
                            onPress={handleBackToHome}
                            iconArrowRight={false}
                            iconCheck={true}
                        />
                    </View>

                </Container>
            </ScrollView>
        </SafeAreaView>
    );
};

export default FeedbackSuccess;
