import React, { Component } from "react";
import { drizzleConnect } from "@drizzle/react-plugin";
import PropTypes from "prop-types";
import web3 from "web3-utils";
import Split from "../layout/Split";
import { Box, Flex } from "@rebass/grid";
import Logo from "../basics/Logo";
import Text from "../basics/Text";
import Form from "../basics/Form.js";
import { G } from "../basics/Colors";
import { autoBind } from "react-extras";
import Triangle from "../basics/Triangle";
import ButtonEthScan from "../basics/ButtonEthScan.js";
import Input from "../basics/Input.js";
import Button from "../basics/Button.js";
// import ButtonI from '../basics/ButtonI.js';
import TruncatedAddress from "../basics/TruncatedAddress.js";
//import TruncatedAddress0 from '../basics/TruncatedAddress0.js';
import VBackgroundCom from "../basics/VBackgroundCom";
import BettingContract from "../../contracts/solidityjson/Betting.json";
// import Form from '../basics/Form.js'
var moment = require("moment");
var momentTz = require("moment-timezone");

class BigBetPagejs extends Component {
  constructor(props, context) {
    super(props);
    autoBind(this);

    this.contracts = context.drizzle.contracts;
    this.web3 = web3;
    this.BetHistory = [];
    this.currentOffers = [];
    this.scheduleStringkey = [];
    this.takekeys = {};
    this.takekeys2 = {};

    this.state = {
      contractID: "",
      betAmount: "",
      teamPick: null,
      matchPick: null,
      teamTake: false,
      showDecimalOdds: false,
      BetSize: false,
      decOddsOffered: 0,
      fundAmount: 0,
      wdAmount: "",
      bigBets: [],
      bigBetsSet: false,
      decTransform1: "",
      currW: "",
    };
  }

  componentDidMount() {
    document.title = "Big Bet Page";
    this.getAllBetHistoryArrays();
    setInterval(() => {
      this.findValues();
      this.getWeek();
    }, 5000);
  }

  getAllBetHistoryArrays(){
    this.getbetHistoryArray();
    this.getbetHistoryArray2();
  }
  openEtherscan(txhash) {
    const url = "https://rinkeby.etherscan.io/tx/" + txhash;
    window.open(url, "_blank");
  }

  handleBetSize(betAmount) {
    this.setState({ betAmount });
  }

  handleBettorFund(value) {
    this.setState({
      fundAmount: value,
    });
  }

  handlefundBook(fundAmount) {
    this.setState({ fundAmount });
  }

  handleOddsOffered(decOddsOffered) {
    this.setState({ decOddsOffered });
  }

  toggle() {
    const currentState = this.state.details;
    this.setState({ details: !currentState });
  }

  switchOdds() {
    this.setState({ showDecimalOdds: !this.state.showDecimalOdds });
  }

  killBet(x) {
    const stackId = this.contracts[
      "BettingMain"
    ].methods.cancelBigBet.cacheSend(x, {
      from: this.props.accounts[0],
      type: "0x2",
    });
    setTimeout(this.getbetHistoryArray(), 5000);
  }

  handleBettorWD(value2) {
    this.setState({
      wdAmount: value2,
      type: "0x2",
    });
  }

  fundBettor(x) {
    const stackId = this.contracts["BettingMain"].methods.fundBettor.cacheSend({
      from: this.props.accounts[0],
      value: web3.toWei(this.state.fundAmount, "finney"),
      type: "0x2",
    });
  }

  withdrawBettor(x) {
    const stackId = this.contracts[
      "BettingMain"
    ].methods.withdrawBettor.cacheSend(
      web3.toWei(this.state.wdAmount.toString(), "finney"),
      {
        from: this.props.accounts[0],
        type: "0x2",
      }
    );
  }

  makeBigBet() {
    const stackId = this.contracts["BettingMain"].methods.postBigBet.cacheSend(
      this.state.matchPick,
      this.state.teamPick,
      web3.toWei(this.state.betAmount, "finney"),
      this.state.decOddsOffered,
      {
        from: this.props.accounts[0],
        type: "0x2",
      }
    );
  }

