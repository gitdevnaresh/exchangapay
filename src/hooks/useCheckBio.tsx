import { CommonActions, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import ReactNativeBiometrics from "react-native-biometrics";
import { useSelector } from "react-redux";

const useChekBio = () => {
    const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
    const rnBiometrics = new ReactNativeBiometrics()
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLocedModelOpen, setIsLocedModelOpen] = useState<boolean>(false);

    const handleUpdateModel = (value: boolean) => {
        setIsLocedModelOpen(value)
    };

    const checkBio = async () => {
        if (userInfo.isFaceRecognition) {
            rnBiometrics.isSensorAvailable()
                .then((resultObject) => {
                    const { available } = resultObject;
                    if (available) {
                        rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' })
                            .then((resultObject) => {
                                const { success } = resultObject
                                if (success) {
                                    navigation.dispatch(
                                        CommonActions.reset({
                                            index: 1,
                                            routes: [{ name: "Dashboard" }],
                                        })
                                    );
                                } else {
                                    setIsLocedModelOpen(true)
                                }
                            })
                            .catch(() => {
                            })
                    }
                    else {
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 1,
                                routes: [{ name: "Dashboard" }],
                            })
                        );
                        setIsLoading(false);
                    }
                });
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: "Dashboard" }],
                })
            );
            setIsLoading(false);
        }
    }
    return { checkBio, isLoading, isLocedModelOpen, handleUpdateModel }
}

export default useChekBio;
