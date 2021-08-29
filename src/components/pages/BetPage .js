import React, { Component } from "react";
// test
import { drizzleConnect } from "@drizzle/react-plugin";
import PropTypes from "prop-types";
import Split from "../layout/Split";
import web3 from "web3-utils";
import { Box, Flex } from "@rebass/grid";
import Logo from "../basics/Logo";
import Text from "../basics/Text";
import Form from "../basics/Form.js";
import { G } from "../basics/Colors";
import { autoBind } from "react-extras";
import ButtonEthScan from "../basics/ButtonEthScan.js";
import Input from "../basics/Input.js";
import Button from "../basics/Button.js";
import ButtonI from "../basics/ButtonI.js";
import TruncatedAddress from "../basics/TruncatedAddress.js";
import VBackgroundCom from "../basics/VBackgroundCom";
import BettingContract from "../../contracts/solidityjson/Betting.json";
import TokenContract from "../../contracts/solidityjson/Token.json";

var moment = require("moment");

class BetPagejs extends Component {
  constructor(props, context) {
    super(props);
    autoBind(this);

    this.contracts = context.drizzle.contracts;
    this.web3 = web3;
    this.betHistory = [];
    this.currentOfferts = [];
    this.takekeys = {};

    this.state = {
      betAmount: "",
      fundAmount: "",
      wdAmount: "",
      sharesToSell: "",
      teamPick: null,
      matchPick: null,
      showDecimalOdds: false
    };
  }

  componentDidMount() {
    document.title = "Bet Page";
    this.getbetHistoryArray();
    setInterval(() => {
      this.findValues();
    //  this.getbetHistoryArray();
    //  this.checkRedeem();
  }, 1000);
  }


  handleBetSize(betAmount) {
    this.setState({ betAmount });
  }

  handleBettorFund(value) {
    this.setState({
      fundAmount: value,
    });
  }

  handleOddsChange(value) {
    this.setState({
      fundAmount: value,
    });
  }

