import { StyleSheet, View } from "react-native";
export const personalInfoLoader = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 56, borderRadius: 100, marginBottom: 26 }} />))}
    </View>;
    return html;
};

export const referralDetailsSkelton = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 140, marginRight: 6, borderRadius: 10 }} />
    </View>;
    return html;
};
export const baseCurrencySkelton = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 120, marginRight: 6, borderRadius: 10 }} />
    </View>;
    return html;
};
export const referralBtnSkelton = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 50, marginRight: 6, borderRadius: 10 }} />
    </View>;
    return html;
};
export const profileImageSkelton = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width: 50, height: 50, marginRight: 6, borderRadius: 60 }} />
    </View>;
    return html;
};
export const securitySkeltonVerify = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 45, borderRadius: 6, marginBottom: 26 }} />))}
    </View>;
    return html;
};
export const securityCEnterVerify = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item) => (<View>
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 20, borderRadius: 6, marginBottom: 16, marginLeft: "auto", marginRight: "auto" }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 45, borderRadius: 6, marginBottom: 16, marginLeft: "auto", marginRight: "auto" }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 20, borderRadius: 6, marginBottom: 26, marginLeft: "auto", marginRight: "auto" }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 70, borderRadius: 100, marginBottom: 26 }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 20, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 15, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 70, borderRadius: 100, marginBottom: 26 }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 15, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 70, borderRadius: 100, marginBottom: 26 }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 15, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 15, borderRadius: 6, marginBottom: 32, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 20, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 15, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 15, borderRadius: 6, marginBottom: 32, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 20, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 15, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 15, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 20, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 15, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 15, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '50%', height: 20, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 15, borderRadius: 6, marginBottom: 16, }} />
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 15, borderRadius: 6, marginBottom: 16, }} />
        </View>
        ))}
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
export const progressSkeltons = () => {
    const html = 
    <View style={{ ...styles.container }}>
         <View style={{flexDirection:"row" ,width: '100%',gap:10}}>
         <View style={styles.accountHeader} />
         <View style={{ ...styles.textSkeleton, width: 70, height: 70, marginRight: 6, borderRadius: 60 }} />

         </View>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 350, marginRight: 6, borderRadius: 10 }} />
  <View style={styles.borderBtn} />
    </View>;
    
    return html;
};



const styles = StyleSheet.create({
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
    borderBtn: {
        height: 80,
        width: '100%',
        marginBottom: 30,
        backgroundColor: '#E1E1E1',
        borderRadius:10
    },
    accountHeader:{
        height: 80,
        width: '80%',
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
        borderRadius:10   
    }
});
