import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { NEW_COLOR } from '../constants/theme/variables';
import { ms, s } from '../constants/theme/scale';
import { TextInput } from 'react-native-gesture-handler';
import Icons from '../assets/icons';
import ParagraphComponent from './Paragraph/Paragraph';
import { commonStyles } from './CommonStyles';
import AntDesign from "react-native-vector-icons/AntDesign";
import { SvgUri } from 'react-native-svg';

interface PickerProps {
  changeModalVisible: any,
  data: any;
  setData: any;
  selected: any;
  customBind: Array<string>;
  modalTitle?: any;
}


const Picker = ({ changeModalVisible, data = [], setData, modalTitle, customBind }: PickerProps) => {
  const [countryList, setCountryList] = useState<any>([]);
  const [searchKey, setSearchKey] = useState<string>("");
  useEffect(() => {
    renderList();
  }, []);
  const renderList = () => {
    let listInfo = [...data];
    const listData = listInfo.map((item: any) => ({ ...item, displayName: (customBind ? customBind.map((property) => (item[property] ? item[property] : property)).join("") : item.name) }))
    setCountryList([...listData]);
  }
  const onPressItem = (option: any) => {
    changeModalVisible(false);
    setData(option);
  };
  const backArrowButtonHandler = () => {
    changeModalVisible(false);
  }


  const handleChangeSearch = (e: any) => {
    let value = e;
    if (typeof value === 'string') {
      value = value.trim();
      setSearchKey(value);
    }
    if (value && typeof value === 'string') {
      const filterData = data.filter((item: any) => {
        return (item.name?.toLowerCase().includes(value.toLowerCase()) || item?.code?.toLowerCase().includes(value.toLowerCase()));
      });
      const listData = filterData.map((item: any) => ({
        ...item,
        displayName: customBind
          ? customBind.map((property) => (item[property] ? item[property] : property)).join("")
          : item.name,
      }));
      setCountryList([...listData]);
    } else {
      const listData = data.map((item: any) => ({
        ...item,
        displayName: customBind
          ? customBind.map((property) => (item[property] ? item[property] : property)).join("")
          : item.name,
      }));
      setCountryList([...listData]);
    }
  };

  const SearchBoxComponent = (
    <View>
      <View style={styles.searchContainer}>

        <TextInput
          style={styles.searchInput}
          onChangeText={(val) => handleChangeSearch(val)}
          placeholder={'Search'}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_STYLE}
        />
        <TouchableOpacity onPress={(val) => handleChangeSearch(searchKey)} style={[styles.searchIconBg]} activeOpacity={0.8}>
          <AntDesign name="search1" size={16} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (

    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>

      <View style={[commonStyles.flex1, commonStyles.p24]}>

        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.mb43]}>
          <TouchableOpacity onPress={backArrowButtonHandler} activeOpacity={0.8}>
            <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
          </TouchableOpacity>
          <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800,]} text={`${modalTitle ? modalTitle : "Select"}`} />
        </View>
        <View >{SearchBoxComponent}</View>
        <View style={[commonStyles.mb16]} />
        <View >
          <FlatList
            contentContainerStyle={{ gap: 10, paddingBottom: 150 }}
            data={countryList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onPressItem(item)}>
                <View style={[styles.option, commonStyles.sectionStyle, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8,]}>
                  {item?.flag && <Image style={[{ width: s(30), height: s(30), borderRadius: s(30) / 2 },]} source={{ uri: item?.flag }} />}
                  {item?.logo && <SvgUri uri={item.logo} style={[{ width: s(30), height: s(30), borderRadius: s(30) / 2 },]} />}
                  <ParagraphComponent text={(item?.displayName || item?.name)} style={[commonStyles.textBlack, commonStyles.fs14, commonStyles.fw500, { flexShrink: 1 },]} />
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={() => <View style={[styles.viewNodata, styles.containerHeight]}  >
              <Image source={Icons.emptyList} style={{ width: 44, height: 44 }} />
              <ParagraphComponent text={"No data"} style={[styles.txtNodata, commonStyles.textBlack, commonStyles.fs16]} />
            </View>}
          />
        </View>
      </View>

    </SafeAreaView>
  );
};
export { Picker };

const styles = StyleSheet.create({
  searchIconBg: {
    borderRadius: 100, backgroundColor: NEW_COLOR.MENU_CARD_BG,
    height: 36, width: 36, flexDirection: 'row', alignItems: "center", justifyContent: "center"
  },
  option: {
    // paddingTop:20,
    // paddingBottom: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: NEW_COLOR.BORDER_LIGHT,
    // borderStyle:'dashed'
  },
  viewNodata: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ml15: {
    marginLeft: 15,
  },
  mb12: {
    marginBottom: 12,
  },
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
    borderStyle: 'dashed'
  },
  searchInput: {
    position: 'relative',
    zIndex: 2,
    paddingVertical: 1, height: s(70),
    color: NEW_COLOR.TEXT_BLACK, flex: 1, fontSize: 24
  },
  searchIcon: {
    color: NEW_COLOR.TEXT_BLACK,
  },
  modal: {
    paddingVertical: 0, flex: 1
    // NEW_COLOR.SCREENBG_WHITE
  },
  container: {
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
    flex: 1,
  },
  txtNodata: {
    marginTop: 20,
  },
  containerHeight: {
    justifyContent: "center", alignItems: "center", marginTop: 80
  },
  list__container: {
    height: "100%", flex: 1,
    width: "100%",
  },

});