  takeBigBet() {
    const stackId = this.contracts["BettingMain"].methods.takeBigBet.cacheSend(
      this.state.contractID,
      {
        from: this.props.accounts[0],
        type: "0x2",
      }
    );
  }


  getbetHistoryArray() {
    const web3b = this.context.drizzle.web3;
    const contractweb3b = new web3b.eth.Contract(
      BettingContract.abi,
      BettingContract.address
    );
    var eventdata = [];
    var takes = {};
    console.log("getbetHistoryArray");
    contractweb3b
      .getPastEvents("BetBigRecord", {
        fromBlock: 8999000,
        toBlock: "latest",
        filter: { bettor: this.props.accounts[0] },
      })
      .then(
        function (events) {
          events.forEach(function (element) {
            eventdata.push({
              Hashoutput: element.returnValues.contractHash,
              BettorAddress: element.returnValues.bettor,
              timestamp: element.returnValues.timestamp,
              Epoch: element.returnValues.epoch,
              LongPick: Number(element.returnValues.pick),
              MatchNum: element.returnValues.matchnum,
              BetSize: Number(
                web3.fromWei(element.returnValues.betsize.toString(), "finney")
              ),
            });
            takes[element.returnValues.contractHash] = this.contracts[
              "BettingMain"
            ].methods.checkRedeem.cacheCall(element.returnValues.contractHash);
          }, this);
          this.BetHistory[0] = eventdata;
          this.takekeys = takes;
        }.bind(this)
      );

    contractweb3b.events.BetBigRecord(
      function (error, log) {
      //  console.log({ log });
        this.BetHistory[0].push({
          Hashoutput: log.returnValues.contractHash,
          BettorAddress: log.returnValues.bettor,
          Epoch: log.returnValues.epoch,
          timestamp: log.blockNumber.timestamp,
          BetSize: web3.fromWei(log.returnValues.betsize.toString(), "finney"),
          LongPick: Number(log.returnValues.pick),
          MatchNum: log.returnValues.matchnum,
        });
        this.takekeys[log.returnValues.contractHash] = this.contracts[
          "BettingMain"
        ].methods.checkRedeem.cacheCall(log.returnValues.contractHash);
      }.bind(this)
    );
  }

  getbetHistoryArray2() {
    const web3b = this.context.drizzle.web3;
    const contractweb3b = new web3b.eth.Contract(
      BettingContract.abi,
      BettingContract.address
    );
    var eventdata2 = [];
    var takes2 = {};
    var cw = this.state.currW;

    contractweb3b
      .getPastEvents("BetBigRecord", {
        fromBlock: 8999000,
        toBlock: "latest",
        filter: { epoch: this.state.currW },
      })
      .then(
        function (events) {

          events.forEach(function (element) {
            if (
              this.contracts["BettingMain"].methods.checkRedeem.cacheCall(
                element.returnValues.contractHash
              )
            ) {
              eventdata2.push({
                Hashoutput2: element.returnValues.contractHash,
                BetSizeOffered2: Number(
                  web3.fromWei(element.returnValues.payoff.toString(), "finney")
                ),
                OfferedTeam2: Number(1 - element.returnValues.pick),
                OfferEpoch2: element.returnValues.epoch,
                OfferedMatch2: element.returnValues.matchnum,
                BetPayoffOffered2: Number(
                  web3.fromWei(
                    element.returnValues.betsize.toString(),
                    "finney"
                  )
                ),
              });
              takes2[element.returnValues.contractHash] = this.contracts[
                "BettingMain"
              ].methods.checkRedeem.cacheCall(
                element.returnValues.contractHash
              );
            }
          }, this);
          this.currentOffers = eventdata2;
          this.takekeys2 = takes2;
        }.bind(this)
      );

    contractweb3b.events.BetBigRecord(
      function (error, log) {
        //console.log({ log });
        this.currentOffers.push({
          Hashoutput2: log.returnValues.contractHash,
          BetSizeOffered2: Number(
            web3.fromWei(log.returnValues.payoff.toString(), "finney")
          ),
          OfferedTeam2: Number(1 - log.returnValues.pick),
          OfferEpoch2: log.returnValues.epoch,
          OfferedMatch2: log.returnValues.matchnum,
          BetPayoffOffered2: Number(
            web3.fromWei(log.returnValues.betsize.toString(), "finney")
          ),
        });
        this.takekeys2[log.returnValues.contractHash] = this.contracts[
          "BettingMain"
        ].methods.checkRedeem.cacheCall(log.returnValues.contractHash);
      }.bind(this)
    );
  }

