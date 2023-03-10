import { Dimensions, StyleSheet } from 'react-native';
import { contentColor, headerColor, backColor } from '../../env';

const navbarHeight = Dimensions.get('screen').height - Dimensions.get('window').height;

let headerHeight = 60;
let footerHeight = 60;

const GlobalStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    containerSetup: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-evenly",
        alignItems:"center",
        backgroundColor: backColor
    },
    header: {
        width: Dimensions.get("window").width,
        height: headerHeight,
        backgroundColor: backColor,
        borderBottomColor: headerColor,
        borderBottomWidth:2
    },
    main: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height - (headerHeight + footerHeight + navbarHeight / 2),
        backgroundColor: backColor
    },
    mainSub: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height - (headerHeight + navbarHeight / 2),
        backgroundColor: backColor
    },
    footer: {
        width: Dimensions.get("window").width,
        height: footerHeight,
        backgroundColor: backColor
    },
    button:{
        borderRadius:100,
        backgroundColor:contentColor,
        padding:10,
        width:"80%"
    },
    buttonBig:{
        borderRadius:10,
        backgroundColor:contentColor,
        padding:10,
        width:"40%",
        height:"36%",
        marginVertical:30
    },
    buttonDisabled:{
        borderRadius:100,
        backgroundColor:`${contentColor}77`,
        padding:10,
        width:"80%"
    },
    buttonFooter:{
        borderRadius:20,
        paddingHorizontal:10,
        paddingVertical:8,
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center"
    },
    buttonFooterSelected: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: headerColor,
        borderRadius: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText:{
        color:"white",
        fontSize:24,
        textAlign:"center",
        fontFamily: "Helvetica",
        textShadowColor:"black",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius:6
    },
    simpleText:{
        color:"black",
        textAlign:"center",
        fontFamily: "Helvetica",
        width:"96%"
    },
    simpleTextPhrase:{
        color:"#0052FE",
        textAlign:"center",
        fontFamily: "Helvetica"
    }
});

export default GlobalStyles;