import { StyleSheet, View } from "react-native";
import { commonStyles } from "../../components/CommonStyles";

export const CardApplicationLoader = () => {
    const html = <View >
        <View style={[commonStyles.mb43]} />
        <View style={{...styles.textSkeleton,height:220,width:"100%", borderRadius:32, }} />
        <View style={[commonStyles.mb32]} />
        <View style={{...styles.textSkeleton,height:164,width:"100%", borderRadius:12, }} />
        <View style={[commonStyles.mb32]} />
        <View style={{...styles.textSkeleton,height:26,width:150, borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:26,width:"100%", borderRadius:5,marginBottom:16 }} />
       
    </View>;
    return html;
};
export const CardFAQsLoader = () => {
    const html = <View >

        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
        <View style={{...styles.textSkeleton,height:40,width:"100%", borderRadius:5,marginBottom:16 }} />
       
    </View>;
    return html;
};

export const Sample = () => {
    // Generate HTML dynamically based on the data
    const html = <View style={styles.container}>
        {/* Skeleton for text */}
        <View style={{ ...styles.textSkeleton }} />

        {/* Skeleton for rectangular box */}
        <View style={styles.rectangularSkeleton} />

        {/* Skeleton for circular shape */}
        <View style={styles.circularSkeleton} />

        {/* Skeleton for image */}
        <View style={styles.imageSkeleton} />

        {/* Skeleton for horizontal line */}
        <View style={styles.horizontalLineSkeleton} />

        {/* Skeleton for vertical line */}
        <View style={styles.verticalLineSkeleton} />
    </View>;

    return html;
};
const styles = StyleSheet.create({
    dflex:{
        flexDirection:"row",
    },
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    textSkeleton: {
        height: 16,
        width: '50%',
        marginBottom: 8,
        backgroundColor: '#E1E1E1',
    },
    rectangularSkeleton: {
        height: 80,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    circularSkeleton: {
        height: 50,
        width: 50,
        borderRadius: 25,
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    imageSkeleton: {
        height: 200,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    horizontalLineSkeleton: {
        height: 1,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    verticalLineSkeleton: {
        height: 80,
        width: 1,
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
});