  radioFavePick(matchpic) {
    this.setState({ matchPick: matchpic, teamTake: false, teamPick: 0 });
  }

  radioUnderPick(matchpic) {
    this.setState({ matchPick: matchpic, teamTake: false, teamPick: 1 });
  }

  radioTeamPickTake(betamt0, hash0, odds0) {
    this.setState({
      teamTake: true,
      contractID: hash0,
      betAmount: betamt0,
      decOddsOffered: odds0,
    });
  }

  sortByBetSize() {
    if (this.state.BetSize) {
      this.state.bigBets.sort(function (a, b) {
        return a.BigBetSize - b.BigBetSize;
      });
      this.setState({ BetSize: false });
    } else {
      this.state.bigBets.sort(function (a, b) {
        return b.BigBetSize - a.BigBetSize;
      });
      this.setState({ BetSize: true });
    }
  }

  findValues() {
    this.weekKey = this.contracts["BettingMain"].methods.betEpoch.cacheCall();

    this.userBalKey = this.contracts[
      "BettingMain"
    ].methods.userBalance.cacheCall(this.props.accounts[0]);

    this.startTimeKey = this.contracts[
      "BettingMain"
    ].methods.showStartTime.cacheCall();

    this.decOddsKey = this.contracts[
      "BettingMain"
    ].methods.showDecimalOdds.cacheCall();

    this.scheduleStringKey = this.contracts[
      "BettingMain"
    ].methods.showSchedString.cacheCall();
  }

  getMoneyLine(decOddsi) {
    let moneyline = 0;
    if (decOddsi < 1000) {
      moneyline = -1e5 / (decOddsi);
    } else {
      moneyline = (decOddsi) / 10;
    }
    moneyline = moneyline.toFixed(0);
    if (moneyline > 0) {
      moneyline = "+" + moneyline;
    }
    return moneyline;
  }

  translateMoneyLine(moneyline0) {
    let decTransform1 = 0;
    if (moneyline0 < 100) {
      decTransform1 = -(100 - moneyline0) / moneyline0;
    } else {
      decTransform1 = moneyline0 / 100 + 1;
    }
    decTransform1 = decTransform1.toFixed(3);
    this.setState({ decTransform1 });
  }

  getWeek() {
    let currW = 0;
    if (this.weekKey in this.props.contracts["BettingMain"].betEpoch) {
      currW = this.props.contracts["BettingMain"].betEpoch[this.weekKey].value;
      currW = Number(currW);
    }
    this.setState({ currW });
  }

