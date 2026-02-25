import * as Yup from "yup"
    export const fiatValidationSchema = Yup.object().shape({
        merchantId: Yup.string().required('is required'),
        currency:Yup.string().required('is required'),
        networkName:Yup.string().required('is required'),
         fiatCurrency:Yup.string().required('is required'),
        amount:Yup.number().required('is required'),
        payee:Yup.string().required('is required'),
    })

export const cryptoValidationSchema = Yup.object().shape({
    merchantId: Yup.string().required('is required'),
    currency:Yup.string().required('is required'),
    networkName:Yup.string().required('is required'),
    payee:Yup.string().required('is required'),
    amount:Yup.string().required('is required'),
})

export const validationPayout=(data:any, t:any) => 
    {
        const minAmount = data?.minLimit;
        const maxAmount = data?.maxLimit;
      return  Yup.object().shape({
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    networkName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    cryptoCurrency:Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    amount: Yup.string()
      .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('is-greater-than-zero', t("GLOBAL_CONSTANTS.AMOUNT_SHOULD_BE_GREATER_THAN_ZERO"), (value) => {
                const amount = parseFloat(value || '0');
                return amount > 0;
            })
      .test('is-min-valid', `${t('GLOBAL_CONSTANTS.SHOULD_BE_AT_LEAST')} ${minAmount?.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`, (value) => {
        if (!minAmount || minAmount <= 0) return true;
        const amount = parseFloat(value);
        return amount >= minAmount;
      })
      .test('is-max-valid', `${t('GLOBAL_CONSTANTS.SHOULD_NOT_EXCEED')} ${maxAmount?.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`, (value) => {
        if (!maxAmount || maxAmount <= 0) return true;
        const amount = parseFloat(value);
        return amount <= maxAmount;
      }),
});}

export const createDynamicPayoutValidationSchema = (dynamicFields: any[], networkData: any, t: any, transferTypeList?: any[]) => {
  const minAmount = networkData?.minLimit;
  const maxAmount = networkData?.maxLimit;
  
  let schemaFields: any = {
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    networkName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    cryptoCurrency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    amount: Yup.string()
      .required("GLOBAL_CONSTANTS.IS_REQUIRED")
      .test('is-greater-than-zero', t("GLOBAL_CONSTANTS.AMOUNT_SHOULD_BE_GREATER_THAN_ZERO"), (value) => {
        const amount = parseFloat(value || '0');
        return amount > 0;
      })
      .test('is-min-valid', `${t('GLOBAL_CONSTANTS.SHOULD_BE_AT_LEAST')} ${minAmount?.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`, (value) => {
        if (!minAmount || minAmount <= 0) return true;
        const amount = parseFloat(value);
        return amount >= minAmount;
      })
      .test('is-max-valid', `${t('GLOBAL_CONSTANTS.SHOULD_NOT_EXCEED')} ${maxAmount?.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`, (value) => {
        if (!maxAmount || maxAmount <= 0) return true;
        const amount = parseFloat(value);
        return amount <= maxAmount;
      }),
  };

  if (transferTypeList && transferTypeList.length > 0) {
    schemaFields.transferType = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
  }

  // Add dynamic field validations
  dynamicFields.forEach((field: any) => {
    // Skip if field already exists in base schema
    if (schemaFields[field.key]) {
      return;
    }
    if (field.isMandatory === "true") {
      schemaFields[field.key] = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
    }
  });

  const schema = Yup.object().shape(schemaFields);
  return schema;
};


export const validationFiatPayout=(data:any, t: any) => 
    {
        const minAmount = data?.minLimit;
        const maxAmount = data?.maxLimit;
      return  Yup.object().shape({
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    networkName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    fiatCurrency:Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    amount: Yup.string()
      .required("GLOBAL_CONSTANTS.IS_REQUIRED")
      .test('is-greater-than-zero', t("GLOBAL_CONSTANTS.AMOUNT_SHOULD_BE_GREATER_THAN_ZERO"), (value) => {
                const amount = parseFloat(value || '0');
                return amount > 0;
            })
      .test('is-min-valid', `${t('GLOBAL_CONSTANTS.SHOULD_BE_AT_LEAST')} ${minAmount?.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`, (value) => {
        if (!minAmount || minAmount <= 0) return true;
        const amount = parseFloat(value);
        return amount >= minAmount;
      })
      .test('is-max-valid', `${t('GLOBAL_CONSTANTS.SHOULD_NOT_EXCEED')} ${maxAmount?.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`, (value) => {
        if (!maxAmount || maxAmount <= 0) return true;
        const amount = parseFloat(value);
        return amount <= maxAmount;
      }),
});}