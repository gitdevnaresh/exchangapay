import React from "react";
import { useThemeColors } from '../../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../../components/CommonStyles';
import ViewComponent from '../../../../../../../components/view/view';
import FormikTextInput from '../../../../../../../components/textInputComponents/formik/textInput';
import { Field } from 'formik';
import { Data, KycKyb } from '../interface/interface';
import CustomPicker from '../../../../../../../components/customPicker/CustomPicker';
import { FORM_FIELD } from '../../../../../onboarding/kyb/constants';
import LabelComponent from '../../../../../../../components/textComponets/lableComponent/lable';
import DatePickerComponent from '../../../../../../../components/datePickers/formik/datePicker';

interface BusinessDetailsFieldsProps {
    touched: any;
    errors: any;
    handleBlur: any;
    values: any;
    setFieldValue: any;
    lookups?: Data;
    kycRequirements?: KycKyb;
    formData?: any;
}

const CompanyFields: React.FC<BusinessDetailsFieldsProps> = ({ touched, errors, handleBlur, values, setFieldValue, lookups, kycRequirements, formData }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    
    // Check if registration date exists from API
    const hasRegistrationDate = formData?.registrationDate;
    
    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.titleSectionGap]} />
            <FormikTextInput
                name="RegistrationNo"
                label="GLOBAL_CONSTANTS.REGISTRATION_NUMBER"
                placeholder="GLOBAL_CONSTANTS.ENTER_REGISTRATION_NUMBER"
                placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                value={values.RegistrationNo || ''}
                onChangeText={(text: string) => setFieldValue('RegistrationNo', text)}
                onBlur={handleBlur('RegistrationNo')}
                isRequired={true}
                editable={true}
            />
            <ViewComponent style={[commonStyles.formItemSpace]} />
            <DatePickerComponent
                name="registrationDate"
                label="GLOBAL_CONSTANTS.REGISTRATION_DATE"
                mode="date"
                required={true}
                iconColor={NEW_COLOR.TEXT_WHITE}
                infoText="GLOBAL_CONSTANTS.FUTURE_DATES_NOT_ALLOWED"
                disabled={hasRegistrationDate}
            />
            <ViewComponent style={[commonStyles.formItemSpace]} />

            <Field
                activeOpacity={0.9}
                name={"chooseBusinessTrype"}
                label={"GLOBAL_CONSTANTS.BUSINESS_TYPE"}
                touched={touched?.chooseBusinessTrype}
                error={errors?.chooseBusinessTrype}
                handleBlur={handleBlur}
                customContainerStyle={{ height: 80 }}
                data={lookups?.BusinessTypes || []}
                placeholder={"GLOBAL_CONSTANTS.SELECT_BUSINESS_TYPE"}
                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                component={CustomPicker}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_BUSINESS_TYPE"}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                onChange={(value: string) => {
                    setFieldValue('chooseBusinessTrype', value);
                }}
            />

        </ViewComponent>
    );
};

export default CompanyFields;