import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ScrollView, Image, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { NEW_COLOR } from '../constants/theme/variables';
import { ms, s } from '../constants/theme/scale';
import Icons from '../assets/icons';
import ParagraphComponent from './Paragraph/Paragraph';
import { commonStyles } from './CommonStyles';
import AntDesign from "react-native-vector-icons/AntDesign";
import { useNavigation } from '@react-navigation/native';
import useEncryptDecrypt from '../hooks/useEncryption_Decryption';

interface DeafultListProps {
    changeModalVisible: (visible: boolean) => void;
    data: any[];
    setData: (selected: any) => void;
    selected: any;
    customBind: string[];
    modalTitle?: string;
    isPayeeAdd?: boolean;
    onPressAddPayee?: () => void;
}

const DeafultList: React.FC<DeafultListProps> = ({ changeModalVisible, data = [], setData, modalTitle, customBind, selected, onPressAddPayee, isPayeeAdd }) => {
    const [listData, setListData] = useState<any[]>([]);
    const [searchKey, setSearchKey] = useState<string>("");
    const navigation = useNavigation();
    const { decryptAES } = useEncryptDecrypt();

    useEffect(() => {
        renderList();
    }, [data]);

    const renderList = () => {
        const newList = data.map((item: any) => ({
            ...item,
            displayName: customBind
                ? customBind.map((property) => (item[property] ? item[property] : property)).join("")
                : item.name,
        }));
        setListData(newList);
    };

    const onPressItem = (option: any) => {
        changeModalVisible(false);
        setData(option);
    };

    const handleChangeSearch = (e: string) => {
        const value = e.trim();
        setSearchKey(value);
        if (value) {
            const filtered = data.filter((item: any) =>
                (item?.favoriteName || item.name)?.toLowerCase().includes(value.toLowerCase())
            );
            const newList = filtered.map((item: any) => ({
                ...item,
                displayName: customBind
                    ? customBind.map((property) => (item[property] ? item[property] : property)).join("")
                    : item.name,
            }));
            setListData(newList);
        } else {
            renderList();
        }
    };

    const backArrowButtonHandler = () => {
        changeModalVisible(false);
    };



    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView>
                <View style={[commonStyles.flex1, commonStyles.p24]}>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.mb43]}>
                        <TouchableOpacity onPress={backArrowButtonHandler} activeOpacity={0.8}>
                            <AntDesign
                                name="arrowleft"
                                size={22}
                                color={NEW_COLOR.TEXT_BLACK}
                                style={{ marginTop: 3 }}
                            />
                        </TouchableOpacity>
                        <ParagraphComponent
                            style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]}
                            text={modalTitle ? modalTitle : "Select"}
                        />
                    </View>
                    <View style={isPayeeAdd && [commonStyles.dflex, commonStyles.alignCenter]}>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                onChangeText={handleChangeSearch}
                                placeholder="Search"
                                placeholderTextColor={NEW_COLOR.PLACEHOLDER_STYLE}
                            />
                            <TouchableOpacity onPress={() => handleChangeSearch(searchKey)} style={styles.searchIconBg} activeOpacity={0.8}>
                                <AntDesign name="search1" size={16} style={styles.searchIcon} />
                            </TouchableOpacity>
                        </View>
                        {isPayeeAdd &&
                            <View >
                                <TouchableOpacity style={styles.addIconContainer} onPress={onPressAddPayee}>
                                    <AntDesign name="plus" size={s(24)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                                </TouchableOpacity>

                            </View>}
                    </View>
                    <View style={commonStyles.mb16} />
                    <View>
                        <FlatList
                            contentContainerStyle={{ gap: 10 }}
                            data={listData}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => onPressItem(item)}>
                                    <View style={[commonStyles.sectionStyle, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>

                                        <View style={styles.userBg}>
                                            <AntDesign name="user" size={s(24)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: s(2) }} />
                                        </View>
                                        <View>
                                            <ParagraphComponent
                                                text={decryptAES(item.favoriteName)}
                                                style={[commonStyles.textBlack, commonStyles.fs14, commonStyles.fw500, { flexShrink: 1 }]}
                                            />
                                            <ParagraphComponent
                                                text={`${item.currency || ""} - ${item.network || ""}`}
                                                style={[commonStyles.fs12, commonStyles.textGrey, { marginTop: s(4) }]}
                                                numberOfLines={1}
                                            />

                                            <ParagraphComponent
                                                text={`${item.displayName?.length > 20
                                                    ? `${item.displayName.slice(0, 8)}...${item.displayName.slice(-8)}`
                                                    : item.displayName || '--'

                                                    }`}
                                                style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw500, { flexShrink: 1, }]} numberOfLines={1}
                                            />
                                        </View>

                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={() => (
                                <View style={[styles.viewNodata, styles.containerHeight]}>
                                    <Image source={Icons.emptyList} style={{ width: 44, height: 44 }} />
                                    <ParagraphComponent
                                        text="No data"
                                        style={[styles.txtNodata, commonStyles.textBlack, commonStyles.fs16]}
                                    />
                                </View>
                            )}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DeafultList;

const styles = StyleSheet.create({
    searchContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        flexDirection: 'row',
        paddingHorizontal: ms(10),
        borderRadius: 10,
        backgroundColor: NEW_COLOR.BG_BLACK,
        borderColor: NEW_COLOR.SEARCH_BORDER,
        borderWidth: 1,
        height: 64,
        borderStyle: 'dashed',
        flex: 1,

    },
    searchInput: {
        paddingVertical: 1,
        height: s(70),
        color: NEW_COLOR.TEXT_BLACK,
        flex: 1,
        fontSize: 24
    },
    searchIconBg: {
        borderRadius: 100,
        backgroundColor: NEW_COLOR.MENU_CARD_BG,
        height: 36,
        width: 36,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center"
    },
    searchIcon: {
        color: NEW_COLOR.TEXT_BLACK,
    },

    viewNodata: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    txtNodata: {
        marginTop: 20,
    },
    containerHeight: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 80
    }, userBg: {
        backgroundColor: NEW_COLOR.USER_ICON_BG,
        height: s(42),
        width: s(42),
        borderRadius: s(42) / 2,
        justifyContent: "center",
        alignItems: "center",
    }, addIconContainer: {
        backgroundColor: NEW_COLOR.BG_BLACK,
        borderRadius: s(108),
        height: s(48),
        width: s(48),
        marginLeft: s(12),
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: NEW_COLOR.SEARCH_BORDER,
    },
});