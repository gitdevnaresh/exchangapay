import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';

const { width: WINDOW_WIDTH } = Dimensions.get('window');
export const WalletsReceiveLoader = () => {
    return (
        <View style={styles.container}>
            {/* Placeholder for the "USDC" asset selector dropdown */}
            <View style={[styles.skeleton, styles.dropdown]} />

            {/* Placeholder for the main QR Code */}
            <View style={[styles.skeleton, styles.qrCode]} />

            {/* Placeholder for the amount text (e.g., "0 USDC") */}
            <View style={[styles.skeleton, styles.amountText]} />

            {/* A container to hold the two action buttons side-by-side */}
            <View style={styles.buttonContainer}>
                {/* Placeholder for the "Set Amount" button */}
                <View style={[styles.skeleton, styles.button]} />
                {/* Placeholder for the "Share" button */}
                <View style={[styles.skeleton, styles.button]} />
            </View>
        </View>
    );
};

// StyleSheet for organizing and optimizing styles.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#000000', // Assuming a black background like in the image
    },
    // Base style for all skeleton placeholder elements
    skeleton: {
        backgroundColor: '#2C2C2E', // A subtle gray for skeleton elements on a dark background
        borderRadius: 8,
    },
    dropdown: {
        height: 40,
        width: 110,
        borderRadius: 20, // Makes it a pill shape
        marginTop: 20,
    },
    qrCode: {
        
        width: WINDOW_WIDTH * 0.7,
        height: WINDOW_WIDTH * 0.7,
        marginTop: 30,
        borderRadius: 16,
    },
    amountText: {
        height: 28,
        width: 140,
        marginTop: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    },
    button: {
        height: 52,
        width: '48%',
        borderRadius: 26, 
    },
});