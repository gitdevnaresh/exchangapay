import React from 'react';
import { Field } from 'formik';
import { TextInput } from 'react-native';
import ViewComponent from '../../../../../../../components/view/view';
import InputDefault from '../../../../../../../components/textInputComponents/DefaultFiat';
import CustomPicker from '../../../../../../../components/customPicker/CustomPicker';
import PhoneCodePicker from '../../../../../../../components/phonePicker/phonePicker';
import LabelComponent from '../../../../../../../components/textComponets/lableComponent/lable';
import ParagraphComponent from '../../../../../../../components/textComponets/paragraphText/paragraph';
import { ADD_RECIPIENT } from '../../addRecipient/constant';
import { DynamicFieldRendererProps } from '../interface';
import { recipientSummaryLoader } from '../../../../../../../skeletons/payeesSkeltons';

const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  fields,
  values,
  touched,
  errors,
  handleBlur,
  handleChange,
  setFieldValue,
  countryCodelist,
  relationTypes,
  countries,
  states,
  setCountryStates,
  NEW_COLOR,
  commonStyles,
  t,
  handlePhoneCode,
  recipentDetails,
  isRecipientLoading,
  props,
  decryptAES,
  context,
  isRelationTypeFeildDisplay,
}) => {
  const evaluateConditions = (conditions: any[]) => {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      if (condition.source === 'context') {
        return context[condition.key as keyof typeof context] === condition.equals;
      } else if (condition.source === 'form') {
        let formValue;
        if (condition.key === 'accountTypeDetails') {
          formValue = props?.accountType?.toLowerCase();
        } else if (condition.key === 'addressTypeDetails') {
          formValue = values?.addressType;
        } else {
          formValue = values[condition.key];
        }
        return typeof condition.equals === 'string'
          ? formValue?.toLowerCase() === condition.equals.toLowerCase()
          : formValue === condition.equals;
      }
      return true;
    });
  };

  const shouldShowField = (field: any) => {
    const fieldName = field.field;
    const isFirstParty = context.isFirstParty;
    const accountType = context.accountTypeDetails || props?.accountType?.toLowerCase();
    const addressType = values?.addressType;
    const isRelationFeildDisplay = isRelationTypeFeildDisplay;

    // Field-specific conditions based on requirements
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        // Show for personal accounts (both first party view and third party input)
        return accountType === 'personal';

      case 'businessName':
        // Show for business accounts (both first party view and third party input)
        return accountType === 'business';

      case 'email':
      case 'phone':
        // Always show (both first party view and third party input)
        return true;

      case 'relation':
        // Only show for third party and 3rd Party address type in fiat screen
        return isRelationFeildDisplay && !isFirstParty && addressType === '3rd Party';

      default:
        // For other fields, use condition evaluation
        const conditionsResult = evaluateConditions(field.conditions);
        return conditionsResult;
    }
  };
  const renderField = (field: any) => {
    if (!field.isEnable) return null;

    const fieldName = field.field;
    const isRequired = field.isMandatory === "true" || field.isMandatory === true;
    const isFirstParty = context.isFirstParty;
    const fieldShouldShow = shouldShowField(field);

    // For first party, show recipient data if available
    const hasRecipientData = field.fieldType === 'phone'
      ? (recipentDetails?.phoneNumber || recipentDetails?.phoneCode) && !props?.id && isFirstParty
      : recipentDetails?.[fieldName] && !props?.id && isFirstParty;

    // Show loading for first party fields when loading
    if (isRecipientLoading && isFirstParty && !props?.id && fieldShouldShow) {
      return recipientSummaryLoader(1);
    }

    if (!fieldShouldShow) {
      return null;
    }
    switch (field.fieldType) {
      case 'string':
        if (isRecipientLoading) {
          return recipientSummaryLoader(1);
        }

        // Show recipient data for first party (view mode)
        if (hasRecipientData && isFirstParty) {
          const displayValue = fieldName === 'businessName'
            ? recipentDetails.businessName
            : fieldName === 'email'
              ? decryptAES?.(recipentDetails.email) || recipentDetails.email
              : recipentDetails[fieldName];

          return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.justifyContent]}>
              <LabelComponent
                text={field.label}
                style={[commonStyles.listsecondarytext]}
              />
              <ParagraphComponent
                style={[commonStyles.listprimarytext]}
                text={displayValue}
              />
            </ViewComponent>
          );
        }

        // Show input field
        const fieldNameMapping: any = {
          'line1': ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.STREET,
          'postalCode': ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.POSTAL_CODE
        };

        // For businessName, use firstName for form field but businessName for error display
        const actualFieldName = fieldName === 'businessName' ? ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.BUSINESS_NAME : (fieldNameMapping[fieldName] || fieldName);
        const fieldValue = values[actualFieldName];
        // For businessName, only show error if firstName field is empty
        const hasError = isRequired && ((fieldName === 'businessName' && errors[fieldName] && !fieldValue) || (fieldName !== 'businessName' && touched[actualFieldName] && errors[actualFieldName]));
        return (
          <Field
            maxLength={parseInt(field.maxLength) || 50}
            touched={touched[actualFieldName]}
            name={actualFieldName}
            label={field.label}
            error={hasError ? (fieldName === 'businessName' ? errors[fieldName] : errors[actualFieldName]) : undefined}
            handleBlur={handleBlur}
            placeholder={`Enter ${field.label}`}
            component={InputDefault}
            requiredMark={isRequired ? <LabelComponent style={[commonStyles.textRed]} text=' *' /> : null}
            style={hasError ? { borderColor: NEW_COLOR.ERROR_RED || NEW_COLOR.TEXT_RED, borderWidth: 1 } : undefined}
          />
        );

      case 'phone':
        // Show recipient phone data for first party (view mode)
        if (hasRecipientData && isFirstParty) {
          const phoneCode = recipentDetails?.phoneCode ?
            (decryptAES ? decryptAES(recipentDetails.phoneCode) : recipentDetails.phoneCode) : '';
          const phoneNumber = recipentDetails?.phoneNumber ?
            (decryptAES ? decryptAES(recipentDetails.phoneNumber) : recipentDetails.phoneNumber) : '';

          return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.justifyContent]}>
              <LabelComponent
                text={field.label}
                style={[commonStyles.listsecondarytext]}
              />
              <ParagraphComponent
                style={[commonStyles.listprimarytext]}
                text={`${phoneCode} ${phoneNumber}`.trim()}
              />
            </ViewComponent>
          );
        }

        return (
          <ViewComponent>
            <LabelComponent
              text={field.label}
              style={[commonStyles.inputLabel]}
            >
              {isRequired && <LabelComponent style={[commonStyles.textRed]} text=' *' />}
            </LabelComponent>
            <ViewComponent style={[commonStyles.relative, commonStyles.dflex]}>
              <PhoneCodePicker
                modalTitle="Select Country Code"
                customBind={["name", "(", "code", ")"]}
                data={countryCodelist}
                value={values.phoneCode}
                placeholder="Select"
                inputStyle={{
                  borderRightWidth: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderColor: (isRequired && ((touched?.phoneCode && errors?.phoneCode) || (touched?.phoneNumber && errors?.phoneNumber))) ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER
                }}
                isOnlycountry={true}
                disabled={!!(recipentDetails?.phoneCode && isFirstParty)}
                onChange={(item: any) => handlePhoneCode?.(item, setFieldValue)}
              />
              <TextInput
                style={[
                  commonStyles.flex1,
                  commonStyles.input,
                  {
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderColor: (isRequired && ((touched?.phoneCode && errors?.phoneCode) || (touched?.phoneNumber && errors?.phoneNumber))) ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER
                  },
                  (!!(recipentDetails?.phoneNumber && isFirstParty)) && commonStyles.disabledContainerStyle,
                  (!!(recipentDetails?.phoneNumber && isFirstParty)) && commonStyles.disabledTextStyle
                ]}
                placeholder={t?.("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER") || "Enter phone number"}
                onChangeText={(text) => {
                  const formattedText = text?.replace(/[^0-9]/g, "")?.slice(0, 13);
                  handleChange('phoneNumber')(formattedText);
                }}
                value={values.phoneNumber}
                keyboardType="phone-pad"
                editable={!(recipentDetails?.phoneNumber && isFirstParty)}
                maxLength={13}
                placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                multiline={false}
              />

            </ViewComponent>
            {(touched.phoneCode && errors.phoneCode || touched.phoneNumber && errors.phoneNumber) &&
              <ParagraphComponent style={[commonStyles.textRed, { marginTop: 10 }]} text={errors.phoneCode || errors?.phoneNumber} />
            }
          </ViewComponent>
        );

      case 'lookup':
        const lookupData = field.lookupSource === 'relation' ? relationTypes :
          field.lookupKey === 'countries' ? countries :
            field.lookupKey === 'states' ? states : [];

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

              // Handle country selection
              if (field.onSelectHandler === 'handleCountrySelect' && setCountryStates) {
                const selectedCountry = countries?.find((country: any) => country.name === selected);
                setCountryStates(selectedCountry?.details || []);
              }
            }}
            component={CustomPicker}
            disabled={recipentDetails?.[fieldName] && isFirstParty}
            requiredMark={isRequired ? <LabelComponent text=" *" style={[commonStyles.textRed]} /> : null}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ViewComponent>
      {fields?.map((field: any, index: number) => {
        const renderedField = renderField(field);
        if (!renderedField) return null;
        return (
          <ViewComponent key={field.field || index}>
            <ViewComponent style={[commonStyles.listitemGap]} />
            {renderedField}
          </ViewComponent>
        );
      })}
    </ViewComponent>
  );
};

export default DynamicFieldRenderer;
