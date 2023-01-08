import React, { Component } from 'react';
import { Dimensions, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMCI from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Feather';
import GlobalStyles from '../styles/styles';
import Header from "./components/header"
import QRCode from 'react-native-qrcode-svg';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import { iconColor } from '../../env';
import { Picker } from 'react-native-form-component';
import { logo } from "../assets/logo"
import ContextModule from '../utils/contextModule';

import { NODE_ENV_NETWORK_APPNAME, contentColor, native, NODE_ENV_NETWORK_NAME, NODE_ENV_EXPLORER, NODE_ENV_NETWORK_RCP, tokens, tokensContracts, headerColor } from "../../env"

const networks = [
    {
        name: NODE_ENV_NETWORK_NAME,
        rpc: NODE_ENV_NETWORK_RCP
    }
]

class CbComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Vars
            stage: 0,
            tx: "",
            // Form
            place: "",
            articles: "",
            amount: 0,
            // Network and token
            network: {
                label: NODE_ENV_NETWORK_NAME,
                value: NODE_ENV_NETWORK_RCP
            },
            token: {
                label: native,
                value: ""
            },
            // Utils
            printData: ""
        }
        // Utils
        this.svg = null
        this.mount = true
    }

    static contextType = ContextModule;

    async getDataURL() {
        return new Promise(async (resolve, reject) => {
            this.svg.toDataURL(async (data) => {
                this.mount && this.setState({
                    printData: "data:image/png;base64," + data
                }, () => resolve("ok"))
            });
        })
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', () => {
            this.mount = true
            this.setState({
                // Vars
                stage: 0,
                tx: "",
                // Form
                place: "",
                articles: "",
                amount: 0,
                // Network and token
                network: {
                    label: NODE_ENV_NETWORK_NAME,
                    value: NODE_ENV_NETWORK_RCP
                },
                token: {
                    label: native,
                    value: ""
                },
                // Utils
                printData: ""
            })
        })
        this.props.navigation.addListener('blur', () => {
            this.mount = false
        })
    }

    componentDidUpdate(prevProps, prevState) {
        try {
            if (this.props?.route && this.state.tx === "") {
                this.setState({
                    tx: this.props.route.params.tx,
                    stage: 2
                })
            }
        } catch {
            // nothing
        }
    }

    componentWillUnmount() {

    }

    render() {
        return (
            <>
                <View style={GlobalStyles.container}>
                    <Header />
                    {
                        <View style={{ position: "absolute", top: 9, left: 18 }}>
                            <Pressable onPress={() => this.props.navigation.navigate('Payments')}>
                                <IconMCI name="arrow-back-ios" size={36} color={iconColor} />
                            </Pressable>
                        </View>
                    }
                    {
                        this.state.stage === 0 &&
                        <ScrollView style={[GlobalStyles.mainSub]}>
                            <View style={{ width: "90%", textAlign: "center", alignSelf: "center" }}>
                                <Picker
                                    isRequired
                                    buttonStyle={{ fontSize: 28, textAlign: "center", borderWidth: 1, borderColor: "#0052FE" }}
                                    itemLabelStyle={[{ fontSize: 24, textAlign: "center" }]}
                                    labelStyle={[{ fontSize: 28, textAlign: "center", color: "black" }]}
                                    selectedValueStyle={[{ fontSize: 28, textAlign: "center" }]}
                                    items={networks.map((item, index) => ({ label: item.name, value: item.rpc }))}
                                    label="Network"
                                    selectedValue={this.state.network.value}
                                    onSelection={
                                        (item) => {
                                            this.mount && this.setState({
                                                network: item
                                            });
                                        }
                                    }
                                />
                            </View>
                            <View style={{ width: "90%", textAlign: "center", alignSelf: "center" }}>
                                <Picker
                                    isRequired
                                    buttonStyle={{ fontSize: 28, textAlign: "center", borderWidth: 1, borderColor: "#0052FE" }}
                                    itemLabelStyle={[{ fontSize: 24, textAlign: "center" }]}
                                    labelStyle={[{ fontSize: 28, textAlign: "center", color: "black" }]}
                                    selectedValueStyle={[{ fontSize: 28, textAlign: "center" }]}
                                    items={[{ label: native, value: "" }].concat(tokens.map((item, index) => ({ label: item, value: tokensContracts[index] })))}
                                    label="Token"
                                    selectedValue={this.state.token.value}
                                    onSelection={
                                        (item) => {
                                            this.mount && this.setState({
                                                token: item
                                            });
                                        }
                                    }
                                />
                            </View>
                            <View style={{ width: "90%", textAlign: "center", alignSelf: "center", paddingBottom: 20 }}>
                                <Text style={{ fontSize: 28, fontWeight: "bold", color: "black" }}>
                                    Amount
                                </Text>
                                <TextInput
                                    style={{ fontSize: 24, textAlign: "center", borderRadius: 6, borderWidth: 1, borderColor: "#0052FE", backgroundColor: 'white', color: "black" }}
                                    keyboardType="number-pad"
                                    value={this.state.amount.toString()}
                                    onChangeText={(value) => this.mount && this.setState({ amount: value })}
                                />
                            </View>
                            <View style={{ width: "90%", textAlign: "center", alignSelf: "center", paddingBottom: 20 }}>
                                <Text style={{ fontSize: 28, fontWeight: "bold", color: "black" }}>
                                    Place
                                </Text>
                                <TextInput
                                    style={{ fontSize: 24, textAlign: "center", borderRadius: 6, borderWidth: 1, borderColor: "#0052FE", backgroundColor: 'white', color: "black" }}
                                    keyboardType="default"
                                    value={this.state.place}
                                    onChangeText={(value) => this.mount && this.setState({ place: value })}
                                />
                            </View>
                            <View style={{ width: "90%", textAlign: "center", alignSelf: "center", paddingBottom: 30 }}>
                                <Text style={{ fontSize: 28, fontWeight: "bold", color: "black" }}>
                                    Articles
                                </Text>
                                <TextInput
                                    style={{ fontSize: 24, textAlign: "center", borderRadius: 6, borderWidth: 1, borderColor: "#0052FE", backgroundColor: 'white', color: "black" }}
                                    keyboardType="default"
                                    value={this.state.articles}
                                    onChangeText={(value) => this.mount && this.setState({ articles: value })}
                                />
                            </View>
                            <Pressable style={[GlobalStyles.button, { alignSelf: "center", marginBottom: 20 }]} onPress={() => {
                                this.setState({
                                    stage: 1
                                }, () => {
                                    InAppBrowser.open(`https://main.d3ey6dtgqyp52x.amplifyapp.com/?amount=${this.state.amount}&to=${this.context.value.account}&contract=${this.state.token.value}&token=${this.state.token.label}&articles=${this.state.articles}`, []);
                                })
                            }}>
                                <Text style={[GlobalStyles.buttonText]}>
                                    Pay
                                </Text>
                            </Pressable>
                        </ScrollView>
                    }
                    {
                        this.state.stage === 1 &&
                        <ScrollView style={[GlobalStyles.mainSub]}>
                            <View style={[GlobalStyles.mainSub, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center", paddingTop: 20 }]}>
                                <Icon name="timer-sand" size={240} color={contentColor} />
                                <Text style={{ textAlign: "center", color: "black", fontSize: 30, width: "80%" }}>
                                    Waiting Confirmation...
                                </Text>
                                <Text style={{ textAlign: "center", color: "black", fontSize: 30, width: "80%" }}>
                                    Amount: {this.state.amount}{" "}{this.state.token.label}
                                </Text>
                            </View>
                        </ScrollView>
                    }
                    {
                        this.state.stage === 2 &&
                        <View style={[GlobalStyles.mainSub, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                            <Icon2 name="check-circle" size={160} color={contentColor} />
                            <Text style={{
                                textShadowRadius: 1,
                                fontSize: 28, fontWeight: "bold", color: "black"
                            }}>
                                Completed
                            </Text>
                            <Pressable style={{ marginVertical: 30 }} onPress={() =>
                                InAppBrowser.open(`${NODE_ENV_EXPLORER}tx/${this.state.tx}`, [])}>
                                <Text style={{
                                    fontSize: 24, fontWeight: "bold", color: "black", textAlign: "center"
                                }}>
                                    View on Explorer
                                </Text>
                            </Pressable>
                            <Pressable style={[GlobalStyles.button, { alignSelf: "center", marginBottom: 20 }]} onPress={async () => {
                                await this.getDataURL()
                                const results = await RNHTMLtoPDF.convert({
                                    html: (`
                                        <div style="text-align: center;">
                                        <img src='${logo}' width="450px"></img>
                                            <h1 style="font-size: 3rem;">--------- Original Reciept ---------</h1>
                                            <h1 style="font-size: 3rem;">Date: ${new Date().toLocaleDateString()}</h1>
                                            <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                            <h1 style="font-size: 3rem;">Coinbase Wallet</h1>
                                            <h1 style="font-size: 3rem;">Amount: ${this.state.amount.toString() + " "}${this.state.token.label}</h1>
                                            <h1 style="font-size: 3rem;">Place: ${this.state.place}</h1>
                                            <h1 style="font-size: 3rem;">Articles: ${this.state.articles}</h1>
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
                            <Pressable style={[GlobalStyles.button, { alignSelf: "center", marginBottom: 20 }]} onPress={() => {
                                this.props.navigation.navigate('Payments')
                            }}>
                                <Text style={[GlobalStyles.buttonText]}>
                                    Done
                                </Text>
                            </Pressable>
                        </View>
                    }
                </View>
                <View style={{ position: "absolute", bottom: -500 }}>
                    <QRCode
                        value={NODE_ENV_EXPLORER + "tx/" + this.state.tx}
                        size={Dimensions.get("window").width * 0.7}
                        ecl="L"
                        getRef={(c) => (this.svg = c)}
                    />
                </View>
            </>
        );
    }
}

export default CbComponent;