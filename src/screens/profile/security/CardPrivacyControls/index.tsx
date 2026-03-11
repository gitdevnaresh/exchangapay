import React, { useEffect, useState, useCallback } from 'react';
import ProfileService from '../../../../services/profile';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { CardPrivacyControlOption, CardPrivacyControlResponse } from './interfaces';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { CardOptionSkeleton } from '../../skeltons';
import Loadding from '../../../commonScreens/skeltons';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import ViewComponent from '../../../../newComponents/view/view';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../profileTypes';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../../utils/helpers';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
// --- Add logging hook import ---
import { useActionLogging, ActionLogParams } from '../../../../hooks/loggingHook';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import { s } from '../../../../constants/theme/scale';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS, PROFILE_URLS } from '../../../../assets/blobUrls';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';

const CardPrivacyControls: React.FC = () => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cardOptions, setCardOptions] = useState<CardPrivacyControlOption[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useLngTranslation();
  const { logEvent } = useActionLogging();
  const isFocused =useIsFocused();
  const [error,setError]=useState<string>("");


  useHardwareBackHandler(() => {
    handleBackpress();

  })
  useEffect(() => {
    fetchPrivacyControl();
  }, [isFocused]);
  const fetchPrivacyControl = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const response = await ProfileService.getCardprivacyControll() as CardPrivacyControlResponse;
      if (response?.ok) {
        const options = (response.data as CardPrivacyControlOption[]).map((item, idx) => ({
          key: item.key || String(idx),
          type: item.type,
          title: item.title || item.type,
          description: item.description,
          isEnabled: item.isEnabled ?? true,
          method: item?.method,
        }));
        setCardOptions(options);

        if (response.data.selectedOption) {
          setSelectedType(response.data.selectedOption);
        } else {
          const firstEnabled = options.find(opt => opt.isEnabled);
          if (firstEnabled) setSelectedType(firstEnabled.type);
        }
      }
      else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  }, []);



  // --- Log option select (not API) ---
  const handleSelect = async (type: string) => {
    setError("");
    const params: ActionLogParams = {
      screename: 'CardPrivacyControls',
      actionName: `Select Card Privacy Option: ${type}`,
      actionType: 'Button',
    };
    logEvent('button_press', params);
    setSelectedType(type);
    try {
      const response = await ProfileService.updateCardprivacyControllType(type);
      if (response?.ok) {
        fetchPrivacyControl();
        showAppToast(t('GLOBAL_CONSTANTS.CARD_PRIVACY_UPDATE_SUCCESS'), 'success');
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    }
  };

  // --- Log back press ---
  const handleBackpress = () => {
    const params: ActionLogParams = {
      screename: 'CardPrivacyControls',
      actionName: 'Back Press',
      actionType: 'Button',
      nextScreenName: 'advanced methods',
    };
    logEvent('navigation_action', params);
    navigation.goBack();
  };

  // --- Log info box view (on mount) ---
  useEffect(() => {
    const params: ActionLogParams = {
      screename: 'CardPrivacyControls',
      actionName: 'View Card Privacy Info Box',
      actionType: 'InfoBox',
    };
    logEvent('info_box_view', params);
  }, [logEvent]);

  const skeletonCount = cardOptions.length > 0 ? cardOptions.length : 2;
  const skeletons = Array.from({ length: skeletonCount }, () =>
    CardOptionSkeleton(NEW_COLOR, commonStyles)
  );
  const renderOption = ({ item, index }: { item: CardPrivacyControlOption; index: number }) => {
    const isSelected = selectedType === item.type;
    return (
      <CommonTouchableOpacity
        key={item.key}
        onPress={() => handleSelect(item.method)}
        activeOpacity={0.9}
        style={[
          commonStyles.rounded12,
          index === 0 ? commonStyles.menuitemspace : null,
          commonStyles.cardBg,
          commonStyles.p8,
          commonStyles.dflex,
          commonStyles.alignCenter,
          { flexDirection: 'row', borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER }
        ]}
      >
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(44), height: s(44), borderRadius: s(22), backgroundColor: NEW_COLOR.CIRCLE_BG }]}>
          {item.method === 'Biometric' ? (
            <ImageUri uri={PROFILE_URLS.fingerPringLogo} height={s(18)} width={s(18)} />
          ) : item.method === 'Identity' ? (
            <ImageUri uri={PROFILE_URLS.IdentityVerify} height={s(18)} width={s(18)} />
          ) : (
            <SimpleLineIcons name="settings" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
          )}
        </ViewComponent>

        {/* Middle: title & description */}
        <ViewComponent style={[commonStyles.ml16, { flex: 1, marginRight: s(36) }]}>
          <ParagraphComponent
            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.mb6]}
            numberOfLines={1}
            text={item.title}
          />
          <ParagraphComponent
            style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw400]}
            text={item.description}
          />
        </ViewComponent>

        {/* Right: selection indicator */}
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter]}>
          {isSelected ? (
            <ViewComponent style={commonStyles.radioDot}>
              <Ionicons name="checkmark-sharp" size={s(16)} color={NEW_COLOR.TEXT_BLACK || '#000'} />
            </ViewComponent>
          ) : (
            <ViewComponent style={[commonStyles.radioOuter]} />
          )}
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  };
  return (
    <ViewComponent style={commonStyles.container}>
      <PageHeader title={"GLOBAL_CONSTANTS.CARD_PRIVACY_CONTROLS"} onBackPress={handleBackpress} />
      {error&&<ErrorComponent message={error} screen={true}/>}
      {/* Info Box */}
      <ViewComponent style={[
        commonStyles.dflex,
        commonStyles.mb24,
        commonStyles.rounded10,
        commonStyles.gap10
      ]}>
        <ViewComponent>
          <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
        </ViewComponent>
        <TextMultiLanguage
          style={[commonStyles.fs14_24, commonStyles.fw400, commonStyles.textGrey, { flex: 1 }]}
          text="GLOBAL_CONSTANTS.CARD_PRIVACY_INFO_TEXT"
        />
      </ViewComponent>
      {loading ? (
        <Loadding contenthtml={skeletons} />
      ) : (
        <FlatList
          data={cardOptions}
          renderItem={renderOption}
          keyExtractor={item => item.key}
          extraData={selectedType}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ViewComponent>
  );
};

export default CardPrivacyControls;