import React, { Component } from 'react';
import "./App.css"
import { utils, providers } from 'ethers';
import logoBasic from "./assets/logoBasic.png"
import logocp from "./assets/logocp.png"
import QRCode from 'react-qr-code';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, Input, Label, NavLink, Row } from 'reactstrap';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
// Contracts
import { abiERC20 } from "./contracts/erc20"
import Web3 from "web3";

const base64String = Buffer.from(`${process.env.REACT_APP_USER_RCP}:${process.env.REACT_APP_PASS_RCP}`).toString('base64');
const options = {
	keepAlive: true,
	withCredentials: true,
	timeout: 20000, // ms
	headers: [{ name: "Authorization", value: "Basic " + base64String }],
 };

const web3Provider = new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_RCP, options);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: 0,
      qrcode: "",
      loading: false,
      txHash: "",
      accounts: [""],
      to: "",
      amount: "",
      token: "",
      contract: "",
      articles: "",
      printing: false
    }
    this.CoinbaseWallet = new CoinbaseWalletSDK({
      appName: "CoinPoint",
      appLogoUrl:"https://general-bucket-android.s3.amazonaws.com/miniLogoCP.png",
      headlessMode: true,
      reloadOnDisconnect: true // On debug TRUE, production FALSE
    });
    this.CoinbaseProvider = this.CoinbaseWallet.makeWeb3Provider(process.env.REACT_APP_NETWORK_RCP_COINBASE, 1);
    this.web3 = new Web3(web3Provider)
    this.provider = new providers.Web3Provider(this.CoinbaseProvider)
  }

  componentDidMount() {
    this.CoinbaseProvider.on("connect", () => console.log("connect"))
    this.CoinbaseProvider.request({ method: 'eth_requestAccounts' }).then(async (accounts) => {
      this.setState({
        accounts,
        stage: 1
      })
    })
    const searchParams = new URLSearchParams(document.location.search);
    this.setState({
      qrcode: this.CoinbaseWallet.getQrUrl(),
      to: searchParams.get('to'),
      amount: searchParams.get('amount'),
      token: searchParams.get('token'),
      articles: searchParams.get('articles'),
      contract: searchParams.get('contract'),
    })
  }

  componentWillUnmount() {

  }

  async sendTransaction() {
    this.setState({
      loading: true
    })
    await this.CoinbaseProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: "0x1" }],
    });
    let transactionParameters = {}
    if (this.state.token === "ETH") {
      transactionParameters = {
        to: this.state.to,
        from: this.state.accounts[0],
        value: utils.parseEther(this.state.amount).toHexString()
      };
    }
    else {
      const contract = new this.web3.eth.Contract(abiERC20, this.state.contract, { from: this.state.accounts[0] })
      const decimals = await contract.methods.decimals().call()
      transactionParameters = {
        to: this.state.contract,
        from: this.state.accounts[0],
        data: contract.methods.transfer(this.state.to, this.web3.utils.toHex(this.state.amount * Math.pow(10, decimals))).encodeABI()
      };
    }
    try {
      const txHash = await this.CoinbaseProvider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })
      this.setState({
        txHash
      })
      let receipt = null
      receipt = setInterval(async () => {
        const transactionReceipt = await this.CoinbaseProvider.request({ method: "eth_getTransactionReceipt", params: [txHash] });
        if (transactionReceipt) {
          this.CoinbaseProvider.disconnect()
          const button = document.getElementById("finishtransaction")
          button.click();
          clearInterval(receipt)
        }
        else {
          console.log(".")
        }
      }, 1000)
    }
    catch {
      this.setState({
        loading: false
      })
    }
  }



  render() {
    return (
      <Row>
        <Card style={{ minHeight: "100vh", minWidth: "100vw" }}>
          <CardHeader style={{ textAlign: "center", fontSize: "5rem", minHeight: "10vh", background: "white" }}>
            <img src={logocp} style={{ height: 396 / 3.5 }} />
          </CardHeader>
          <div style={{ height: "0.3vh", backgroundColor: "#0052ff" }} />
          {
            // QR Code
          }
          <div hidden={!(this.state.stage === 0)}>
            <CardBody style={{ textAlign: "center", minHeight: "70vh" }}>
              <div style={{ color: "black", fontSize: "4rem", padding: "3vh 0vh" }}>
                Scan with your Coinbase Wallet
              </div>
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "94%", width: "100%", border: "10px solid #0052ff", padding: "10px" }}
                value={this.state.qrcode.replace("%3A%2F%2F", "://")}
                viewBox={`0 0 256 256`}
              />
            </CardBody>
          </div>
          {
            // Review
          }
          <div hidden={!(this.state.stage === 1)}>
            <CardBody style={{ textAlign: "center", minHeight: "70vh", fontSize: "4rem" }}>
              <div style={{ margin: "0% 10%" }}>
                <div>
                  Review your transaction
                </div>
                <hr />
                <div>
                  From:
                  <div style={{ fontSize: "3rem" }}>
                    {this.state.accounts[0].substring(0, 21)}
                    {this.state.accounts[0].substring(21, 42)}
                  </div>
                </div>
                <hr />
                <div>
                  To:
                  <div style={{ fontSize: "3rem" }}>
                    {this.state.to.substring(0, 21)}
                    {this.state.to.substring(21, 42)}
                  </div>
                </div>
                <hr />
                <div>
                  Amount: {this.state.amount}{" "}{this.state.token === "" ? "ETH" : this.state.token}
                </div>
              </div>
              <hr />
              <div style={{ paddingTop: "14vh" }} />
              <Button onClick={() => this.state.txHash ? window.open(`coinpointpos://transaction/${this.state.txHash}`) : this.sendTransaction()} style={{
                fontSize: "4.5rem",
                minWidth: "80vw",
                minHeight: "10vh",
                borderRadius: "100px",
                background: "#0052ff",
                color: "white",
                alignItems: "center",
                textAlign: "center"
              }}>
                {
                  this.state.txHash ? "Close" : this.state.loading ? "Waiting confirmation" : "Send transaction"
                }
              </Button>
            </CardBody>
          </div>
        </Card>
      </Row>
    );
  }
}

export default App;