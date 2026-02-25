import React from 'react';
import { Field } from 'formik';
import ViewComponent from '../../../../../components/view/view';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import CustomPicker from '../../../../../components/customPicker/CustomPicker';
import { PersonalFieldsProps } from './interface';

const PersonalFields: React.FC<PersonalFieldsProps> = ({ touched, errors, handleBlur, kybRequriments, setFieldValue, setFieldTouched, handleUboChange, uboFormDataList, values }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const mappedUboList = uboFormDataList?.map((item: any) => ({
        name: item.firstName ? `${item.firstName}` : "--",
        id: item.id?.toString() ? `${item.id}` : "--",
    }));
    return (
        <ViewComponent>
            {kybRequriments?.toLowerCase()
                ?.replace(/\s+/g, '') // remove spaces
                ?.split(',')          // convert to array
                ?.includes('personalinformation')
                && (
                    <ViewComponent>
                        <ParagraphComponent text={"Initial User"} style={[commonStyles.sectionTitle, commonStyles.mb18]} />

                        <Field
                            name={'ubo'}
                            label={"Select UBO"}
                            error={touched?.ubo && !values?.ubo ? errors?.ubo : undefined}
                            touched={touched?.ubo && !values?.ubo}
                            handleBlur={handleBlur}
                            customContainerStyle={{ height: 80 }}
                            data={mappedUboList || []}
                            placeholder={"Select UBO"}
                            placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                            component={CustomPicker}
                            modalTitle={"Select UBO"}
                            customBind={['name', 'code']}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                            valueField={['id']} // picker returns code (id)
                            onChange={(selectedCode: string) => {
                                setFieldValue("ubo", selectedCode);   // store FULL object
                                setFieldTouched("ubo", false);  // Clear validation error
                                handleUboChange?.(selectedCode, setFieldValue);
                            }}

                        />

                    </ViewComponent>
                )}


        </ViewComponent>
    );
};

export default PersonalFields;