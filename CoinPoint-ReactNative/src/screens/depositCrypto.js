// Basic Imports
import React, { Component } from 'react';
import { Text, View, Pressable, Dimensions, Linking } from 'react-native';
// Components
import QRCode from 'react-native-qrcode-svg';
// Components Local
import Header from './components/header';
import Footer from './components/footer';
// Utils 
import reactAutobind from 'react-autobind';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import NfcManager, { Ndef, NfcEvents } from 'react-native-nfc-manager';
// Utils Local
import ContextModule from '../utils/contextModule';
// Assets
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialIcons';
import { logo } from "../assets/logo"
// Styles
import GlobalStyles from '../styles/styles';

import { contentColor, native, NODE_ENV_NETWORK_NAME, NODE_ENV_API_APIKEY, NODE_ENV_API_EXPLORER, NODE_ENV_EXPLORER, headerColor } from "../../env"

function epsilonRound(num, zeros = 4) {
    return Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) / Math.pow(10, zeros)
}

class DepositCrypto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memory: 0,
            qr: null,
            signature: "",
            check: false,
            printData: "",
            amount: 0,
            signature: "",
            publish: {
                message: '',
                topic: '',
            },
            token: native
        };
        reactAutobind(this)
        this.interval = null
        this.mount = true
        this.flag = true
        this.svg = null
        this.NfcManager = NfcManager
    }

    static contextType = ContextModule;

    async getDataURL() {
        return new Promise(async (resolve, reject) => {
            this.svg.toDataURL(async (data) => {
                this.setState({
                    printData: "data:image/png;base64," + data
                }, () => resolve("ok"))
            });
        })
    }

    setupNFC() {
        this.NfcManager.start()
        this.NfcManager.setEventListener(NfcEvents.DiscoverTag, this.NFCreadData);
        this.NfcManager.registerTagEvent()
    }

    NFCreadData(data) {
        let decoded = Ndef.text.decodePayload(data.ndefMessage[0].payload)
        if (decoded.length === 42) {
            this.mount && this.setState({
                publish: {
                    message: `{ "token": "${this.context.value.account}" }`,
                    topic: `/EffiSend/WalletConnect/${decoded}`,
                }
            })
        }
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', () => {
            this.interval = null
            this.mount = true
            this.flag = true
            this.svg = null
            this.setupNFC()
            this.interval = setInterval(() => {
                if (this.flag) {
                    this.flag = false
                    var myHeaders = new Headers();
                    myHeaders.append("authority", "api-moonbeam.moonscan.io");
                    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8");
                    myHeaders.append("accept-language", "en-US,en;q=0.7");
                    myHeaders.append("cache-control", "max-age=0");
                    myHeaders.append("sec-fetch-dest", "document");
                    myHeaders.append("sec-fetch-mode", "navigate");
                    myHeaders.append("sec-fetch-site", "none");
                    myHeaders.append("sec-fetch-user", "?1");
                    myHeaders.append("sec-gpc", "1");
                    myHeaders.append("upgrade-insecure-requests", "1");
                    myHeaders.append("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36");
                    const requestOptions = {
                        method: 'GET',
                        headers: myHeaders,
                        redirect: 'follow'
                    };
                    fetch(`${NODE_ENV_API_EXPLORER}api?module=account&action=txlist&address=${this.context.value.account}&startblock=0&endblock=99999999&sort=desc&page=1&apikey=${NODE_ENV_API_APIKEY}`, requestOptions)
                        .then(response => response.text())
                        .then(result => {
                            fetch(`${NODE_ENV_API_EXPLORER}api?module=account&action=tokentx&address=${this.context.value.account}&startblock=0&endblock=99999999&sort=desc&page=1&apikey=${NODE_ENV_API_APIKEY}`, requestOptions)
                                .then(responses => responses.text())
                                .then(results => {
                                    let temp = JSON.parse(result).result.concat(JSON.parse(results).result).sort((a, b) => a.timeStamp < b.timeStamp)
                                    let len = temp.length
                                    if (this.state.memory !== 0 && this.state.memory < len) {
                                        this.mount && this.setState({
                                            memory: len,
                                            check: true,
                                            signature: temp[0].hash,
                                            amount: temp[0].tokenSymbol !== undefined ? epsilonRound(temp[0].value / temp[0].tokenDecimal) : epsilonRound(temp[0].value / 1000000000000000000, 8),
                                            token: temp[0].tokenSymbol ?? native
                                        }, () => {
                                            clearInterval(this.interval)
                                        })
                                    }
                                    else {
                                        this.mount && this.setState({
                                            memory: len
                                        }, () => {
                                            this.flag = true
                                        })
                                    }
                                })
                                .catch(error => console.log('error', error));
                        })
                        .catch(error => console.log('error', error));
                }
            }, 5000);
        })
        this.props.navigation.addListener('blur', () => {
            this.setState({
                memory: 0,
                qr: null,
                signature: "",
                check: false,
                printData: "",
                amount: 0,
                signature: "",
                publish: {
                    message: '',
                    topic: '',
                }
            })
            this.mount = false
            clearInterval(this.interval)
            this.NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            this.NfcManager.unregisterTagEvent();
        })
    }

    componentWillUnmount() {
        this.mount = false
        clearInterval(this.interval)
    }

    callBackIoT = (data) => {
        console.log(data)
    }

    render() {
        return (
            <>
                <View style={GlobalStyles.container}>
                    <Header />
                    {
                        <View style={{ position: "absolute", top: 9, left: 18 }}>
                            <Pressable onPress={() => this.props.navigation.navigate('Payments')}>
                                <IconMC name="arrow-back-ios" size={36} color={headerColor} />
                            </Pressable>
                        </View>
                    }
                    {
                        !this.state.check &&
                        <View style={{ position: "absolute", top: 18, right: 18 }}>
                        
                        </View>
                    }
                    {
                        !this.state.check ?
                            <View style={[GlobalStyles.mainSub, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                                <Text style={{ textAlign: "center", color: "black", fontSize: 22, width: "80%" }}>
                                    {NODE_ENV_NETWORK_NAME} Address:
                                    {"\n"}
                                    {
                                        this.context.value.account.substring(0, 21)
                                    }
                                    {"\n"}
                                    {
                                        this.context.value.account.substring(21, 42)
                                    }
                                </Text>
                                <View style={{ borderColor: contentColor, borderWidth: 2 }}>
                                    <QRCode
                                        value={this.context.value.account}
                                        size={280}
                                        quietZone={10}
                                        ecl="H"
                                    />
                                </View>
                                <Text style={{ textAlign: "center", color: "black", fontSize: 28, width: "80%" }}>
                                    Scan with your{"\n"} mobile wallet
                                </Text>
                            </View>
                            :
                            <View style={[GlobalStyles.mainSub, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                                <Icon name="check-circle" size={160} color={contentColor} />
                                <Text style={{
                                    textShadowRadius: 1,
                                    fontSize: 28, fontWeight: "bold", color: "black"
                                }}>
                                    Completed
                                </Text>
                                <Pressable style={{ marginVertical: 30 }} onPress={() => Linking.openURL(`${NODE_ENV_EXPLORER}tx/` + this.state.signature)}>
                                    <Text style={{
                                        fontSize: 24, fontWeight: "bold", color: "black", textAlign: "center"
                                    }}>
                                        View on Explorer
                                    </Text>
                                </Pressable>
                                <Pressable style={[GlobalStyles.button]} onPress={async () => {
                                    await this.getDataURL()
                                    const results = await RNHTMLtoPDF.convert({
                                        html: (`
                                    <div style="text-align: center;">
                                    <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                    <img src='${logo}' width="450px"></img>
                                        <h1 style="font-size: 3rem;">--------- Original Reciept ---------</h1>
                                        <h1 style="font-size: 3rem;">Date: ${new Date().toLocaleDateString()}</h1>
                                        <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                        <h1 style="font-size: 3rem;">Direct Transfer</h1>
                                        <h1 style="font-size: 3rem;">Amount: ${this.state.amount.toString()} ${this.state.token + " "}</h1>
                                        <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                        <img src='${this.state.printData}'></img>
                                    </div>
                                    `),
                                        fileName: 'print',
                                        base64: true,
                                    })
                                    await RNPrint.print({ filePath: results.filePath })
                                }}>
                                    <Text style={[GlobalStyles.buttonText]}>
                                        Print Receipt
                                    </Text>
                                </Pressable>
                                <Pressable style={[GlobalStyles.button]} onPress={() => {
                                    this.props.navigation.navigate('Payments')
                                }}>
                                    <Text style={[GlobalStyles.buttonText]}>
                                        Done
                                    </Text>
                                </Pressable>
                            </View>
                    }
                </View>
                <View style={{ marginTop: Dimensions.get("window").height }}>
                    <QRCode
                        value={`${NODE_ENV_EXPLORER}tx/` + this.state.signature}
                        size={Dimensions.get("window").width * 0.7}
                        ecl="L"
                        getRef={(c) => (this.svg = c)}
                    />
                </View>
            </>
        );
    }
}

export default DepositCrypto;