  render() {
    /*
    let currW4 = 0;
    if (this.weekKey in this.props.contracts["BettingMain"].betEpoch) {
      currW4 = this.props.contracts["BettingMain"].betEpoch[this.weekKey].value;
    }*/

    let minBet = 0;
    if (this.minBetKey in this.props.contracts["BettingMain"].minBet) {
      minBet = this.props.contracts["BettingMain"].minBet[this.minBetKey].value;
    }

    let subcontracts = {};
    Object.keys(this.takekeys).forEach(function (id) {
      if (
        this.takekeys[id] in this.props.contracts["BettingMain"].checkRedeem
      ) {
        subcontracts[id] = this.props.contracts["BettingMain"].checkRedeem[
          this.takekeys[id]
        ].value;
      }
    }, this);

    let subcontracts2 = {};
    Object.keys(this.takekeys).forEach(function (id) {
      if (
        this.takekeys[id] in this.props.contracts["BettingMain"].checkRedeem
      ) {
        subcontracts2[id] = this.props.contracts["BettingMain"].checkRedeem[
          this.takekeys[id]
        ].value;
      }
    }, this);

    let decodds0 = [950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950];
    if (
      this.decOddsKey in this.props.contracts["BettingMain"].showDecimalOdds
    ) {
      let d0 = this.props.contracts["BettingMain"].showDecimalOdds[
        this.decOddsKey
      ].value;
      if (d0) {
        decodds0 = d0;
      }
    }

    let startTimeColumn = [1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932, 1640455932];
    if (
      this.startTimeKey in this.props.contracts["BettingMain"].showStartTime
    ) {
      let st = this.props.contracts["BettingMain"].showStartTime[
        this.startTimeKey
      ].value;
      if (st) {
        startTimeColumn = st;
      }
    }

    let userBalance = "0";
    if (this.userBalKey in this.props.contracts["BettingMain"].userBalance) {
      let ub = this.props.contracts["BettingMain"].userBalance[this.userBalKey]
        .value;
      if (ub) {
        userBalance = web3.fromWei(ub.toString(), "finney");
      }
    }
    /*
    console.log("state", this.BetHistory[0]);
    console.log("pass", this.currentOffers);
*/
    let oddsTot = [[], []];

    for (let i = 0; i < 32; i++) {
      oddsTot[0][i] = Number(decodds0[i]);
      oddsTot[1][i] = 1e6 / (Number(decodds0[i]) + 45) - 45;
    }

    let scheduleString = [
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
      "loading:...:...",
    ];

    if (
      this.scheduleStringKey in
      this.props.contracts["BettingMain"].showSchedString
    ) {
      let sctring = this.props.contracts["BettingMain"].showSchedString[
        this.scheduleStringKey
      ].value;
      if (sctring) {
        scheduleString = sctring;
      }
    }

    let faveSplit = [];
    let underSplit = [];
    let sport = [];
    let teamSplit = [];
    for (let i = 0; i < 32; i++) {
      if (scheduleString[i] !== "") {
        teamSplit[i] = scheduleString[i].split(":");
        sport[i] = teamSplit[i][0];
        faveSplit[i] = teamSplit[i][1];
        underSplit[i] = teamSplit[i][2];
      } else {
        sport[i] = "na";
        faveSplit[i] = "na";
        underSplit[i] = "na";
      }
    }

    let teamList = [];

    const borderCells = 5;

    for (let i = 0; i < 32; i++) {
      teamList.push(
        <tr
          className={(i + 1) % borderCells === 0 ? "border-row" : ""}
          key={i}
          style={{ width: "60%", textAlign: "left" }}
        >
          <td>{i}</td>
          <td>{sport[i]}</td>
          <td style={{ textAlign: "left", paddingLeft: "15px" }}>
            {startTimeColumn[i] > moment().unix() ? (
              <input
                type="radio"
                value={i}
                name={"teamRadio"}
                onChange={({ target: { value } }) => this.radioFavePick(value)}
                className="teamRadio"
              />
            ) : (
              <span className="circle"></span>
            )}{" "}
            {faveSplit[i]}
          </td>
          <td>
            {this.state.showDecimalOdds
              ? (1 + (95 * oddsTot[0][i]) / 100000).toFixed(3)
              : this.getMoneyLine((95 * oddsTot[0][i]) / 100)}
          </td>
          <td style={{ textAlign: "left", paddingLeft: "15px" }}>
            {startTimeColumn[i] > moment().unix() ? (
              <input
                type="radio"
                value={i}
                name={"teamRadio"}
                onChange={({ target: { value } }) => this.radioUnderPick(value)}
                className="teamRadio"
              />
            ) : (
              <span className="circle"></span>
            )}{" "}
            {underSplit[i]}
          </td>
          <td>
            {this.state.showDecimalOdds
              ? (1 + (95 * oddsTot[1][i]) / 100000).toFixed(3)
              : this.getMoneyLine(oddsTot[1][i])}
          </td>
          <td>{moment.unix(startTimeColumn[i]).format("MMMDD-ha")}</td>
        </tr>
      );
    }

    let bigBets = [];

    this.currentOffers.map((bet) => {
      let bigBet = {
        teamAbbrevName: teamSplit[bet.OfferedMatch2][bet.OfferedTeam2 + 1],
        BigBetSize: Number(bet.BetSizeOffered2 / 0.95).toFixed(3),
        BigOdds: (
          (0.95 * bet.BetPayoffOffered2) / bet.BetSizeOffered2 +
          1
        ).toFixed(3),
        OfferHash: bet.Hashoutput2,
        OfferedEpoch: bet.OfferEpoch2,
        OfferTeamNum: bet.OfferedTeam2,
        BigMatch: bet.OfferedMatch2,
      };
      bigBets.push(bigBet);
    });

    if (!this.state.bigBetsSet && bigBets.length > 0) {
      this.setState({ bigBets });
      this.setState({ bigBetsSet: true });
    }

    return (
      <div>
        <VBackgroundCom />
        <Split
          page={"bookies"}
          side={
            <Box mt="30px" ml="25px" mr="35px">
              <Logo />
              <Box>
                <Flex
                  mt="20px"
                  flexDirection="row"
                  justifyContent="space-between"
                ></Flex>
                <Flex style={{ borderTop: `thin solid ${G}` }}></Flex>
              </Box>
              <Box>
                <Flex>
                  <Text size="20px">
                    <a
                      className="nav-header"
                      style={{
                        cursor: "pointer",
                      }}
                      href="/bookiepage"
                      target="_blank"
                    >
                      Go to Bookie Page
                    </a>
                  </Text>
                </Flex>
              </Box>
              <Box>
                <Flex>
                  <Text size="20px">
                    <a
                      className="nav-header"
                      style={{
                        cursor: "pointer",
                      }}
                      href="/betpage"
                      target="_blank"
                    >
                      Go to Bet Page
                    </a>
                  </Text>
                </Flex>
              </Box>
              <Box>
                <Flex
                  width="100%"
                  alignItems="center"
                  justifyContent="marginLeft"
                >
                  <Text size="20px">
                    <a
                      className="nav-header"
                      style={{
                        cursor: "pointer",
                      }}
                      href="/"
                    >
                      HomePage
                    </a>
                  </Text>
                </Flex>
              </Box>
              <Box mb="10px" mt="10px">
                <Text>Your address</Text>
                <TruncatedAddress
                  addr={this.props.accounts[0]}
                  start="8"
                  end="6"
                  transform="uppercase"
                  spacing="1px"
                />
                <Text>Your available margin: </Text>
                <Text>{Number(userBalance).toFixed(2)}</Text>
              </Box>
              <Box>
                <Flex
                  mt="5px"
                  flexDirection="row"
                  justifyContent="space-between"
                ></Flex>
              </Box>
              <Flex>
                <Box mt="1px" mb="1px">
                  <button
                    style={{
                      backgroundColor: "#424242",
                      borderRadius: "2px",
                      cursor: "pointer",
                    }}
                    onClick={() => this.switchOdds()}
                  >
                    {this.state.showDecimalOdds
                      ? "show MoneyLine"
                      : "show DecimalOdds"}
                  </button>{" "}
                </Box>
              </Flex>{" "}
              <Box>
                <Flex
                  style={{
                    borderTop: `thin solid ${G}`,
                  }}
                ></Flex>
              </Box>
              {this.props.transactionStack.length > 0 &&
              this.props.transactionStack[0].length === 66 ? (
                <Flex alignItems="center">
                  <ButtonEthScan
                    onClick={() =>
                      this.openEtherscan(this.props.transactionStack[0])
                    }
                    style={{ height: "30px" }}
                  >
                    See Transaction Detail on Ethscan
                  </ButtonEthScan>
                </Flex>
              ) : null}
              <Flex justifyContent="left">
                <Text size="15px">Active Week: {this.state.currW}</Text>
              </Flex>
              <br />
              <Flex>
                {Object.keys(this.BetHistory).map((id) => (

                  <div style={{ width: "100%", float: "left" }}>
                    <div>
                        <button
                        style={{
                          backgroundColor: "#424242",
                          borderRadius: "2px",
                          cursor: "pointer",
                        }}
                        onClick={() => this.getAllBetHistoryArrays()}
                      >
                        Refresh Bet History
                      </button>
                    </div>
                    <Text> Your Unclaimed Offers</Text>
                    <br />
                    <table style={{ width: "100%", fontSize: "12px" }}>
                      <tbody>
                        <tr style={{ width: "50%" }}>
                          <td>Week</td>
                          <td>Bet Size</td>
                          <td>contractID</td>
                          <td>Click to Cancel</td>
                        </tr>
                        {this.BetHistory[id].map(
                          (event, index) =>
                            subcontracts[event.Hashoutput] && (
                              <tr key={index} style={{ width: "50%" }}>
                                <td>{event.Epoch}</td>
                                <td>{Number(event.BetSize).toFixed(2)}</td>

                                <td>
                                  <TruncatedAddress
                                    addr={event.Hashoutput}
                                    start="8"
                                    end="0"
                                    transform="uppercase"
                                    spacing="1px"
                                  />{" "}
                                </td>
                                <td>
                                  <button
                                    style={{
                                      backgroundColor: "#424242",
                                      borderRadius: "5px",
                                      cursor: "pointer",
                                    }}
                                    value={event.Hashoutput}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      this.killBet(event.Hashoutput);
                                    }}
                                  >
                                    Refund
                                  </button>
                                </td>
                              </tr>
                            )
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </Flex>
              <Box>
                <Flex
                  style={{
                    borderTop: `thin solid ${G}`,
                  }}
                ></Flex>
              </Box>
              <Flex
                mt="5px"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
              >
                <Box>
                  <Flex
                    mt="20px"
                    flexDirection="row"
                    justifyContent="space-between"
                  ></Flex>
                </Box>

                <Box>
                  <Form
                    onChange={this.handleBettorWD}
                    value={this.state.wdAmount}
                    onSubmit={this.withdrawBettor}
                    mb="20px"
                    justifyContent="flex-start"
                    buttonWidth="95px"
                    inputWidth="100px"
                    borderRadius="2px"
                    placeholder="eth"
                    buttonLabel="WithDraw"
                  />
                </Box>
                <Box mt="10px" mb="10px" ml="80px" mr="80px"></Box>
              </Flex>
              <Box>
                <Flex
                  style={{
                    borderTop: `thin solid ${G}`,
                  }}
                ></Flex>
              </Box>
              <Flex
                mt="5px"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
              >
                <Box>
                  <Form
                    onChange={this.handleBettorFund}
                    value={this.state.fundAmount}
                    onSubmit={this.fundBettor}
                    mb="20px"
                    justifyContent="flex-start"
                    buttonWidth="95px"
                    inputWidth="100px"
                    borderRadius="2px"
                    placeholder="eth"
                    buttonLabel="Fund"
                  />
                </Box>

                <Box mt="10px" mb="10px" ml="80px" mr="80px"></Box>
              </Flex>
              <Box>
                <Box>
                  <Text> MoneyLine to Decimal odds converter</Text>
                </Box>

                <Flex mt="10px" mb="10px">
                  <Text width="50%">MoneyLine: </Text>
                  <Input
                    onChange={({ target: { value } }) =>
                      this.translateMoneyLine(value)
                    }
                    width="151px"
                    placeholder={"enterML"}
                    marginLeft="10px"
                    marginRight="5px"
                  />
                </Flex>
                <Flex>
                  <Text width="50%">Decimal odds:</Text>
                  <Text> {this.state.decTransform1}</Text>
                </Flex>
              </Box>
            </Box>
          }
        >
          <Flex justifyContent="center">
            <Text size="25px">Place, Take and Cancel Big Bets</Text>
          </Flex>

          <Box mt="15px" mx="30px">
            <Flex width="100%" justifyContent="marginLeft">
              <Text size="14px" weight="300">
                {" "}
                This page is for those who want to offer or take bets larger
                than what is offered on the main betting page. Toggle the match
                and team you want to bet on, and the offers, if any, will appear
                below. You can place your showLongs large bet above. Your
                unclaimed bets are on the left tab (this sends your eth back).
                Enter odds in decimal form. For example, a MoneyLine -110 bet is
                equivalent to 1.909 decimal odds, and you would enter it as
                1.909. These are the odds you are asking for on your bet.
              </Text>
            </Flex>
          </Box>

          {this.state.teamPick != null && !this.state.teamTake ? (
            <Flex
              mt="10px"
              pt="10px"
              alignItems="center"
              style={{
                borderTop: `thin solid ${G}`,
              }}
            >
              <Flex
                style={{
                  color: "#0099ff",
                  fontSize: "13px",
                }}
              >
                <Text size="16px" weight="400">
                  Sport:{teamSplit[this.state.matchPick][0]}
                  {"  "}
                  pick:
                  {
                    teamSplit[this.state.matchPick][
                      Number(this.state.teamPick) + 1
                    ]
                  }
                  {"    "}
                  opponent:{" "}
                  {
                    teamSplit[this.state.matchPick][
                      2 - Number(this.state.teamPick)
                    ]
                  }
                  <br></br>
                  Standard Book Odds:{" "}
                  {(
                    oddsTot[this.state.teamPick][this.state.matchPick] / 1000 +
                    1
                  ).toFixed(3)}
                  {"  (MoneyLine "}
                  {this.getMoneyLine(
                    oddsTot[this.state.teamPick][this.state.matchPick]
                  )}
                  {")   "}
                  <br></br>
                  <br></br>{" "}
                </Text>
              </Flex>
            </Flex>
          ) : null}

          <Flex>
            {this.state.teamPick != null && !this.state.teamTake ? (
              <Flex
                mt="5px"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
              >
                <Input
                  onChange={({ target: { value } }) =>
                    this.handleBetSize(value)
                  }
                  width="100px"
                  placeholder={"Enter Eths"}
                  marginLeft="10px"
                  marginRignt="5px"
                  value={this.state.betAmount}
                />

                <Input
                  onChange={({ target: { value } }) =>
                    this.handleOddsOffered(value * 1000)
                  }
                  width="151px"
                  placeholder={"DecOdds e.g. 1.909"}
                  marginLeft="10px"
                  marginRignt="5px"
                  value={this.state.decOddsOffered}
                />

                <Box mt="10px" mb="10px">
                  <Button
                    style={{
                      height: "30px",
                      width: "200px",
                      float: "right",
                      marginLeft: "5px",
                    }}
                    onClick={() => this.makeBigBet()}
                  >
                    Click to Submit{" "}
                  </Button>
                </Box>

                <Box mt="10px" mb="10px" ml="80px" mr="80px"></Box>
              </Flex>
            ) : null}
          </Flex>

          <Flex
            style={{
              color: "#0099ff",
              fontSize: "13px",
            }}
          >
            {this.state.teamTake === true ? (
              <Text size="14px" weight="400">
                <Box mt="10px" mb="10px" ml="40px" mr="40px"></Box>
                <Box mt="10px" mb="10px" ml="40px" mr="40px">
                  <Button
                    style={{
                      height: "30px",
                      width: "500px",
                      float: "left",
                      marginLeft: "5px",
                    }}
                    onClick={() => this.takeBigBet()}
                  >
                    Take {Number(this.state.betAmount).toFixed(3)} on{" "}
                    {
                      teamSplit[this.state.matchPick][
                        1 + Number(this.state.teamPick)
                      ]
                    }{" "}
                    {"  "}
                    at odds {Number(this.state.decOddsOffered).toFixed(3)}
                    {" (MoneyLine "}
                    {this.getMoneyLine(
                      Number(this.state.decOddsOffered) * 1000 - 1000
                    )}
                    {")"}{" "}
                  </Button>{" "}
                </Box>
                <Box></Box>
                <br />
                <Box mt="10px" mb="10px" ml="40px" mr="40px"></Box>
              </Text>
            ) : null}
          </Flex>

          <Flex>
            {this.state.teamPick !== null ? (
              <div>
                <Box mt="10px" mb="10px" ml="40px" mr="40px"></Box>
                <Text>Current Offers</Text>
                <Box mt="10px" mb="10px" ml="40px" mr="40px"></Box>
                <table
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    tableLayout: "fixed",
                  }}
                >
                  <thead>
                    <tr style={{ width: "100%" }}>
                      <td>take </td>
                      <td
                        onClick={() => this.sortByBetSize()}
                        style={{ cursor: "pointer" }}
                      >
                        Size
                        <Triangle
                          rotation={!this.state.BetSize ? "180deg" : ""}
                          scale="0.8"
                          fill
                          color="white"
                        />
                      </td>
                      <td>Offered Odds</td>
                      <td>ContractID</td>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.bigBets.length > 0 &&
                      this.state.bigBets.map(
                        (bet, index) =>
                          bet.OfferTeamNum == this.state.teamPick &&
                          bet.BigMatch == this.state.matchPick &&
                          subcontracts2[bet.OfferHash] && (
                            <tr style={{ width: "100%" }}>
                              <td>
                                <input
                                  type="radio"
                                  value={bet.OfferTeamNum}
                                  name={bet.teamAbbrevName}
                                  onChange={({ target: { value } }) =>
                                    this.radioTeamPickTake(
                                      bet.BigBetSize,
                                      bet.OfferHash,
                                      bet.BigOdds
                                    )
                                  }
                                />
                              </td>
                              <td>{Number(bet.BigBetSize).toFixed(3)}</td>
                              <td>{Number(bet.BigOdds).toFixed(3)}</td>
                              <td>
                                <TruncatedAddress
                                  addr={bet.OfferHash}
                                  start="8"
                                  end="0"
                                  transform="uppercase"
                                  spacing="1px"
                                />{" "}
                              </td>
                            </tr>
                          )
                      )}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Flex>

          <Flex
            mt="10px"
            pt="10px"
            alignItems="center"
            style={{
              borderTop: `thin solid ${G}`,
            }}
          ></Flex>

          <Box>
            <Flex
              mt="20px"
              flexDirection="row"
              justifyContent="space-between"
            ></Flex>
          </Box>

          <Box>
            {" "}
            <Flex
              mt="20px"
              flexDirection="row"
              justifyContent="space-between"
            ></Flex>
          </Box>
          <div>
            <Box>
              {" "}
              <Flex>
                <table
                  style={{
                    width: "100%",
                    borderRight: "1px solid",
                    float: "left",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    <tr style={{ width: "50%", textAlign: "left" }}>
                      <th>Match</th>
                      <th>sport</th>
                      <th style={{ textAlign: "left" }}>Favorite</th>
                      <th style={{ textAlign: "left" }}>
                        {this.state.showDecimalOdds ? "DecOdds" : "MoneyLine"}
                      </th>
                      <th style={{ textAlign: "left" }}>Underdog</th>
                      <th style={{ textAlign: "left" }}>
                        {this.state.showDecimalOdds ? "DecOdds" : "MoneyLine"}
                      </th>
                      <th style={{ textAlign: "left" }}>Start</th>
                    </tr>
                    {teamList}
                  </tbody>
                </table>
              </Flex>{" "}
            </Box>
          </div>
        </Split>
      </div>
    );
  }
}

BigBetPagejs.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    accounts: state.accounts,
    contracts: state.contracts,
    drizzleStatus: state.drizzleStatus,
    transactions: state.transactions,
    transactionStack: state.transactionStack,
  };
};

export default drizzleConnect(BigBetPagejs, mapStateToProps);