  handleBettorWD(value2) {
    this.setState({
      wdAmount: value2,
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

  takeBet() {
    const stackId = this.contracts[
      "BettingMain"
    ].methods.takeRegularBet.cacheSend(
      this.state.matchPick,
      this.state.teamPick,
      web3.toWei(this.state.betAmount, "finney"),
      {
        from: this.props.accounts[0],
        type: "0x2",
      }
    );
  }

  redeemBet(x) {
    const stackId = this.contracts["BettingMain"].methods.redeem.cacheSend(x, {
      from: this.props.accounts[0],
      type: "0x2",
    });
    setTimeout(this.getbetHistoryArray(), 5000);
  }

  switchOdds() {
    this.setState({ showDecimalOdds: !this.state.showDecimalOdds });
  }

  openEtherscan(txhash) {
    const url = "https://rinkeby.etherscan.io/tx/" + txhash;
    const urltest = "https://rinkeby.etherscan.io/tx/" + txhash;
    window.open(urltest, "_blank");
  }

  handletakeBookTeam(teamPick) {
    this.setState({ teamPick });
  }

  getbetHistoryArray() {
    const web3b = this.context.drizzle.web3;
    const contractweb3b = new web3b.eth.Contract(
      BettingContract.abi,
      BettingContract.address
    );
    var eventdata = [];
    var takes = {};

    contractweb3b
      .getPastEvents("BetRecord", {
        fromBlock: 8999000,
        toBlock: 'latest',
        filter: {bettor: this.props.accounts[0]}
      })
      .then(
        function (events) {
          events.forEach(function (element) {
            eventdata.push({
              Hashoutput: element.returnValues.contractHash,
              BettorAddress: element.returnValues.bettor,
              Epoch: element.returnValues.epoch,
              timestamp: element.blockNumber.timestamp,
              BetSize: Number(web3.fromWei(element.returnValues.betsize,
              "finney"
            )),
              LongPick: Number(element.returnValues.pick),
              MatchNum: element.returnValues.matchnum,
              Payoff: Number(web3.fromWei(element.returnValues.payoff,
              "finney"
            ))
            });
            takes[element.returnValues.contractHash] = this.contracts[
            "BettingMain"
          ].methods.checkRedeem.cacheCall(element.returnValues.contractHash);
          }, this);
          this.betHistory[0] = eventdata;
          this.takekeys = takes;
        }.bind(this)
      );

    // contractweb3b.events.BetRecord(
    //   function (error, log) {
    //     console.log({ log });
    //     this.betHistory[0].push({
    //       Hashoutput: log.returnValues.contractHash,
    //       BettorAddress: log.returnValues.bettor,
    //       Epoch: log.returnValues.epoch,
    //       timestamp: log.blockNumber.timestamp,
    //       BetSize: Number(web3.fromWei(log.returnValues.betsize,
    //       "finney"
    //     )),
    //       LongPick: Number(log.returnValues.pick),
    //       MatchNum: log.returnValues.matchnum,
    //       Payoff: Number(web3.fromWei(log.returnValues.payoff,
    //       "finney"
    //     )),
    //     });
    //     this.takekeys[log.returnValues.contractHash] = this.contracts[
    //   "BettingMain"
    // ].methods.checkRedeem.cacheCall(log.returnValues.contractHash)
    //   }.bind(this)
    // );
  }

  radioFavePick(teampic) {
    this.setState({ matchPick: teampic, teamPick: 0 });
  }

  radioUnderPick(teampic) {
    this.setState({ matchPick: teampic, teamPick: 1 });
  }

  findValues() {

    this.minBetKey = this.contracts["BettingMain"].methods.minBet.cacheCall();

    this.decOddsKey = this.contracts[
      "BettingMain"
    ].methods.showDecimalOdds.cacheCall();

    this.bets0Key = this.contracts["BettingMain"].methods.showLongs.cacheCall(
      0
    );

    this.bets1Key = this.contracts["BettingMain"].methods.showLongs.cacheCall(
      1
    );

    this.tokenKey = this.contracts["TokenMain"].methods.balanceOf.cacheCall("0x53d62FDa36599B2974C8878735B26cE513F0De3E");

    this.userBalKey = this.contracts[
      "BettingMain"
    ].methods.userBalance.cacheCall(this.props.accounts[0]);
    this.payoffsHomeKey = this.contracts[
      "BettingMain"
    ].methods.showPayout.cacheCall(0);

    this.payoffsAwayKey = this.contracts[
      "BettingMain"
    ].methods.showPayout.cacheCall(1);

    this.concKey = this.contracts[
      "BettingMain"
    ].methods.concentrationLimit.cacheCall();

    this.startTimeKey = this.contracts[
      "BettingMain"
    ].methods.showStartTime.cacheCall();

    this.sharesKey = this.contracts["BettingMain"].methods.lpStruct.cacheCall(
      this.props.accounts[0]
    );

    this.weekKey = this.contracts["BettingMain"].methods.betEpoch.cacheCall();

    this.usedKey = this.contracts["BettingMain"].methods.margin.cacheCall(1);

    this.unusedKey = this.contracts["BettingMain"].methods.margin.cacheCall(0);

    this.scheduleStringKey = this.contracts[
      "BettingMain"
    ].methods.showSchedString.cacheCall();

  }


  getMaxSize(unused0, used0, climit0, long0) {
    let unused = Number(unused0);
    let used = Number(used0);
    let climit = Number(climit0);
    let long = Number(long0);
    let maxSize = (unused + used) / climit - long;
    let maxSize2 = unused;
    if (maxSize2 < maxSize) {
      maxSize = maxSize2;
    }
    return maxSize;
  }


  getMoneyLine(decOddsi) {
    let moneyline = 0;
    if (decOddsi < 1000) {
      moneyline = -1e5 / (decOddsi * 0.95);
    } else {
      moneyline = (0.95 * decOddsi) / 10;
    }
    moneyline = moneyline.toFixed(0);
    if (moneyline > 0) {
      moneyline = "+" + moneyline;
    }
    return moneyline;
  }


  render() {

    let subcontracts = {};
    Object.keys(this.takekeys).forEach(function (id) {
      if (this.takekeys[id] in this.props.contracts["BettingMain"].checkRedeem) {
        subcontracts[id] = this.props.contracts["BettingMain"].checkRedeem[
          this.takekeys[id]
        ].value;
      }
    }, this);

    let concentrationLimit = 0;
    if (
      this.concKey in this.props.contracts["BettingMain"].concentrationLimit
    ) {
      concentrationLimit = this.props.contracts["BettingMain"]
        .concentrationLimit[this.concKey].value;
    }

    let currW4 = 0;
    if (
      this.weekKey in this.props.contracts["BettingMain"].betEpoch
    ) {
      currW4 = this.props.contracts["BettingMain"]
        .betEpoch[this.weekKey].value;
    }

    let minBet = 0;
    if (this.minBetKey in this.props.contracts["BettingMain"].minBet) {
      minBet = this.props.contracts["BettingMain"].minBet[this.minBetKey].value;
    }

    let unusedCapital = "0";
    if (this.unusedKey in this.props.contracts["BettingMain"].margin) {
      let unusedCapital0 = this.props.contracts["BettingMain"].margin[
        this.unusedKey
      ].value;
      if (unusedCapital0) {
        unusedCapital = web3.fromWei(unusedCapital0.toString(), "szabo");
      }
    }

    let tokenAmount = "0";
    if (this.tokenKey in this.props.contracts["TokenMain"].balanceOf) {
      let ta = this.props.contracts["TokenMain"].balanceOf[
        this.tokenKey
      ].value;
      if (ta) {
        tokenAmount = web3.fromWei(ta.toString(), "ether");
      }
    }

    let usedCapital = "0";
    if (this.usedKey in this.props.contracts["BettingMain"].margin) {
      let usedCapital0 = this.props.contracts["BettingMain"].margin[
        this.usedKey
      ].value;
      if (usedCapital0) {
        usedCapital = web3.fromWei(usedCapital0.toString(), "szabo");
      }
    }

    let startTimeColumn = [];
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

    let decOdds0 = [];
    if (
      this.decOddsKey in this.props.contracts["BettingMain"].showDecimalOdds
    ) {
      let d0 = this.props.contracts["BettingMain"].showDecimalOdds[
        this.decOddsKey
      ].value;
      if (d0) {
        decOdds0 = d0;
      }
    }

    let bets0 = [];
    if (this.bets0Key in this.props.contracts["BettingMain"].showLongs) {
      let b0 = this.props.contracts["BettingMain"].showLongs[this.bets0Key]
        .value;
      if (b0) {
        bets0 = b0;
      }
    }

    let bets1 = [];
    if (this.bets1Key in this.props.contracts["BettingMain"].showLongs) {
      let b1 = this.props.contracts["BettingMain"].showLongs[this.bets1Key]
        .value;
      if (b1) {
        bets1 = b1;
      }
    }

    let payoff0 = [];
    if (this.payoffsHomeKey in this.props.contracts["BettingMain"].showPayout) {
      let p0 = this.props.contracts["BettingMain"].showPayout[
        this.payoffsHomeKey
      ].value;
      if (p0) {
        payoff0 = p0;
      }
    }

    let payoff1 = [];
    if (this.payoffsAwayKey in this.props.contracts["BettingMain"].showPayout) {
      let p1 = this.props.contracts["BettingMain"].showPayout[
        this.payoffsAwayKey
      ].value;
      if (p1) {
        payoff1 = p1;
      }
    }

    let scheduleString = [
      "NFL:ARI:LAC",
      "NFL:ATL:LAR",
      "NFL:BAL:MIA",
      "NFL:BUF:MIN",
      "NFL:CAR:NE",
      "NFL:CHI:NO",
      "NFL:CIN:NYG",
      "NFL:CLE:NYJ",
      "NFL:DAL:OAK",
      "NFL:DEN:PHI",
      "NFL:DET:PIT",
      "NFL:GB:SEA",
      "NFL:HOU:SF",
      "NFL:IND:TB",
      "NFL:JAX:TEN",
      "NFL:KC:WSH",
      "UFC:Holloway:Kattar",
      "UFC:Ponzinibbio:Li",
      "UFC:Kelleher:Simon",
      "UFC:Hernandez:Vieria",
      "UFC:Akhemedov:Breese",
      "UFC:Memphis:Brooklyn",
      "UFC:Boston:Charlotte",
      "UFC:Milwaukee:Dallas",
      "UFC:miami:LALakers",
      "UFC:Atlanta:SanAntonia",
      "NHL:Colorado:Washington",
      "NHL:Vegas:StLouis",
      "NHL:TampaBay:Dallas",
      "NHL:Boston:Carolina",
      "NHL:Philadelphia:Edmonton",
      "NHL:Pittsburgh:NYIslanders",
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



    let liab0 = [];
    let liab1 = [];





    for (let ii = 0; ii < 32; ii++) {
      liab0[ii] = (Number(payoff0[ii]) - Number(bets1[ii])) / 1e12;
      liab1[ii] = (Number(payoff1[ii]) - Number(bets0[ii])) / 1e12;
    }

    let netLiab = [];
    netLiab = [liab0, liab1];

    let oddsTot = [liab0, liab1];
    for (let ii = 0; ii < 32; ii++) {
      oddsTot[0][ii] = Number(decOdds0[ii]);
      oddsTot[1][ii] = 1e6 / (Number(decOdds0[ii]) + 45) - 45;
    }

    let userBalance = "0";
    if (this.userBalKey in this.props.contracts["BettingMain"].userBalance) {
      let ub = this.props.contracts["BettingMain"].userBalance[this.userBalKey]
        .value;
      if (ub) {
        userBalance = web3.fromWei(ub, "finney");
      }
    }



    let teamSplit = [];
    let faveSplit = [];
    let underSplit = [];
    let sport = [];

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
              : this.getMoneyLine(oddsTot[0][i])}
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
                      href="/bigbetpage"
                      target="_blank"
                    >
                      Go to Big Bet Page
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
                <Text>{Number(userBalance).toFixed(3)}</Text>
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
                  mt="20px"
                  flexDirection="row"
                  justifyContent="space-between"
                ></Flex>
                <Flex
                  style={{
                    borderTop: `thin solid ${G}`,
                  }}
                ></Flex>
              </Box>
                <button
                    style={{
                      backgroundColor: "#424242",
                      borderRadius: "2px",
                      cursor: "pointer",
                    }}
                    onClick={() => this.getbetHistoryArray()}
                  >
                    Refresh Bet History
                </button>{" "}
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
              <Box>
                <Flex>
                  {Object.keys(this.betHistory).map((id) => (
                    <div key={id} style={{ width: "100%", float: "left" }}>
                      <Text> Your active bets</Text>
                      <br />
                      <table style={{ width: "100%", fontSize: "12px" }}>
                        <tbody>
                          <tr style={{ width: "33%" }}>
                            <td>Epoch</td>
                            <td>Match</td>
                            <td>Pick</td>
                            <td>BetSize</td>
                            <td>DecOdds</td>
                          </tr>
                          {this.betHistory[id].map(
                            (event, index) =>
                              event.Epoch === currW4 && (
                                <tr key={index} style={{ width: "33%" }}>
                                  <td>{event.Epoch}</td>
                                  <td>{teamSplit[event.MatchNum][0]}</td>
                                  <td>
                                    {teamSplit[event.MatchNum][event.LongPick + 1]}
                                  </td>
                                  <td>
                                  {parseFloat(event.BetSize).toFixed(2)}
                                  </td>
                                  <td>{Number(event.Payoff/event.BetSize+1).toFixed(3)}</td>
                                </tr>
                              )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </Flex>
              </Box>
              <Box>
                <Flex
                  mt="20px"
                  flexDirection="row"
                  justifyContent="space-between"
                ></Flex>
                <Flex
                  style={{
                    borderTop: `thin solid ${G}`,
                  }}
                ></Flex>
              </Box>
              <Box>
                  <Flex>
                    {Object.keys(this.betHistory).map((id) => (
                      <div key={id} style={{ width: "100%", float: "left" }}>
                        <Text size="15px">
                          Active Epoch: {currW4}
                        </Text>
                        <br />
                        <Text> Your unclaimed winning bets</Text>
                        <br />
                        <table
                          style={{
                            width: "100%",
                            fontSize: "12px",
                            float: "left",
                          }}
                        >
                          <tbody>
                            <tr style={{ width: "33%" }}>
                              <td>Epoch</td>
                              <td>Match</td>
                              <td>Pick</td>
                              <td>Your Payout</td>
                              <td>Click to Claim</td>
                            </tr>
                            {this.betHistory[id].map(
                              (event, index) =>
                          //    (event.Epoch != currW4) && (
                              subcontracts[event.Hashoutput] && (
                                  <tr key={index} style={{ width: "33%" }}>
                                    <td>{event.Epoch}</td>
                                    <td>{teamSplit[event.MatchNum][0]}</td>
                                    <td>
                                      {
                                        teamSplit[event.MatchNum][
                                          event.LongPick + 1
                                        ]
                                      }
                                    </td>
                                    <td>
                                    {(
                                      (950 * Number(event.Payoff)) / 1e3 +
                                      Number(event.BetSize)
                                    ).toFixed(3)}
                                    </td>
                                    <td>
                                      <button
                                        style={{
                                          backgroundColor: "#424242",
                                          borderRadius: "2px",
                                          cursor: "pointer",
                                        }}
                                        value={event.Hashoutput}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          this.redeemBet(event.Hashoutput);
                                        }}
                                      >
                                        Redeem
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

              </Box>
              <Box>
                <Flex
                  mt="20px"
                  flexDirection="row"
                  justifyContent="space-between"
                ></Flex>

                </Box>

              <Flex>

              <Text size="14px">
                {"Your unused margin: " +
                  Number(userBalance).toFixed(3) +
                  " finney"}
              </Text>
              </Flex>
              <Flex
                mt="5px"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
              >


                <Box>
                  <Form
                    onChange={this.handleBettorWD}
                    value={this.state.wdAmount}
                    onSubmit={this.withdrawBettor}
                    mb="20px"
                    justifyContent="flex-start"
                    buttonWidth="95px"
                    inputWidth="210px"
                    borderRadius="2px"
                    placeholder="eth"
                    buttonLabel="WithDraw"
                  />
                </Box>

                <Box mt="10px" mb="10px" ml="80px" mr="80px"></Box>
              </Flex>

              <Box>
                <Flex
                  mt="20px"
                  flexDirection="row"
                  justifyContent="space-between"
                ></Flex>
                <Flex
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

                  <Box mt="10px" mb="10px" ml="80px" mr="80px"></Box>
                </Box>
              </Box>

              <Flex>
              <Text size="14px">
                {"matching tokens in contract: " +
                  Number(tokenAmount).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
              </Text>
              </Flex>
              <Flex
                mt="5px"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
              >
                <Box>
                  <Form
                    onChange={this.changeOdds}
                    value={this.state.mlodds}
                    onSubmit={this.fundBettor}
                    mb="20px"
                    justifyContent="flex-start"
                    buttonWidth="95px"
                    inputWidth="210px"
                    borderRadius="2px"
                    placeholder="eth"
                    buttonLabel="Fund"
                  />
                </Box>
              </Flex>
            </Box>
          }
        >
          <Flex justifyContent="center">
            <Text size="25px">Place Bets Here</Text>
          </Flex>
          <Box mt="15px" mx="30px">
            <Flex width="100%" justifyContent="marginLeft">
              <Text size="14px" weight="300">
                {" "}
                Toggle radio button on the team/player you want to bet on to
                win. Enter eths bet in the box (eg, 1.123). Prior wins, tie, or
                cancelled bets are redeemable on the left panel. This sends eth
                directly to your eth address. Scroll down to see all of the
                week's contests.
              </Text>
            </Flex>
          </Box>

          <Box mt="15px" mx="30px"></Box>

          <Flex
            mt="10px"
            pt="10px"
            alignItems="center"
            style={{
              borderTop: `thin solid ${G}`,
            }}
          ></Flex>
          {this.state.teamPick != null ? (
            <Flex
              mt="5px"
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="center"
            >
              <Text size="16px" weight="400" style={{ paddingLeft: "10px" }}>
                Bet Amount
              </Text>

              <Input
                onChange={({ target: { value } }) => this.handleBetSize(value)}
                width="100px"
                placeholder={"Enter Eths"}
                marginLeft="10px"
                marginRignt="5px"
                value={this.state.betAmount}
              />
              <Box mt="10px" mb="10px">
                <Button
                  style={{
                    height: "30px",
                    width: "100px",
                    float: "right",
                    marginLeft: "5px",
                  }}
                  onClick={() => this.takeBet()}
                >
                  Bet Now{" "}
                </Button>{" "}
              </Box>

              <Box mt="10px" mb="10px" ml="40px" mr="80px"></Box>
            </Flex>
          ) : null}

          <Box>
            {" "}
            <Flex
              mt="20px"
              flexDirection="row"
              justifyContent="space-between"
            ></Flex>
          </Box>

          <Flex
            style={{
              color: "#0099ff",
              fontSize: "13px",
            }}
          >
            {this.state.teamPick != null ? (
              <Text size="16px" weight="400">
                pick: {teamSplit[this.state.matchPick][this.state.teamPick + 1]}
                {"  "}
                Odds:{" "}
                {(
                  (0.95 * oddsTot[this.state.teamPick][this.state.matchPick]) /
                    1000 +
                  1
                ).toFixed(3)}
                {" (MoneyLine "}
                {this.getMoneyLine(
                  oddsTot[this.state.teamPick][this.state.matchPick]
                )}
                {"),  "}
                MaxBet:{" "}
                {parseFloat(
                  this.getMaxSize(
                    unusedCapital,
                    usedCapital,
                    concentrationLimit,
                    netLiab[this.state.teamPick][this.state.matchPick]
                  ) / 1e3
                ).toFixed(2)}
                {"  "}
                opponent:{" "}
                {teamSplit[this.state.matchPick][2 - this.state.teamPick]}
                {"  "}
                Odds:{" "}
                {(
                  (0.95 *
                    oddsTot[1 - this.state.teamPick][this.state.matchPick]) /
                    1000 +
                  1
                ).toFixed(3)}
                {"  "}
                MoneyLine:{" "}
                {this.getMoneyLine(
                  oddsTot[1 - this.state.teamPick][this.state.matchPick]
                )}
              </Text>
            ) : null}
          </Flex>

          <Box>
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
                  );
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

BetPagejs.contextTypes = {
  drizzle: PropTypes.object,
};

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = (state) => {
  return {
    accounts: state.accounts,
    contracts: state.contracts,
    drizzleStatus: state.drizzleStatus,
    transactions: state.transactions,
    transactionStack: state.transactionStack,
  };
};

export default drizzleConnect(BetPagejs, mapStateToProps);
