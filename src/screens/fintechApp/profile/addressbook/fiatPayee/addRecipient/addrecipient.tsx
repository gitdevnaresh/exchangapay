import React, { useCallback } from "react";
import { View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { StyleService } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ADD_RECIPIENT } from './constant';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import Container from '../../../../../../components/container/container';
import { ADD_BOOK_CONST } from '../../constants';
import { s } from '../../../../../../constants/styels/scale';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';

const AddRecipient = React.memo((props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = screenStyles(NEW_COLOR);
    const navigation = useNavigation<any>()

    const handleBackArrow = useCallback(() => {
        navigation?.navigate("Addressbook");
    }, [navigation]);

    const handleAccountDetails = useCallback(() => {
        props.navigation.push("AccountDetails", {
            walletCode: props?.route?.params?.walletCode,
            logo: props?.route?.params?.logo,
            accountType: ADD_RECIPIENT.PERSIONAL
        })
    }, [props.navigation, props?.route?.params]);

    const handleBusinessAccountSwift = useCallback(() => {
        props.navigation.push("AccountDetails", {
            walletCode: props?.route?.params?.walletCode,
            logo: props?.route?.params?.logo,
            accountType: ADD_RECIPIENT.BUSINESS

        })
    }, [props.navigation, props?.route?.params]);
    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader title={ADD_BOOK_CONST.ADD_PAYEE} onBackPress={handleBackArrow} />
                <ScrollView>
                    <View >
                        <TouchableOpacity style={[commonStyles.p16]} onPress={handleAccountDetails} activeOpacity={0.9} >
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, styles.circle]}>
                                    <AntDesign name='user' size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                </View>
                                <View style={[commonStyles.flex1]}>
                                    <View style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent,]}>
                                        <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} text={ADD_RECIPIENT.MY_SELF} />
                                        <SimpleLineIcons name='arrow-right' size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                                    </View>

                                </View>
                            </View>

                        </TouchableOpacity>
                        <View style={[commonStyles.hLine]} />
                        <TouchableOpacity style={[commonStyles.p16]} onPress={handleBusinessAccountSwift} activeOpacity={0.9} >
                            <View style={[commonStyles.dflex, commonStyles.gap10,]}>
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, styles.circle]}>
                                    <SimpleLineIcons name='briefcase' size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                </View>
                                <View style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent]}>
                                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} text={ADD_RECIPIENT.A_BUSINESS_ORGANISATION} />
                                    <SimpleLineIcons name='arrow-right' size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </Container>
        </SafeAreaView>
    )
});

export default AddRecipient;

const screenStyles = (NEW_COLOR: any) => StyleService.create({
    circle: {
        height: s(44),
        width: s(44),
        borderRadius: s(44) / 2,
        backgroundColor: NEW_COLOR.ACTIVE_ITEM,
        borderWidth: 1, borderColor: NEW_COLOR.INPUT_BORDER
    },
});