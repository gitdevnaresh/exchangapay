import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ViewComponent from '../../../../newComponents/view/view';
import { useNavigation } from '@react-navigation/native';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CustomPicker from '../../../../newComponents/pickerComponents/basic/customPickerNonFormik';
import OnboardingService from '../../../../services/onboarding';
import { isErrorDispaly } from '../../../../utils/helpers';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { s } from '../../../../newComponents/theme/scale';
import PopupOrSheet from '../../../../newComponents/models/PopupOrSheet';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../../assets/blobUrls';
import { cardsService } from '../../../../apiServices/cardsApis/cardsApiServices';
import { useDispatch } from 'react-redux';
import { resetKycFormData } from '../../../../redux/actions/cardActions';
import { setApplyCardDataField } from '../../../../redux/actions/actions';
import { setApplyCardData } from '../../../../redux/actions/actions';
import { Country } from '../interface';


const SupportedCountry: React.FC = React.memo((props: any) => {
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const REVERSE_NEW_COLOR = useMemo(() => useThemeColors(true), []);
  const reverseCommonStyles = useMemo(() => getThemedCommonStyles(REVERSE_NEW_COLOR), [REVERSE_NEW_COLOR]);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const supportedCountrySheetRef = React.useRef<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [error, setError] = useState<string>('');
  const [apiCallsCompleted, setApiCallsCompleted] = useState({
    countriesList: false,
    cardKycInfo: false,
  });
  const [isRestricted, setIsRestricted] = useState<boolean>(false);
  const isLoading = !apiCallsCompleted.countriesList || !apiCallsCompleted.cardKycInfo;

  const cardId = useMemo(() => 
    props?.route?.params?.cardId || props?.route?.params?.prevSelectedCardId, 
    [props?.route?.params?.cardId, props?.route?.params?.prevSelectedCardId]
  );

  const handleBack = useCallback(() => {
    navigation.navigate("Dashboard", { screen: 'GLOBAL_CONSTANTS.CARDS' });
  }, [navigation]);


  const countriesList = useCallback(async () => {
    setError('');
    try {
      const response: any = await OnboardingService.countriesList();
      if (response.status === 200) {
        const data = response?.data ?? [];
        setCountryList(data);
        return data;
      }
      setError(isErrorDispaly(response));
      return [];
    } catch (error: any) {
      setError(isErrorDispaly(error));
      return [];
    } finally {
      setApiCallsCompleted((prev) => ({ ...prev, countriesList: true }));
    }
  }, []);
  const CardKycInformation = useCallback(async () => {
    if (countryList.length === 0) {
      setApiCallsCompleted((prev) => ({ ...prev, cardKycInfo: true }));
      return;
    }
    
    try {
      const response: any = await cardsService.getKycRequirements(cardId);
      if (response.status === 200) {
        dispatch(setApplyCardData(response?.data));
        const countryCode = response?.data?.country;
        const countryData = countryList.find((country: Country) => country.name === countryCode);
        if (countryData) {
          setSelectedCountry(countryData?.name || '');
          setIsRestricted(countryData?.isCountryRestrict || false);
        }
        return;
      }
      setError(isErrorDispaly(response));
    } catch (error: any) {
      setError(isErrorDispaly(error));
    } finally {
      setApiCallsCompleted((prev) => ({ ...prev, cardKycInfo: true }));
    }
  }, [countryList, cardId, dispatch]);

  useEffect(() => {
    countriesList();
  }, [countriesList]);

  useEffect(() => {
    if (countryList.length > 0) {
      CardKycInformation();
    }
  }, [countryList, CardKycInformation]);
  const handleSelectCountry = useCallback((value: Country) => {
    setError('');
    setSelectedCountry(value?.name || '');
    setIsRestricted(value?.isCountryRestrict || false);

    // Update Redux store
    dispatch(setApplyCardDataField({ selectedCountry: value?.name }));
  }, [dispatch]);

  const handleContinue = useCallback(() => {
    if (isRestricted) {
      supportedCountrySheetRef.current?.open();
      return;
    }
    dispatch(resetKycFormData());
    navigation.navigate('UserPersonalInformation', {
      cardId,
      selectedCountry: selectedCountry,
    });
  }, [isRestricted, cardId, dispatch, navigation, selectedCountry]);

  const handleClose = useCallback(() => {
    supportedCountrySheetRef.current?.close()
  }, []);

  useHardwareBackHandler(handleBack);
  
  return (
    <ViewComponent style={[commonStyles.flex1]}>
      <Container>
        <PageHeader title="GLOBAL_CONSTANTS.GETTING_STARTED" onBackPress={handleBack} />
        {isLoading && (
          <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <SwokipayDashboardLoader />
          </ViewComponent>
        )}
        {!isLoading && (
          <>
        {error && <ErrorComponent message={error} screen={true} />}
        <TextMultiLanguage
          text="GLOBAL_CONSTANTS.THE_INFORMATION_BELOW_MUST_MATCH_YOUR_PASSPORT_OR_GOVERNMENT_ISSUED_ID"
          style={[commonStyles.textGrey, commonStyles.fs14_24, commonStyles.fw400, commonStyles.mb24]}
        />
        <CustomPicker
          data={countryList}
          value={selectedCountry}
          onChange={handleSelectCountry}
          label="GLOBAL_CONSTANTS.COUNTRY_REGION"
          placeholder="GLOBAL_CONSTANTS.SELECT_COUNTRY_REGION"
          selectionType="name"
          modalTitle="GLOBAL_CONSTANTS.SELECT_COUNTRY_REGION"
          isRequired={true}
          modalPlaceholder="GLOBAL_CONSTANTS.SEARCH_COUNTRY_REGION"
        />

        <ViewComponent style={[commonStyles.flex1]} />
        <ButtonComponent
          title="GLOBAL_CONSTANTS.CONTINUE"
          onPress={handleContinue}
          disable={!selectedCountry}
        />
        <ViewComponent style={[commonStyles.mb16]} />
        <ButtonComponent
          title="GLOBAL_CONSTANTS.BACK"
          onPress={handleBack}
          solidBackground={true}
        />
          </>
        )}
       <ViewComponent style={[commonStyles.sectionGap]}/>
      </Container>

      <PopupOrSheet
        showCloseIcon={false}
        ref={supportedCountrySheetRef}
        height={s(330)}
        showCloseIconAndTittle={false}
      >
        <ViewComponent>
          <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
            <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
          </ViewComponent>
          <TextMultiLanguage
            text={"GLOBAL_CONSTANTS.CARD_UNAVAILABLE"}
            style={[reverseCommonStyles.fw700, reverseCommonStyles.textWhite, reverseCommonStyles.fs16, commonStyles.textCenter, commonStyles.mb16
            ]} />
          <ViewComponent style={[commonStyles.dflex, commonStyles.flexWrap, commonStyles.flexRow, commonStyles.justifyCenter, commonStyles.mb16]}>
            <TextMultiLanguage
              text={props?.route?.params?.prevSelectedType === "Virtual" ? "GLOBAL_CONSTANTS.VIRTUAL_CARD_APPLICATIONS_NOT_SUPPORTED" : "GLOBAL_CONSTANTS.PHYSICAL_CARD_APPLICATIONS_NOT_SUPPORTED"}
              style={[reverseCommonStyles.textWhite, reverseCommonStyles.fs14, commonStyles.fw400, commonStyles.textCenter]}
            />
          </ViewComponent>
          <ViewComponent style={[reverseCommonStyles.mb16, commonStyles.flex1, commonStyles.alignCenter]} >
            <ButtonComponent
              title="GLOBAL_CONSTANTS.OKEY"
              customContainerStyle={[commonStyles.rounded100, { width: s(225), height: s(50) }]}
              onPress={handleClose} />
          </ViewComponent>
        </ViewComponent>
      </PopupOrSheet>
    </ViewComponent>
  );
});

export default SupportedCountry;