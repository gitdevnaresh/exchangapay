import { CommonActions, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
    describeBiometricOutcome,
    requireUserPresence,
} from "../security/biometricAuth";
import { log } from "../utils/logger";

/**
 * The app-open biometric lock — security finding H-14.
 *
 * Every branch of the original went to the Dashboard except an explicit "no":
 * no sensor went to the Dashboard, an unenrolled finger went to the Dashboard,
 * and a thrown error hit an empty catch and left the user on a dead screen.
 * Turning biometrics off in device settings was therefore enough to walk past
 * the lock — no tampering required.
 *
 * Now there is exactly one way through: `confirmed`. Everything else lands on
 * the locked modal, and the device passcode is offered before we conclude the
 * device cannot answer.
 *
 * What this is NOT: authentication. By the time it runs the session is already
 * restored and the token is already in the Keychain, so it stops someone
 * holding an unlocked handset and nothing else. Binding the credential itself
 * is the control that closes the rest — see biometricAuth.ts.
 */
const useChekBio = () => {
    const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLocedModelOpen, setIsLocedModelOpen] = useState<boolean>(false);
    const [lockReason, setLockReason] = useState<string>("");

    const handleUpdateModel = (value: boolean) => {
        setIsLocedModelOpen(value)
    };

    const goToDashboard = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: "Dashboard" }],
            })
        );
        setIsLoading(false);
    };

    /** Fail closed: hold the user at the lock and say why. */
    const holdAtLock = (reason: string) => {
        setLockReason(reason);
        setIsLocedModelOpen(true);
        setIsLoading(false);
    };

    const checkBio = async () => {
        // The user has not switched the lock on. Nothing to enforce.
        if (!userInfo?.isFaceRecognition) {
            goToDashboard();
            return;
        }

        const outcome = await requireUserPresence("Unlock Exchanga Pay");

        if (outcome === "confirmed") {
            goToDashboard();
            return;
        }

        // "unavailable" means this device has no biometrics AND no passcode, so
        // the lock the user asked for cannot be honoured. That is a reason to
        // stop, not a reason to continue — this was the bypass.
        log.info("[biometrics] app unlock not confirmed", { outcome });
        holdAtLock(
            describeBiometricOutcome(outcome) ||
            "We could not verify it was you."
        );
    }

    return { checkBio, isLoading, isLocedModelOpen, handleUpdateModel, lockReason }
}

export default useChekBio;
