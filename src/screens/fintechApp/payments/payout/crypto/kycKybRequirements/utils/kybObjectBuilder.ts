export const buildKybObject = (values: any, kycRequirements: any, uboList: any[], addressesList: any[], encryptAES: (data: string) => string, productId: string, isReapply?: boolean) => {
    return {
        kyb: {
            requirement: kycRequirements?.kyb?.requirement || "FullName,Basic,Address,UBO,Documents",
            fullName: {
                firstName: kycRequirements?.kyb?.fullName?.firstName || "",
                lastName: kycRequirements?.kyb?.fullName?.lastName || "",
                businessName: kycRequirements?.kyb?.fullName?.businessName || ""
            },
            basic: {
                dob: kycRequirements?.kyb?.basic?.dob || null,
                email: kycRequirements?.kyb?.basic?.email || "",
                phoneCode: kycRequirements?.kyb?.basic?.phoneCode || "",
                phoneNo: kycRequirements?.kyb?.basic?.phoneNo || ""
            },
            addressDto: {
                addressId: (() => {
                    // If values.address is already an ID, use it directly
                    const selectedAddress = addressesList.find(addr => addr.id === values.address);
                    if (selectedAddress) return values.address;

                    // If values.address is a name, find the corresponding ID
                    const addressByName = addressesList.find(addr => addr.name === values.address);
                    if (addressByName) return addressByName.id;

                    // Fallback to the original value
                    return values.address || "";
                })()
            },
            ubo: uboList.map(ubo => ({
                id: ubo.id,
                firstName: ubo.firstName,
                lastName: ubo.lastName,
                dob: ubo.dob,
                phoneCode: ubo.phoneCode ? encryptAES(ubo.phoneCode) : ubo.phoneCode,
                companyName: null,
                registrationNumber: null,
                dateOfRegistration: null,
                phoneNumber: ubo.phoneNumber ? encryptAES(ubo.phoneNumber) : ubo.phoneNumber,
                email: ubo.email ? encryptAES(ubo.email) : ubo.email,
                shareHolderPercentage: ubo.shareHolderPercentage,
                country: ubo.country,
                note: ubo.note || null,
                 createdDate: new Date().toISOString(),

                addressDto: {
                    addressId: (() => {
                        if (ubo.address) {
                            // If it's a name, find the corresponding ID
                            const addressByName = addressesList.find(addr => addr.name === ubo.address);
                            if (addressByName) {
                                return addressByName.id;
                            }
                        }
                        return "";
                    })()
                },
                docDetails: {
                    documentType: ubo.docDetails?.type || "",
                    documentFront: ubo.docDetails?.frontImage || "",
                    documentBack: ubo.docDetails?.backImage || "",
                    documentNumber: ubo.docDetails?.docNumber ? encryptAES(ubo.docDetails.docNumber) : "",
                    ...(ubo.docDetails?.docExpiryDate && { docExpiryDate: ubo.docDetails.docExpiryDate })
                },
                recordStatus: "Modified"
            })),
            kybpfc: {
                businessType: values.chooseBusinessTrype,
                identificationNumber: values.RegistrationNo,
                registrationDate: values.registrationDate
            },
            documents: [
                {
                    id: "00000000-0000-0000-0000-000000000000",
                    fileName: values.businessRegistrationProofType,
                    type: {
                        type: values.businessRegistrationProofType,
                        blob: values.businessRegistrationProof
                    }
                },
                {
                    id: "00000000-0000-0000-0000-000000000000",
                    fileName: values.docType,
                    type: {
                        type: values.docType,
                        blob: values.frontId
                    }
                }
            ]
        },
        productId: productId,
        isReapply: isReapply
    };
};