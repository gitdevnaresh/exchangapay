import { color } from "react-native-elements/dist/helpers";
import { NEW_COLOR } from "../../../constants/theme/variables";
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AntDesign from 'react-native-vector-icons/AntDesign';

export const COLORS = {
    background: '#000000',
    cardBackground: '#1C1C1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    activatedGreen: '#34C759',
    frozenOrange: '#FF9500', // Color for 'Frozen' status
    pendingGrey: '#8E8E93',  // Color for 'Pending' status
    tabInactive: '#8E8E93',
    tabActive: '#FFFFFF',
    separator: '#38383A',
    errorRed: '#D92D20',

};





export const getStatusStyle = (status: any, size: number = 12) => {
    switch (status) {
        case 'active':
        case 'approved':
            // Return an object with the icon component and the color value
            return {
                icon: <FontAwesome6 name="circle-check" size={size} color={NEW_COLOR.TEXT_GREEN} />,
                color: NEW_COLOR.TEXT_GREEN
            };


        case 'freeze pending':
        case 'pending activation':
        case "pending":
        case 'unfreeze pending':
            return {
                icon: <AntDesign name="pausecircleo" size={size} color={COLORS.frozenOrange} />,
                color: COLORS.frozenOrange
            };


        case 'freezed':
            return {
                icon: <AntDesign name="infocirlceo" size={size} color={COLORS.pendingGrey} />,
                color: COLORS.pendingGrey
            };

        case 'declined':
        case 'cancelled':
            return {
                icon: <AntDesign name="closecircleo" size={size} color={COLORS.errorRed} />,
                color: COLORS.errorRed
            };
        case 'submitted':
            return {
                icon: <AntDesign name="closecircleo" size={size} color={COLORS.errorRed} />,
                color: NEW_COLOR.TEXT_BLUE
            };

        default:
            return {
                icon: <AntDesign name="questioncircleo" size={size} color={COLORS.textSecondary} />,
                color: COLORS.textSecondary
            }; 
    }
};
export const getLastFourDigits = (cardNumber: any) => {
    // Use slice(-4) to get the last 4 characters of the string.
    return cardNumber.slice(-4);
};