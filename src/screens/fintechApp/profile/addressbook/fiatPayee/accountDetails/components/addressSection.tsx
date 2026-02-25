import React, { useEffect, useCallback } from 'react';
import ViewComponent from '../../../../../../../components/view/view';
import DynamicAddressFields from './dynamicAddressFields';
import useCountryData from '../../../../../../../hooks/countryDataHook/useCountryData';

interface AddressSectionProps {
    addressArray: any[];
    values: any;
    touched: any;
    errors: any;
    handleBlur: any;
    handleChange: any;
    setFieldValue: any;
    countries: any;
    states: any;
    formik: any;
    setCountryStates: any;
    NEW_COLOR: any;
    commonStyles: any;
    props: any;
    dynamicAddressDetails: any;
    formatState: (state: any) => any;
    getCurrencies: (country: string) => void;
    countryStates: any
}

const AddressSection: React.FC<AddressSectionProps> = ({
    values,
    touched,
    errors,
    handleBlur,
    setFieldValue,
    countries,
    formik,
    setCountryStates,
    NEW_COLOR,
    commonStyles,
    countryStates,
    dynamicAddressDetails, formatState
}) => {
    // Use optimized country data with states
    const { countriesWithStates } = useCountryData({
        loadCountries: true,
        loadStates: true,
    });

    useEffect(() => {
        if (!Array.isArray(countriesWithStates) || countriesWithStates?.length === 0) return;

        const selectedCountry = countriesWithStates?.find(
            (country: any) => country?.name === formik?.values?.country
        );
        const formattedStates =
            selectedCountry?.details?.map((state: any) => formatState(state)) || [];

        setCountryStates(formattedStates);
    }, [countriesWithStates, formik?.values?.country]);

    const handleCountryChange = useCallback((countryName: string) => {
        const selectedCountry = countriesWithStates?.find(
            (country: any) => country?.name === countryName
        );
        const formattedStates = selectedCountry?.details?.map((state: any) => formatState(state)) || [];
        setCountryStates(formattedStates);
        setFieldValue('state', '');
    }, [countriesWithStates, formatState, setCountryStates, setFieldValue]);
    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
            <DynamicAddressFields
                fields={dynamicAddressDetails}
                values={values}
                touched={touched}
                errors={errors}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
                countries={countries}
                states={countryStates || []}
                setCountryStates={setCountryStates}
                NEW_COLOR={NEW_COLOR}
                commonStyles={commonStyles}
                handleCountryChange={handleCountryChange}
            />
        </ViewComponent>
    );
};

export default AddressSection;