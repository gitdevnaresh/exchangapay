import { StyleSheet, View } from "react-native";

export const TotalCryptobalanceView = () => {
    const html = <View style={{ ...styles.container}}>
        <View style={{flexDirection:"row",gap:30}}>
        <View style={{ ...styles.textSkeleton, height: 30,  borderRadius: 4 ,marginBottom:32}} />
        <View style={{ ...styles.textSkeleton, height: 30,  borderRadius: 4 ,marginBottom:10,}} />
        </View>
        <View style={{ ...styles.textSkeleton, height: 50, borderRadius: 4 ,width:"100%",marginBottom:16, }} />
        <View style={{ ...styles.textSkeleton, height: 24, borderRadius: 4,width:200,marginBottom:34}} />
        <View style={{ ...styles.textSkeleton, height: 120, borderRadius: 24,width:"100%", marginBottom:34}} />
        <View style={{ ...styles.textSkeleton, height: 30, borderRadius: 4,width:"50%",marginBottom:24 }} />
        <View style={{ ...styles.textSkeleton, height: 30, borderRadius: 4,width:"100%",marginBottom:32 }} />
        <View style={{ ...styles.textSkeleton, height: 30, borderRadius: 4,width:"100%", }} />
    </View>;
    return html;
};
export const homeTotalbalanceView = () => {
    return(<View style={{ ...styles.container}}>
        <View style={{ ...styles.textSkeleton, height: 16,  borderRadius: 4,width:200 ,marginBottom:10,marginLeft:"auto",marginRight:"auto"}} />
        <View style={{ ...styles.textSkeleton, height: 30, borderRadius: 4 ,width:200,marginBottom:10, marginLeft:"auto",marginRight:"auto"}} />
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4,width:200,marginLeft:"auto",marginRight:"auto" }} />
    </View>
    );
};
export const coinGraph = () => {
    const html = <View >
        <View style={{...styles.rectangularSkeleton,height:300,width:"100%",borderRadius:12, }} />
    </View>;
    return html;
};
export const accountDasboardBalance = () => {
    const html = <View style={{ flexDirection: "row", alignItems: "center" }}>

        <View style={{ marginLeft: 20, marginTop: 10 }}>
            <View style={{ width: 120, height: 30, borderRadius: 4 }} />
            <View
                style={{ marginTop: 6, width: 150, height: 40, borderRadius: 4 }}
            />
            <View style={styles.textSkeleton} />
        </View>
    </View>;

    return html;
};
export const accountcurosalCard = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, height: 180, marginRight: 6, borderRadius: 10 }} />
        <View style={{ ...styles.textSkeleton, height: 180, borderRadius: 10 }} />
    </View>;
    return html;
};
export const homedashboardCard = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width:'100%',height: 180, marginRight: 6, borderRadius: 10 }} />
    </View>;
    return html;
};
export const homeTotalAmtCard = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width:'100%',height: 90, marginRight: 6, borderRadius: 10 }} />
    </View>;
    return html;
};
export const transactionCard = (count: number) => {
    let countList =[0];
    if(count){
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View >
        {countList.map((item)=>(
        <View key='item' style={{ ...styles.textSkeleton,width:'100%',height: 60, borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const homeTransactionCard = (count: number) => {
    let countList =[0];
    if(count){
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{marginTop:20}}>
        {countList.map((item)=>(
        <View key='item' style={{ ...styles.textSkeleton,width:'100%',height: 60, borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const homeNotifications = (count: number) => {
    let countList =[0];
    if(count){
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{marginTop:20}}>
        {countList.map((item)=>(
        <View key='item' style={{ ...styles.textSkeleton,width:'100%',height: 60, borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const cryptoPortfolioLoader = (count: number) => {
    let countList =[0];
    if(count){
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View >
        {countList.map((item)=>(
        <View key='item' style={{ ...styles.textSkeleton,width:'100%',height: 60, borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const cryptoBalanceCard = () => {
    const html = <View style={{ ...styles.container}}>
        <View style={{ ...styles.textSkeleton, height: 16,  borderRadius: 4,width:'100%' ,marginBottom:10}} />
        <View style={{ ...styles.textSkeleton, height: 30, borderRadius: 4 ,width:'100%',marginBottom:10}} />
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4,width:'100%' }} />
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
