import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AntDesign} from '@expo/vector-icons';
import { s } from '../../constants/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';

// Define the colors (this part doesn't change)
const colors = {
    completed: '#059669',
    pending: '#E1E31E',
    failed: '#E74C3C',
    refund: '#3B82F6',
    reversal: '#EF4444',
    success:'#10B981',
    review:'#FACC15'


};

// This is now our main, exported component.
// It takes a 'status' prop to decide what to render.
const TransactionStatus = ({ status }) => {
    let iconName;
    let color;
    let text;

    // The switch statement checks the 'status' prop
    switch (status) {
        case 'completed':
        case 'approved':
            iconName = 'checkcircleo';
            color = colors.completed;
            text = 'Completed';
            break;
        case 'pending':
        case 'submitted':
            iconName = 'clockcircleo';
            color = colors.pending;
            text = 'Pending';
            break;
        case 'failed':
        case 'rejected':
            iconName = 'closecircleo';
            color = colors.failed;
            text = 'Failed';
            break;
        default:
            // If an unknown status is passed, render nothing
            return null;
    }

const NEW_COLOR = useThemeColors();
const commonStyles = getThemedCommonStyles(NEW_COLOR);



    // It returns the JSX for only the one status that matched
    return (
        <View style={styles.container}>
            <AntDesign name={iconName} size={s(18)} color={color} />
            <Text style={[commonStyles.fs14, commonStyles.fw500,commonStyles.ml8, { color: color }]}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10, // Add some padding for spacing
    },
    text: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
    },
});

// Export the modified component as the default
export default TransactionStatus;