// Basic Imports
import React, { Component } from 'react';
import { Pressable, Text, View } from 'react-native';
// Components Local
import Header from '../components/header';
// Utils 
import reactAutobind from 'react-autobind';
// Utils Local
import ContextModule from '../../utils/contextModule';
// Styles
import GlobalStyles from '../../styles/styles';
// Assets
import IconMC from 'react-native-vector-icons/MaterialIcons';

import { NODE_ENV_NETWORK_RCP, NODE_ENV_API_APIKEY, NODE_ENV_API_EXPLORER, contentColor, headerColor } from "../../../env"
import Ctransactions from './cryptoTransactions';

class CryptoMainTransactions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transactions: []
        };
        reactAutobind(this)
        this.mount = true
    }

    static contextType = ContextModule;

    componentDidMount() {
        this.props.navigation.addListener('focus', async () => {
            this.mount = true
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
            let [transactions, tokenTransactions] = await Promise.all([
                new Promise((resolve, reject) => {
                    fetch(`${NODE_ENV_API_EXPLORER}api?module=account&action=txlist&address=${this.context.value.account}&startblock=0&endblock=99999999&sort=desc&page=1&apikey=${NODE_ENV_API_APIKEY}`, requestOptions)
                        .then(response => response.text())
                        .then(result => {
                            resolve(JSON.parse(result).result)
                        })
                        .catch(error => console.log('error', error));
                }),
                new Promise((resolve, reject) => {
                    fetch(`${NODE_ENV_API_EXPLORER}api?module=account&action=tokentx&address=${this.context.value.account}&startblock=0&endblock=99999999&sort=desc&page=1&apikey=${NODE_ENV_API_APIKEY}`, requestOptions)
                        .then(response => response.text())
                        .then(result => {
                            resolve(JSON.parse(result).result)
                        })
                        .catch(error => console.log('error', error));
                })

            ])
            this.mount && this.setState({
                transactions: transactions.concat(tokenTransactions).sort((a, b) => a.timeStamp < b.timeStamp)
            },()=>console.log(transactions.concat(tokenTransactions).sort((a, b) => a.timeStamp < b.timeStamp)))
        })
        this.props.navigation.addListener('blur', () => {
            this.mount = false
        })
    }

    componentWillUnmount() {
        this.mount = false
        clearInterval(this.interval)
    }

    render() {
        return (
            <View style={GlobalStyles.container}>
                <Header />
                {
                    <View style={{ position: "absolute", top: 9, left: 18, width: 36, height: 36 }}>
                        <Pressable onPress={() => this.props.navigation.navigate('CryptoAccount')}>
                            <IconMC name="arrow-back-ios" size={36} color={headerColor} />
                        </Pressable>
                    </View>
                }
                <View style={[GlobalStyles.mainSub, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                    <Text style={{ textAlign: "center", fontSize: 24, color: "black" }}>
                        {"\n"}Transactions:{"\n"}
                    </Text>
                    <Ctransactions transactions={this.state.transactions} from={this.context.value.account} />
                </View>
            </View>
        );
    }
}

export default CryptoMainTransactions;