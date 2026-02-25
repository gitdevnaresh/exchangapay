
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Field } from "formik";
import { useLngTranslation } from "../../../../../../../hooks/languagesHook/useLngTranslation";
import { getThemedCommonStyles } from "../../../../../../../components/CommonStyles";
import CustomPicker from "../../../../../../../components/customPicker/CustomPicker";
import InputDefault from "../../../../../../../components/textInputComponents/DefaultFiat";
import AddressbookService from "../../../../../../../apiServices/profile/general/addressbook";
import { isErrorDispaly } from "../../../../../../../utils/helpers";
import useEncryptDecrypt from "../../../../../../../hooks/encDecHook";
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors";
import { BankDetails } from "../interface";
import LabelComponent from "../../../../../../../components/textComponets/lableComponent/lable";

interface FieldDefinition {
  key: string;
  label: string;
  fieldType: "lookUp" | "lookup" | "string" | "text";
  isMandatory: "true" | "false";
  validation?: string;
  url?: string;
  value?: string;
}

interface Props {
  fields: FieldDefinition[];
  touched: any;
  errors: any;
  handleBlur: (e: any) => void;
  setFieldValue: any;
  getLookupData: any;
  values: any;
  handleUpdateValues?: any;
  setFieldError?: any;
  paymentFeildInfo: any;
  mode: string;
  getDynamicLookupData?: (url: string, fieldKey: string) => void;
  loadBankData?: (country: string) => void;
  loadBranchData?: (bankName: string) => void;
  selectedCurrencyCountries: any;
}

const DynamicFieldRenderer: React.FC<Props> = ({
  fields,
  touched,
  errors,
  handleBlur,
  setFieldValue,
  getLookupData,
  handleUpdateValues,
  paymentFeildInfo,
  mode,
  getDynamicLookupData,
  loadBankData,
  loadBranchData,
  selectedCurrencyCountries,
  values
}) => {
  const { decryptAES } = useEncryptDecrypt();
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const [errorMsg, setErrorMsg] = useState("");
  const [ibanDetails, setIBanDetails] = useState<BankDetails>();
  const [loading, setLoading] = useState(false);

  const isLookupField = (field: any) =>
    field?.fieldType &&
    typeof field.fieldType === "string" &&
    field.fieldType.toLowerCase() === "lookup";

  /** ?? pre-fill dynamic fields only once when editing */
  useEffect(() => {
    if (!Array.isArray(fields)) return;

    // Fetch lookup data for fields with URLs
    fields.forEach((field: any) => {
      if (isLookupField(field) && getDynamicLookupData) {
        getDynamicLookupData(field.url, field.field || field.key);
      }
    });

    if (mode === "edit" && paymentFeildInfo) {
      fields.forEach((item: any) => {
        const fieldName = item.field || item.key;
        const value = paymentFeildInfo?.[fieldName];
        if (value !== undefined) {
          if (fieldName === "accountNumber") {
            try {
              setFieldValue(fieldName, decryptAES(value));
            } catch {
              setFieldValue(fieldName, value);
            }
          } else {
            setFieldValue(fieldName, value);
          }
        }
      });
    }
  }, [fields, paymentFeildInfo, mode, setFieldValue, getDynamicLookupData, decryptAES]);

  const getIbanDetails = async (number: any) => {
    setErrorMsg("");
    setLoading(true);
    try {
      const response: any = await AddressbookService.iBanVerification(number);
      if (response.status === 200) {
        setIBanDetails(response?.data);
        handleUpdateValues?.({ bankBranch: response?.data?.branch });
      } else {
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {Array.isArray(fields) && fields?.map((field: any) => {
        const fieldKey = field.field || field.key;
        const isCountriesField = fieldKey?.toLowerCase() === "bankcountry";
        const isBankAccountType = fieldKey?.toLowerCase() === "bankaccounttype";

        const lookupData = isCountriesField
          ? selectedCurrencyCountries
          : isBankAccountType
            ? getLookupData("accountType", "accountType")
            : isLookupField(field)
              ? getLookupData(fieldKey, field)
              : undefined;

        const shouldShowPicker =
          Array.isArray(lookupData) && lookupData.length > 0;

        return (
          <View key={fieldKey}>
            <View style={[commonStyles.relative]}>
              <Field
                name={fieldKey}
                label={field.label}
                modalTitle={field.label}
                placeholder={
                  field.fieldType === "string"
                    ? "Enter " + field.label
                    : "Select " + field.label
                }
                touched={touched[fieldKey]}
                maxLength={50}
                error={errors[fieldKey]}
                handleBlur={handleBlur}
                onChange={(value: any) => {
                  const finalValue = (fieldKey?.toLowerCase().includes('swift') || fieldKey?.toLowerCase().includes('iban'))
                    ? value?.toUpperCase()
                    : value;
                  setFieldValue(fieldKey, finalValue);
                  if (fieldKey === "bankName" && value && loadBranchData) {
                    loadBranchData(value);
                  }
                  if (fieldKey === "bankCountry" && value && loadBankData) {
                    if (values?.bankCountry?.toLowerCase()?.replace(/\s+/g, '')?.trim() !== value?.toLowerCase()?.replace(/\s+/g, '')?.trim()) {
                      setFieldValue("bankName", "");
                      setFieldValue("branchCode", "");
                    }
                    loadBankData(value);
                  }
                }}
                data={shouldShowPicker ? lookupData : undefined}
                component={shouldShowPicker ? CustomPicker : InputDefault}
                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                disabled={false}
                autoCapitalize={(fieldKey?.toLowerCase().includes('swift') || fieldKey?.toLowerCase().includes('iban')) ? 'characters' : 'none'}
                addPlusPrefix={!fieldKey?.toLowerCase().includes("branch")}
                requiredMark={
                  field.isMandatory === "true" ? (
                    <LabelComponent text=" *" style={[commonStyles.textRed]} />
                  ) : null
                }
              />
            </View>
            <View style={[commonStyles.sectionGap]} />
          </View>
        );
      })}
    </>
  );
};

export default DynamicFieldRenderer;

