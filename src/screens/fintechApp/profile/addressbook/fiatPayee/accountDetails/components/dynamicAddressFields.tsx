import React from 'react';
import { Field } from 'formik';
import ViewComponent from '../../../../../../../components/view/view';
import InputDefault from '../../../../../../../components/textInputComponents/DefaultFiat';
import CustomPicker from '../../../../../../../components/customPicker/CustomPicker';
import LabelComponent from '../../../../../../../components/textComponets/lableComponent/lable';

interface DynamicAddressFieldsProps {
  fields: any[];
  values: any;
  touched: any;
  errors: any;
  handleBlur: any;
  setFieldValue: any;
  countries: any;
  states: any;
  setCountryStates: any;
  NEW_COLOR: any;
  commonStyles: any;
  handleCountryChange?: (countryName: string) => void;
}

const DynamicAddressFields: React.FC<DynamicAddressFieldsProps> = ({
  fields,
  values,
  touched,
  errors,
  handleBlur,
  setFieldValue,
  countries,
  states,
  setCountryStates,
  NEW_COLOR,
  commonStyles,
  handleCountryChange
}) => {

  const renderField = (field: any) => {
    const fieldName = field.field;
    const isRequired = field.isMandatory === "true" || field.isMandatory === true;

    switch (field.fieldType) {
      case 'string':
        return (
          <Field
            maxLength={parseInt(field.maxLength) || 50}
            touched={touched[fieldName]}
            name={fieldName}
            label={field.label}
            error={errors[fieldName]}
            handleBlur={handleBlur}
            placeholder={`Enter ${field.label}`}
            component={InputDefault}
            requiredMark={isRequired ? <LabelComponent style={[commonStyles.textRed]} text=' *' /> : null}
          />
        );

      case 'lookup':
        let lookupData = [];

        if (field.lookupKey === 'countries') {
          lookupData = countries || [];
        } else if (field.lookupKey === 'states') {
          lookupData = states || [];
        }

        return (
          <Field
            modalTitle={`Select ${field.label}`}
            label={field.label}
            touched={touched[fieldName]}
            name={fieldName}
            error={errors[fieldName]}
            handleBlur={handleBlur}
            data={lookupData}
            value={values[fieldName]}
            placeholder={`Select ${field.label}`}
            placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
            onChange={(selected: any) => {
              setFieldValue(fieldName, selected);

              // Handle country selection to load states
              if (field.onSelectHandler === 'handleCountrySelect' && setCountryStates) {
                if (handleCountryChange) {
                  handleCountryChange(selected);
                } else {
                  const selectedCountry = countries?.find((country: any) =>
                    country.name === selected
                  );
                  if (selectedCountry?.details) {
                    setCountryStates(selectedCountry?.details);
                  } else {
                    setCountryStates([]);
                  }
                }
              }

              // Handle state selection
              if (field.onSelectHandler === 'handleStateSelect') {
                // Additional state selection logic if needed
              }
            }}
            component={CustomPicker}
            requiredMark={isRequired ? <LabelComponent text=" *" style={[commonStyles.textRed]} /> : null}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ViewComponent>
      {fields?.map((field: any, index: number) => (
        <ViewComponent key={field.field || index}>
          {renderField(field)}
          <ViewComponent style={[commonStyles.listitemGap]} />
        </ViewComponent>
      ))}
    </ViewComponent>
  );
};

export default DynamicAddressFields;
